import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowRight,
  Bell,
  Briefcase,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import {
  PORTAL_TRANSLATIONS,
  translateRole,
  translateSlaLabel,
  translateStatus,
  translateTimelineLabel,
} from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { authFetch, clearAuthToken, getAuthToken } from '../lib/authClient';
import {
  buildCaseHistoryCsv,
  buildCaseReportDocument,
  buildReportExportFilename,
  buildSingleCaseCertificateData,
  canCustomerRequestRecheck,
  CASE_SCENARIO_TEMPLATES,
  classifyCaseTransitionAlert,
  computeCaseSla,
  computeCaseStats,
  computeWorkspaceAlertSummary,
  computeWorkspaceSummaryMetrics,
  evaluateCaseReadiness,
  filterAndSortInvoices,
  filterWorkspaceCases,
  formatCurrencyUsd,
  formatFileSizeLabel,
  getPendingThresholdPreset,
  isCaseRemovedTransition,
  mergeWorkspaceToastAlerts,
  SERVICE_PACKAGES,
  type ComplaintType,
  type EvidenceCategory,
  type InvoiceRecord,
  type PaymentSubmission,
  type PendingThresholdPresetId,
  type ProtectionCase,
  type TriageIssueCategory,
  type WorkspaceCaseAlert,
} from '../lib/caseLogic';
import {
  generateCaseReportPdfBlob,
  generateSingleCaseCertificatePdfBlob,
  triggerBlobDownload,
} from '../lib/caseReportPdf';
import { BrandLogoMark } from './BrandLogoMark';
import { CaseJourneyIndicator } from './CaseJourneyIndicator';
import { CasePhaseTracker, type CustomerWsStatus } from './CasePhaseTracker';
import { FilePreviewModal } from './FilePreviewModal';
import { PortalLanguageSwitcher } from './PortalLanguageSwitcher';
import {
  PrintableCertificateModal,
  triggerCertificatePrint,
} from './PrintableCertificateModal';
import { QuickJumpModal } from './QuickJumpModal';
import { RemovalConfirmedBadge, RemovalSealIcon } from './RemovalSuccessAnimation';
import { WorkspaceAlertBell, WorkspaceToastStack } from './WorkspaceAlertCenter';

interface WorkspacePageProps {
  onNavigate: (path: string) => void;
  lang?: LangCode;
  onChangeLang?: (lang: LangCode) => void;
}

type WorkspaceTab =
  | 'overview'
  | 'cases'
  | 'submit'
  | 'packages'
  | 'billing'
  | 'support'
  | 'notifications'
  | 'account';

interface WorkspacePayload {
  user: {
    email: string;
    name: string;
    phone: string;
    role: string;
    id_document_name?: string;
    face_photo_name?: string;
  };
  stats: {
    total: number;
    inProgress: number;
    resolved: number;
    needsAttention: number;
  };
  cases: ProtectionCase[];
  recentActivity: {
    id: string;
    activity_type: string;
    message: string;
    case_number: string;
    created_at: string;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    read: boolean;
    created_at: string;
  }[];
  invoices: InvoiceRecord[];
  payments: PaymentSubmission[];
  supportTickets: {
    id: string;
    ticket_number: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    updated_at: string;
    messages: {
      id: string;
      sender_role: string;
      sender_email: string;
      message: string;
      created_at: string;
    }[];
  }[];
  dataRequests: {
    id: string;
    type: string;
    notes: string;
    status: string;
    created_at: string;
  }[];
}

function statusTextTone(status: string): string {
  switch (status) {
    case 'resolved':
    case 'closed':
    case 'paid':
    case 'approved':
    case 'confirmed_removed':
    case 'action_taken':
      return 'text-emerald-700';
    case 'rejected':
    case 'disputed':
      return 'text-rose-700';
    case 'needs_information':
    case 'pending_review':
    case 'overdue':
    case 'unpaid':
      return 'text-amber-700';
    case 'submitted_to_platform':
    case 'reviewing':
    case 'under_review':
      return 'text-[#0057B8]';
    default:
      return 'text-slate-600';
  }
}

export function WorkspacePage({
  onNavigate,
  lang = 'en',
  onChangeLang,
}: WorkspacePageProps) {
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<WorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [wsStatus, setWsStatus] = useState<CustomerWsStatus>('connecting');
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = useState<string | null>(null);
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(null);
  const [pendingThresholdPresetId, setPendingThresholdPresetId] =
    useState<PendingThresholdPresetId>('standard');
  const [liveToastAlerts, setLiveToastAlerts] = useState<WorkspaceCaseAlert[]>([]);
  const [celebratedRemovedIds, setCelebratedRemovedIds] = useState<Record<string, boolean>>({});
  const casesByIdRef = useRef<Map<string, ProtectionCase>>(new Map());
  const pendingPresetRef = useRef<PendingThresholdPresetId>('standard');
  pendingPresetRef.current = pendingThresholdPresetId;

  const triggerRemovedCelebration = useCallback((caseId: string) => {
    setCelebratedRemovedIds((prev) => (prev[caseId] ? prev : { ...prev, [caseId]: true }));
  }, []);

  const t = PORTAL_TRANSLATIONS[lang];
  const langRef = useRef<LangCode>(lang);
  langRef.current = lang;

  // Filters & active modals
  const [caseQuery, setCaseQuery] = useState('');
  const [activeOnlyCases, setActiveOnlyCases] = useState(false);
  const [caseSort, setCaseSort] = useState<'newest' | 'oldest' | 'case_az' | 'status'>('newest');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseModalSection, setCaseModalSection] = useState<'timeline' | 'evidence' | 'messages'>(
    'timeline'
  );
  const [caseReply, setCaseReply] = useState('');
  const [recheckOpen, setRecheckOpen] = useState(false);
  const [recheckReason, setRecheckReason] = useState('');
  const [recheckUrl, setRecheckUrl] = useState('');
  const [recheckBusy, setRecheckBusy] = useState(false);

  useEffect(() => {
    setRecheckOpen(false);
    setRecheckReason('');
    setRecheckUrl('');
  }, [selectedCaseId]);

  // Evidence upload state inside modal
  const evFileInputRef = useRef<HTMLInputElement | null>(null);
  const [evTitle, setEvTitle] = useState('');
  const [evCategory, setEvCategory] = useState<EvidenceCategory>('screenshot');
  const [evUrl, setEvUrl] = useState('');
  const [evFile, setEvFile] = useState('');
  const [evBase64, setEvBase64] = useState('');
  const [evMimeType, setEvMimeType] = useState('');
  const [evFileSize, setEvFileSize] = useState(0);
  const [evNotes, setEvNotes] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [printableReportCases, setPrintableReportCases] = useState<ProtectionCase[] | null>(null);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  useEffect(() => {
    const onShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickJumpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  // New Case Form
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('Instagram');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<ComplaintType>('impersonation');
  const [newDesc, setNewDesc] = useState('');

  // Billing & Invoice Statement Modal
  const [invQuery, setInvQuery] = useState('');
  const [invSort, setInvSort] = useState<
    'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'status'
  >('newest');
  const [pkgCaseId, setPkgCaseId] = useState('');
  const [pkgCode, setPkgCode] = useState(SERVICE_PACKAGES[0].code);
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'cash' | 'manual'>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardBusy, setCardBusy] = useState(false);
  const [statementInvoice, setStatementInvoice] = useState<InvoiceRecord | null>(null);

  // Support
  const [supSubject, setSupSubject] = useState('');
  const [supCategory, setSupCategory] = useState('takedown');
  const [supPriority, setSupPriority] = useState('normal');
  const [supMsg, setSupMsg] = useState('');
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Account & Governance
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [idDocName, setIdDocName] = useState('');
  const [facePhotoName, setFacePhotoName] = useState('');
  const [drType, setDrType] = useState<'export' | 'deletion'>('export');
  const [drNotes, setDrNotes] = useState('');

  const loadWorkspace = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await authFetch('/api/workspace');
        if (res.status === 401) {
          onNavigate('/login');
          return;
        }
        const json = (await res.json()) as WorkspacePayload;
        const preset = getPendingThresholdPreset(pendingPresetRef.current);
        const thresholds = {
          highPriorityHours: preset.highPriorityHours,
          urgentHours: preset.urgentHours,
        };
        if (casesByIdRef.current.size > 0) {
          const triggered: WorkspaceCaseAlert[] = [];
          for (const nextCase of json.cases) {
            const prevCase = casesByIdRef.current.get(nextCase.id);
            if (isCaseRemovedTransition(prevCase, nextCase)) {
              triggerRemovedCelebration(nextCase.id);
            }
            const alert = classifyCaseTransitionAlert(prevCase, nextCase, thresholds);
            if (alert) triggered.push(alert);
          }
          if (triggered.length > 0) {
            setLiveToastAlerts((prev) => {
              let next = prev;
              for (const alert of triggered) {
                next = mergeWorkspaceToastAlerts(next, alert);
              }
              return next;
            });
          }
        }
        casesByIdRef.current = new Map(json.cases.map((c) => [c.id, c]));

        setData(json);
        setProfName(json.user.name || '');
        setProfPhone(json.user.phone || '');
        setIdDocName(json.user.id_document_name || '');
        setFacePhotoName(json.user.face_photo_name || '');
        if (!pkgCaseId && json.cases.length > 0) {
          setPkgCaseId(json.cases[0].id);
        }
        const firstPayable = json.invoices.find((i) => i.status === 'unpaid');
        if (!payInvoiceId && firstPayable) {
          setPayInvoiceId(firstPayable.id);
        }
      } catch {
        setBanner({ kind: 'error', text: PORTAL_TRANSLATIONS[langRef.current].workspace.loadError });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [onNavigate, payInvoiceId, pkgCaseId, triggerRemovedCelebration]
  );

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Real-time customer notifications & case progression WebSocket
  useEffect(() => {
    let closedByUser = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let highlightTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closedByUser) return;
      setWsStatus((prev) => (prev === 'live' ? 'reconnecting' : 'connecting'));
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = getAuthToken();
      const wsUrl = `${protocol}//${window.location.host}/ws/customer-notifications${
        token ? `?token=${encodeURIComponent(token)}` : ''
      }`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsStatus('live');
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(String(evt.data));
          if (msg?.type === 'customer_ws:ready') {
            setWsStatus('live');
          } else if (msg?.type === 'notification:created' && msg.notification) {
            setLastLiveUpdateAt(new Date().toISOString());
            setData((prev) => {
              if (!prev) return prev;
              const exists = prev.notifications.some((n) => n.id === msg.notification.id);
              if (exists) return prev;
              return {
                ...prev,
                notifications: [msg.notification, ...prev.notifications],
              };
            });
          } else if (msg?.type === 'case:updated' && msg.case) {
            const updatedCase = msg.case as ProtectionCase;
            const nowIso = new Date().toISOString();
            setLastLiveUpdateAt(nowIso);
            setHighlightedCaseId(updatedCase.id);
            if (highlightTimer) clearTimeout(highlightTimer);
            highlightTimer = setTimeout(() => setHighlightedCaseId(null), 4000);

            const preset = getPendingThresholdPreset(pendingPresetRef.current);
            const prevCase = casesByIdRef.current.get(updatedCase.id);
            if (isCaseRemovedTransition(prevCase, updatedCase)) {
              triggerRemovedCelebration(updatedCase.id);
            }
            const transitionAlert = classifyCaseTransitionAlert(prevCase, updatedCase, {
              highPriorityHours: preset.highPriorityHours,
              urgentHours: preset.urgentHours,
            });
            casesByIdRef.current.set(updatedCase.id, updatedCase);
            if (transitionAlert) {
              setLiveToastAlerts((prev) => mergeWorkspaceToastAlerts(prev, transitionAlert));
            }

            setData((prev) => {
              if (!prev) return prev;
              const exists = prev.cases.some((c) => c.id === updatedCase.id);
              const nextCases = exists
                ? prev.cases.map((c) => (c.id === updatedCase.id ? updatedCase : c))
                : [updatedCase, ...prev.cases];
              return {
                ...prev,
                cases: nextCases,
                stats: computeCaseStats(nextCases),
              };
            });
          } else if (msg?.type === 'workspace:refresh') {
            setLastLiveUpdateAt(new Date().toISOString());
            loadWorkspace(true);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!closedByUser) {
          setWsStatus('reconnecting');
          reconnectTimer = setTimeout(connect, 4000);
        }
      };
    };

    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (highlightTimer) clearTimeout(highlightTimer);
      if (ws) ws.close();
    };
  }, [loadWorkspace, triggerRemovedCelebration]);

  const selectedCase = useMemo(
    () => data?.cases.find((c) => c.id === selectedCaseId) || null,
    [data, selectedCaseId]
  );

  const overviewCases = useMemo(
    () =>
      data
        ? filterWorkspaceCases(data.cases, {
            query: caseQuery,
            activeOnly: activeOnlyCases,
            sort: 'newest',
          })
        : [],
    [data, caseQuery, activeOnlyCases]
  );

  const visibleCases = useMemo(
    () =>
      data
        ? filterWorkspaceCases(data.cases, {
            query: caseQuery,
            activeOnly: activeOnlyCases,
            sort: caseSort,
          })
        : [],
    [data, caseQuery, activeOnlyCases, caseSort]
  );

  const visibleInvoices = useMemo(
    () => (data ? filterAndSortInvoices(data.invoices, invQuery, invSort) : []),
    [data, invQuery, invSort]
  );

  const unreadCount = useMemo(
    () => (data ? data.notifications.filter((n) => !n.read).length : 0),
    [data]
  );

  const summaryMetrics = useMemo(
    () => computeWorkspaceSummaryMetrics(data?.cases || []),
    [data?.cases]
  );

  const alertSummary = useMemo(() => {
    const preset = getPendingThresholdPreset(pendingThresholdPresetId);
    return computeWorkspaceAlertSummary(data?.cases || [], {
      highPriorityHours: preset.highPriorityHours,
      urgentHours: preset.urgentHours,
    });
  }, [data?.cases, pendingThresholdPresetId]);

  useEffect(() => {
    if (liveToastAlerts.length === 0) return;
    const timer = setTimeout(() => {
      setLiveToastAlerts((prev) => prev.slice(0, -1));
    }, 15000);
    return () => clearTimeout(timer);
  }, [liveToastAlerts]);

  const submitReadiness = useMemo(() => {
    const catMap: Record<ComplaintType, TriageIssueCategory> = {
      impersonation: 'impostor_account',
      deepfake: 'deepfake_video',
      extortion: 'video_extortion',
      copyright: 'copyright_protection',
      privacy: 'fake_website',
      harassment: 'impostor_account',
      other: 'impostor_account',
    };
    return evaluateCaseReadiness({
      issueCategory: catMap[newType] || 'impostor_account',
      platform: newPlatform || 'Instagram',
      hasDirectUrl: /^https?:\/\/.+/i.test(newUrl.trim()),
      hasOwnershipOrId: Boolean(data?.user.id_document_name || newDesc.trim().length >= 20),
      activeExtortionThreat: newType === 'extortion',
    });
  }, [data?.user.id_document_name, newDesc, newPlatform, newType, newUrl]);

  const handleSignOut = async () => {
    await authFetch('/api/auth/signout', { method: 'POST' });
    clearAuthToken();
    onNavigate('/');
  };

  const handleExportCaseReport = (
    format: 'csv' | 'pdf',
    targetCases: ProtectionCase[],
    scopeLabel: string = 'all'
  ) => {
    if (!data || targetCases.length === 0) {
      setBanner({ kind: 'error', text: t.common.noResults });
      return;
    }

    try {
      const preset = getPendingThresholdPreset(pendingThresholdPresetId);
      const thresholds = {
        highPriorityHours: preset.highPriorityHours,
        urgentHours: preset.urgentHours,
      };
      const filename = buildReportExportFilename(format, scopeLabel);

      if (format === 'csv') {
        const csvContent = buildCaseHistoryCsv({
          cases: targetCases,
          user: data.user,
          thresholds,
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerBlobDownload(blob, filename);
      } else {
        const docData = buildCaseReportDocument({
          cases: targetCases,
          user: data.user,
          thresholds,
        });
        const pdfBlob = generateCaseReportPdfBlob(docData);
        triggerBlobDownload(pdfBlob, filename);
      }

      setBanner({
        kind: 'success',
        text: `${format.toUpperCase()} (${filename})`,
      });
    } catch {
      setBanner({ kind: 'error', text: t.workspace.loadError });
    }
  };

  const handleDownloadCaseCertificate = (c: ProtectionCase) => {
    try {
      const certData = buildSingleCaseCertificateData(c);
      const pdfBlob = generateSingleCaseCertificatePdfBlob(certData);
      const filename = `FullRemove-Summary-${c.case_number}.pdf`;
      triggerBlobDownload(pdfBlob, filename);
      setBanner({
        kind: 'success',
        text: t.enhancements.certificate.toastDownloaded(c.case_number),
      });
    } catch {
      setBanner({ kind: 'error', text: t.workspace.loadError });
    }
  };

  const handleDownloadPrintReport = (targetCases: ProtectionCase[]) => {
    if (!targetCases || targetCases.length === 0) {
      setBanner({ kind: 'error', text: t.common.noResults });
      return;
    }
    flushSync(() => {
      setPrintableReportCases(targetCases);
    });
    triggerCertificatePrint();
  };

  const handleSubmitRecheck = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase || recheckBusy) return;
    setRecheckBusy(true);
    setBanner(null);
    try {
      const res = await authFetch(`/api/cases/${selectedCase.id}/reopen-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: recheckReason,
          reappeared_url: recheckUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
        return;
      }
      setBanner({
        kind: 'success',
        text: t.enhancements.recheck.successBanner(selectedCase.case_number),
      });
      setRecheckOpen(false);
      setRecheckReason('');
      setRecheckUrl('');
      await loadWorkspace(true);
    } catch {
      setBanner({ kind: 'error', text: t.workspace.loadError });
    } finally {
      setRecheckBusy(false);
    }
  };

  const handleCreateCase = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await authFetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        platform: newPlatform,
        source_url: newUrl,
        complaint_type: newType,
        description: newDesc,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.workspace.submitForm.createFailed });
      return;
    }
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setBanner({
      kind: 'success',
      text: t.workspace.submitForm.createdBanner(json.case.case_number),
    });
    setTab('cases');
    await loadWorkspace();
  };

  const clearStagedEvidenceFile = () => {
    setEvBase64('');
    setEvMimeType('');
    setEvFileSize(0);
    setEvFile('');
    setPreviewModalOpen(false);
    if (evFileInputRef.current) {
      evFileInputRef.current.value = '';
    }
  };

  const handleEvidenceFilePick = (file: File | null) => {
    if (!file) {
      setEvBase64('');
      setEvMimeType('');
      setEvFileSize(0);
      setPreviewModalOpen(false);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setBanner({ kind: 'error', text: t.workspace.caseModal.attachFileLabel });
      if (evFileInputRef.current) {
        evFileInputRef.current.value = '';
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setEvBase64(base64);
      setEvMimeType(file.type || 'application/octet-stream');
      setEvFileSize(file.size);
      setEvFile(file.name);
      if (!evTitle.trim()) setEvTitle(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadEvidence = async (
    caseId: string,
    evidenceId: string,
    fallbackName: string
  ) => {
    try {
      const res = await authFetch(`/api/cases/${caseId}/evidence/${evidenceId}/download`);
      if (!res.ok) {
        setBanner({ kind: 'error', text: t.workspace.loadError });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fallbackName || 'evidence-file';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setBanner({ kind: 'error', text: t.workspace.loadError });
    }
  };

  const submitStagedEvidence = async () => {
    if (!selectedCase) return;
    if (!evTitle.trim()) {
      setBanner({ kind: 'error', text: t.workspace.caseModal.evTitlePlaceholder });
      return;
    }
    const res = await authFetch(`/api/cases/${selectedCase.id}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: evTitle,
        category: evCategory,
        reference_url: evUrl,
        file_name: evFile,
        file_content_base64: evBase64 || undefined,
        mime_type: evMimeType || undefined,
        notes: evNotes,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
      return;
    }
    setEvTitle('');
    setEvUrl('');
    setEvFile('');
    setEvBase64('');
    setEvMimeType('');
    setEvFileSize(0);
    setEvNotes('');
    setPreviewModalOpen(false);
    if (evFileInputRef.current) {
      evFileInputRef.current.value = '';
    }
    setBanner({
      kind: 'success',
      text: t.workspace.caseModal.evidenceSaved(json.evidence.sha256_preview),
    });
    await loadWorkspace();
  };

  const handleAddEvidence = async (e: FormEvent) => {
    e.preventDefault();
    await submitStagedEvidence();
  };

  const handleCaseReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !caseReply.trim()) return;
    const res = await authFetch(`/api/cases/${selectedCase.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: caseReply }),
    });
    if (res.ok) {
      setCaseReply('');
      setBanner({ kind: 'success', text: t.workspace.caseModal.messageSent });
      await loadWorkspace();
    }
  };

  const handleAttachPackage = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await authFetch('/api/billing/attach-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: pkgCaseId, service_code: pkgCode }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
      return;
    }
    setBanner({
      kind: 'success',
      text: t.workspace.packagesTab.invoiceGenerated(
        json.invoice.invoice_number,
        formatCurrencyUsd(json.invoice.amount_usd)
      ),
    });
    setPayInvoiceId(json.invoice.id);
    setTab('billing');
    await loadWorkspace();
  };

  const handleSubmitPayment = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const res = await authFetch('/api/billing/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: payInvoiceId,
        method: payMethod,
        reference: payRef,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
      return;
    }
    setPayRef('');
    setBanner({
      kind: 'success',
      text: t.workspace.billingTab.manualSuccess(json.payment.reference),
    });
    await loadWorkspace();
  };

  const handleInstantCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setCardBusy(true);
    try {
      const res = await authFetch('/api/billing/instant-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: payInvoiceId,
          cardholder_name: cardHolder,
          card_last4: cardLast4,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
        return;
      }
      setCardHolder('');
      setCardLast4('');
      setBanner({
        kind: 'success',
        text: t.workspace.billingTab.cardSuccess(json.payment.reference, json.invoice.invoice_number),
      });
      await loadWorkspace();
    } finally {
      setCardBusy(false);
    }
  };

  const handleCreateSupport = async (e: FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: supSubject,
        category: supCategory,
        priority: supPriority,
        message: supMsg,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.workspace.loadError });
      return;
    }
    setSupSubject('');
    setSupMsg('');
    setBanner({ kind: 'success', text: t.workspace.supportTab.createdBanner(json.ticket.ticket_number) });
    await loadWorkspace();
  };

  const handleTicketReply = async (ticketId: string) => {
    const text = (ticketReplies[ticketId] || '').trim();
    if (!text) return;
    const res = await authFetch(`/api/support/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (res.ok) {
      setTicketReplies((prev) => ({ ...prev, [ticketId]: '' }));
      setBanner({ kind: 'success', text: t.workspace.supportTab.replyPosted });
      await loadWorkspace();
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    await authFetch(`/api/notifications/${id}/read`, { method: 'POST' });
    await loadWorkspace();
  };

  const handleMarkAllRead = async () => {
    await authFetch('/api/notifications/mark-read', { method: 'POST' });
    await loadWorkspace();
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profName,
        phone: profPhone,
        id_document_name: idDocName,
        face_photo_name: facePhotoName,
      }),
    });
    if (res.ok) {
      setBanner({ kind: 'success', text: t.workspace.accountTab.profileSaved });
      await loadWorkspace();
    }
  };

  const handleDataRequest = async (e: FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/data-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: drType, notes: drNotes }),
    });
    if (res.ok) {
      setDrNotes('');
      setBanner({ kind: 'success', text: t.workspace.accountTab.requestSaved });
      await loadWorkspace();
    }
  };

  const navItems: {
    id: WorkspaceTab;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }[] = [
    { id: 'overview', label: t.workspace.nav.overview, icon: LayoutDashboard },
    { id: 'cases', label: t.workspace.nav.cases, icon: Briefcase, count: data?.cases.length },
    { id: 'submit', label: t.workspace.nav.submit, icon: FolderPlus },
    { id: 'packages', label: t.workspace.nav.packages, icon: Sparkles },
    {
      id: 'billing',
      label: t.workspace.nav.billing,
      icon: CreditCard,
      count: data?.invoices.filter((i) => i.status === 'unpaid').length,
    },
    { id: 'support', label: t.workspace.nav.support, icon: LifeBuoy, count: data?.supportTickets.length },
    { id: 'notifications', label: t.workspace.nav.notifications, icon: Bell, count: unreadCount },
    { id: 'account', label: t.workspace.nav.account, icon: UserCheck },
  ];

  const kpiCards = data
    ? [
        { label: t.workspace.kpis.total.label, value: data.stats.total, note: t.workspace.kpis.total.note },
        {
          label: t.workspace.kpis.inProgress.label,
          value: data.stats.inProgress,
          note: t.workspace.kpis.inProgress.note,
        },
        {
          label: t.workspace.kpis.needsAttention.label,
          value: data.stats.needsAttention,
          note: t.workspace.kpis.needsAttention.note,
        },
        { label: t.workspace.kpis.resolved.label, value: data.stats.resolved, note: t.workspace.kpis.resolved.note },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#041E4A] flex overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-[#041E4A]/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print fixed inset-y-0 start-0 z-30 w-64 shrink-0 border-e border-[#DCE7F2] bg-white flex flex-col justify-between transition-transform lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full'
        }`}
      >
        <div>
          <div className="flex h-14 items-center justify-between border-b border-[#DCE7F2] px-5">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center cursor-pointer"
            >
              <BrandLogoMark size="sm" tone="light" label={t.common.brand} />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label={t.common.close}
              className="text-slate-500 hover:text-[#041E4A] lg:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-3.5 border-b border-[#EFF5FA] bg-[#F7FAFC]">
            <div className="text-[11px] font-semibold text-[#00758A]">{t.workspace.roleLabel}</div>
            <div className="mt-1 truncate text-xs font-semibold text-[#041E4A]">
              {data?.user.name || t.common.loading}
            </div>
            <div className="truncate font-mono text-[11px] text-slate-500" dir="ltr">
              {data?.user.email || ''}
            </div>
          </div>

          <nav className="p-3 space-y-1" aria-label={t.workspace.roleLabel}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-[#EFF7FC] text-[#0057B8] font-semibold border border-[#0057B8]/25'
                      : 'text-slate-600 hover:bg-[#EFF5FA] hover:text-[#041E4A] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#0057B8]' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="font-mono text-[11px] tabular-nums text-slate-500">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#DCE7F2] p-3 space-y-1.5">
          {data && ['owner', 'admin', 'analyst', 'viewer'].includes(data.user.role) && (
            <button
              type="button"
              onClick={() => onNavigate('/staff')}
              className="flex w-full items-center justify-between rounded-xl border border-[#DCE7F2] px-3 py-2 text-start text-xs font-semibold text-[#00758A] hover:bg-[#EFF5FA] cursor-pointer"
            >
              <span>{t.workspace.switchToStaff}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t.common.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 flex flex-col ${printableReportCases ? 'no-print' : ''}`}>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-[#DCE7F2] bg-white/95 px-4 sm:px-6 backdrop-blur-md no-print">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-600 lg:hidden cursor-pointer"
              aria-label={t.workspace.openMenu}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-400">{t.workspace.breadcrumbRoot}</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="truncate font-semibold text-[#041E4A]">
                {navItems.find((n) => n.id === tab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="workspace-quick-jump-btn"
              onClick={() => setQuickJumpOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-[#041E4A] transition cursor-pointer shrink-0"
              title={`${t.enhancements.quickJump.buttonLabel} (Ctrl+K)`}
            >
              <Search className="h-3.5 w-3.5 text-[#0057B8]" />
              <span className="hidden md:inline">{t.enhancements.quickJump.buttonLabel}</span>
              <kbd
                dir="ltr"
                className="hidden sm:inline rounded border border-[#DCE7F2] bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500"
              >
                ⌘K
              </kbd>
            </button>
            {onChangeLang && <PortalLanguageSwitcher lang={lang} onChange={onChangeLang} />}
            {data && (
              <WorkspaceAlertBell
                lang={lang}
                alertSummary={alertSummary}
                liveAlerts={liveToastAlerts}
                unreadNotificationsCount={unreadCount}
                onOpenCase={(caseId, section = 'timeline') => {
                  setSelectedCaseId(caseId);
                  setCaseModalSection(section);
                }}
                onOpenNotificationsTab={() => setTab('notifications')}
              />
            )}
            <button
              type="button"
              onClick={() => setTab('submit')}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0057B8] px-3.5 text-xs font-semibold text-white hover:bg-[#004494] transition cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.workspace.newCaseBtn}
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          {banner && (
            <div
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-xs font-medium ${
                banner.kind === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                aria-label={t.common.close}
                onClick={() => setBanner(null)}
                className="text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {loading && !data ? (
            <div className="rounded-2xl border border-[#DCE7F2] bg-white p-8 text-xs text-slate-500 shadow-xs">
              {t.workspace.loadingText}
            </div>
          ) : (
            data && (
              <>
                {tab === 'overview' && (
                  <div className="space-y-6 min-w-0">
                    {/* High-level Workspace Summary Statistics Card */}
                    <section
                      aria-label={t.workspace.summary.title}
                      data-testid="workspace-summary-card"
                      className="min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-5 sm:p-6 space-y-5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFF5FA] pb-4">
                        <div className="min-w-0">
                          <h1 className="font-display text-lg font-bold text-[#041E4A]">
                            {t.workspace.summary.title}
                          </h1>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {t.workspace.summary.subtitle}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <span className="text-xs tabular-nums text-slate-500">
                            {t.workspace.summary.resolutionRate}{' '}
                            <span className="font-mono font-semibold text-emerald-700">
                              {summaryMetrics.completionRatePercent}%
                            </span>{' '}
                            ({t.workspace.summary.ofTotal(
                              summaryMetrics.resolvedCases,
                              summaryMetrics.totalCases
                            )})
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              data-testid="overview-download-report-btn"
                              disabled={data.cases.length === 0}
                              onClick={() =>
                                handleDownloadPrintReport(
                                  overviewCases.length > 0 ? overviewCases : data.cases
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#041E4A]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#041E4A] hover:border-[#0057B8]/40 hover:bg-[#F7FAFC] disabled:opacity-45 cursor-pointer"
                            >
                              <Printer className="h-3.5 w-3.5 text-[#0057B8]" />
                              <span>{t.enhancements.certificate.downloadReportBtn}</span>
                            </button>
                            <button
                              type="button"
                              data-testid="overview-export-csv-btn"
                              disabled={data.cases.length === 0}
                              onClick={() => handleExportCaseReport('csv', data.cases, 'all')}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-[#041E4A] disabled:opacity-45 cursor-pointer"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                              <span>{t.common.exportCsv}</span>
                            </button>
                            <button
                              type="button"
                              data-testid="overview-export-pdf-btn"
                              disabled={data.cases.length === 0}
                              onClick={() => handleExportCaseReport('pdf', data.cases, 'all')}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] disabled:opacity-45 cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{t.common.exportPdf}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid min-w-0 divide-y divide-[#DCE7F2] overflow-hidden rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] md:grid-cols-2 md:divide-x md:divide-y-0">
                        <div
                          data-testid="summary-active-cases"
                          className="min-w-0 p-5 flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {t.workspace.summary.activeCasesLabel}
                            </span>
                            <Briefcase className="h-4 w-4 text-[#0057B8] shrink-0" />
                          </div>
                          <div>
                            <div className="font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#041E4A]">
                              {summaryMetrics.activeCases}
                            </div>
                            <div className="mt-1.5 text-xs text-slate-500">
                              {t.workspace.summary.outOfTotal(summaryMetrics.totalCases)}
                              {summaryMetrics.needsAttentionCases > 0 && (
                                <>
                                  {' · '}
                                  <span className="text-amber-700 font-semibold">
                                    {t.workspace.summary.awaitingReply(
                                      summaryMetrics.needsAttentionCases
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          data-testid="summary-avg-turnaround"
                          className="min-w-0 p-5 flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {t.workspace.summary.avgTimeLabel}
                            </span>
                            <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                          </div>
                          <div>
                            <div
                              className="font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#041E4A]"
                              dir="ltr"
                            >
                              {summaryMetrics.averageTurnaroundLabel}
                            </div>
                            <div className="mt-1.5 text-xs text-slate-500">
                              {t.workspace.summary.acrossSubmissions(summaryMetrics.totalCases)}
                              {summaryMetrics.resolvedAverageLabel !== '—' && (
                                <>
                                  {' · '}
                                  <span className="font-medium text-emerald-700">
                                    {t.workspace.summary.resolvedAvg(
                                      summaryMetrics.resolvedAverageLabel
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {kpiCards.map((kpi) => (
                        <div
                          key={kpi.label}
                          className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs transition-colors duration-150 hover:border-[#C7D7E8]"
                        >
                          <div className="text-xs font-medium text-slate-500">{kpi.label}</div>
                          <div className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[#041E4A]">
                            {kpi.value}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{kpi.note}</div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Case Search & Active Filter Bar */}
                    <section
                      aria-label={t.workspace.search.overviewPlaceholder}
                      data-testid="overview-case-filter-bar"
                      className="min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="relative flex-1 min-w-0">
                        <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          data-testid="overview-case-search"
                          aria-label={t.workspace.search.overviewPlaceholder}
                          value={caseQuery}
                          onChange={(e) => setCaseQuery(e.target.value)}
                          placeholder={t.workspace.search.overviewPlaceholder}
                          className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] ps-9 pe-8 py-2 text-xs text-[#041E4A] placeholder-slate-400 outline-none focus:border-[#0057B8] focus:bg-white"
                        />
                        {caseQuery && (
                          <button
                            type="button"
                            data-testid="overview-case-search-clear"
                            aria-label={t.common.clear}
                            onClick={() => setCaseQuery('')}
                            className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          data-testid="overview-active-only-toggle"
                          aria-pressed={activeOnlyCases}
                          onClick={() => setActiveOnlyCases((prev) => !prev)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            activeOnlyCases
                              ? 'border-[#0057B8]/25 bg-[#EFF7FC] text-[#0057B8]'
                              : 'border-[#DCE7F2] bg-[#F7FAFC] text-slate-700 hover:border-slate-300 hover:text-[#041E4A]'
                          }`}
                        >
                          {activeOnlyCases
                            ? t.workspace.search.activeOnly
                            : t.workspace.search.allCases}
                        </button>
                        <span
                          data-testid="overview-case-match-count"
                          className="text-xs tabular-nums text-slate-500"
                        >
                          {t.workspace.search.shownCount(overviewCases.length, data.cases.length)}
                        </span>
                      </div>
                    </section>

                    <CasePhaseTracker
                      lang={lang}
                      mode="overview"
                      cases={overviewCases}
                      wsStatus={wsStatus}
                      lastLiveUpdateAt={lastLiveUpdateAt}
                      highlightedCaseId={highlightedCaseId}
                      celebratedRemovedIds={celebratedRemovedIds}
                      thresholdPresetId={pendingThresholdPresetId}
                      onChangeThresholdPresetId={setPendingThresholdPresetId}
                      onSelectCase={(id) => {
                        setSelectedCaseId(id);
                        setCaseModalSection('timeline');
                      }}
                    />

                    <div className="grid gap-6 lg:grid-cols-12 min-w-0">
                      <section
                        data-testid="overview-active-case-ledger"
                        className="min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-5 lg:col-span-7 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#EFF5FA] pb-3.5">
                          <h2 className="font-display text-sm font-bold text-[#041E4A]">
                            {t.workspace.overview.activeCasesTitle}
                          </h2>
                          <button
                            type="button"
                            onClick={() => setTab('cases')}
                            className="text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                          >
                            {t.common.viewAll}
                          </button>
                        </div>
                        <div className="mt-2 divide-y divide-[#EFF5FA]">
                          {overviewCases.length === 0 ? (
                            <div className="py-6 text-center space-y-2">
                              <p className="text-xs text-slate-500">
                                {t.workspace.search.noMatch(caseQuery || '—')}
                              </p>
                              {(caseQuery || activeOnlyCases) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCaseQuery('');
                                    setActiveOnlyCases(false);
                                  }}
                                  className="text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                                >
                                  {t.common.resetFilters}
                                </button>
                              )}
                            </div>
                          ) : (
                            overviewCases.slice(0, 5).map((c) => {
                              const sla = computeCaseSla(c);
                              const isRemovedCelebrated = Boolean(celebratedRemovedIds[c.id]);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCaseId(c.id);
                                    setCaseModalSection('timeline');
                                  }}
                                  className={`block w-full min-w-0 py-3.5 text-start hover:bg-slate-50/85 px-2 rounded-xl transition cursor-pointer ${
                                    isRemovedCelebrated
                                      ? 'border border-emerald-200 bg-emerald-50/35 animate-[frCaseRemovedGlow_1.8s_ease-out]'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-4 min-w-0">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span
                                          className="font-mono text-[#0057B8] font-semibold"
                                          dir="ltr"
                                        >
                                          {c.case_number}
                                        </span>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-slate-600">{c.platform}</span>
                                        {isRemovedCelebrated && (
                                          <RemovalConfirmedBadge label={t.workspace.alerts.removedBadge} />
                                        )}
                                      </div>
                                      <div className="mt-0.5 truncate text-sm font-semibold text-[#041E4A]">
                                        {c.title}
                                      </div>
                                    </div>
                                    <div className="shrink-0 text-end">
                                      <div
                                        className={`text-xs font-semibold ${statusTextTone(c.status)}`}
                                      >
                                        {translateStatus(c.status, lang)}
                                      </div>
                                      <div className="mt-0.5 text-[11px] text-slate-500">
                                        {translateSlaLabel(sla, lang)}
                                      </div>
                                    </div>
                                  </div>
                                  <CaseJourneyIndicator
                                    lang={lang}
                                    caseItem={c}
                                    variant="compact"
                                    celebrateRemoved={isRemovedCelebrated}
                                  />
                                </button>
                              );
                            })
                          )}
                        </div>
                      </section>

                      <section className="min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-5 lg:col-span-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#EFF5FA] pb-3.5">
                          <h2 className="font-display text-sm font-bold text-[#041E4A]">
                            {t.workspace.overview.recentUpdatesTitle}
                          </h2>
                        </div>
                        <div className="mt-3 space-y-3">
                          {data.recentActivity.length === 0 ? (
                            <p className="text-xs text-slate-500">
                              {t.workspace.overview.noActivityYet}
                            </p>
                          ) : (
                            data.recentActivity.slice(0, 5).map((act) => (
                              <div
                                key={act.id}
                                className="border-b border-[#EFF5FA] pb-3 last:border-b-0 last:pb-0"
                              >
                                <div className="flex items-center justify-between font-mono text-[11px]">
                                  <span className="font-semibold text-[#0057B8]" dir="ltr">
                                    {act.case_number}
                                  </span>
                                  <span className="text-slate-400 tabular-nums" dir="ltr">
                                    {act.created_at.slice(0, 10)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                  {act.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {tab === 'cases' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="relative w-full sm:w-96">
                        <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          data-testid="cases-tab-search"
                          value={caseQuery}
                          onChange={(e) => setCaseQuery(e.target.value)}
                          placeholder={t.workspace.search.casesPlaceholder}
                          className="w-full rounded-xl border border-[#DCE7F2] bg-white ps-9 pe-8 py-2 text-xs text-[#041E4A] placeholder-slate-400 outline-none focus:border-[#0057B8]"
                        />
                        {caseQuery && (
                          <button
                            type="button"
                            onClick={() => setCaseQuery('')}
                            aria-label={t.common.clear}
                            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          aria-pressed={activeOnlyCases}
                          onClick={() => setActiveOnlyCases((prev) => !prev)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                            activeOnlyCases
                              ? 'border-[#0057B8]/25 bg-[#EFF7FC] text-[#0057B8]'
                              : 'border-[#DCE7F2] bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {activeOnlyCases
                            ? t.workspace.search.activeOnly
                            : t.workspace.search.allStatuses}
                        </button>
                        <select
                          value={caseSort}
                          onChange={(e) =>
                            setCaseSort(
                              e.target.value as 'newest' | 'oldest' | 'case_az' | 'status'
                            )
                          }
                          className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#0057B8]"
                        >
                          <option value="newest">{t.workspace.search.sortNewest}</option>
                          <option value="oldest">{t.workspace.search.sortOldest}</option>
                          <option value="case_az">{t.workspace.search.sortCaseAz}</option>
                          <option value="status">{t.workspace.search.sortStatus}</option>
                        </select>
                        <button
                          type="button"
                          data-testid="cases-export-csv-btn"
                          disabled={visibleCases.length === 0}
                          onClick={() =>
                            handleExportCaseReport(
                              'csv',
                              visibleCases,
                              caseQuery.trim() ? 'filtered' : 'all'
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-[#041E4A] disabled:opacity-45 cursor-pointer"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t.common.exportCsv}</span>
                        </button>
                        <button
                          type="button"
                          data-testid="cases-export-pdf-btn"
                          disabled={visibleCases.length === 0}
                          onClick={() =>
                            handleExportCaseReport(
                              'pdf',
                              visibleCases,
                              caseQuery.trim() ? 'filtered' : 'all'
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-2 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] disabled:opacity-45 cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{t.common.exportPdf}</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                      <table className="w-full text-start text-xs">
                        <thead>
                          <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                            <th className="px-5 py-3.5 text-start">{t.workspace.casesTable.caseNum}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.casesTable.subject}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.casesTable.platform}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.casesTable.files}</th>
                            <th className="px-5 py-3.5 text-start min-w-[210px]">
                              {t.workspace.casesTable.journey}
                            </th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.casesTable.status}</th>
                            <th className="px-5 py-3.5 text-end">{t.workspace.casesTable.response}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFF5FA]">
                          {visibleCases.map((c) => {
                            const sla = computeCaseSla(c);
                            const isRemovedCelebrated = Boolean(celebratedRemovedIds[c.id]);
                            return (
                              <tr
                                key={c.id}
                                onClick={() => {
                                  setSelectedCaseId(c.id);
                                  setCaseModalSection('timeline');
                                }}
                                className={`hover:bg-slate-50/80 cursor-pointer ${
                                  isRemovedCelebrated
                                    ? 'bg-emerald-50/40 animate-[frCaseRemovedGlow_1.8s_ease-out]'
                                    : ''
                                }`}
                              >
                                <td className="px-5 py-3.5 font-mono font-semibold text-[#0057B8] whitespace-nowrap">
                                  <button
                                    type="button"
                                    dir="ltr"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCaseId(c.id);
                                      setCaseModalSection('timeline');
                                    }}
                                    className="hover:underline text-start cursor-pointer"
                                  >
                                    {c.case_number}
                                  </button>
                                </td>
                                <td className="px-5 py-3.5 font-semibold text-[#041E4A] max-w-xs truncate">
                                  {c.title}
                                </td>
                                <td className="px-5 py-3.5 text-slate-600">{c.platform}</td>
                                <td className="px-5 py-3.5 tabular-nums text-slate-600">
                                  {t.common.filesCount(c.evidence?.length || 0)}
                                </td>
                                <td className="px-5 py-3.5 min-w-[210px]">
                                  <CaseJourneyIndicator
                                    lang={lang}
                                    caseItem={c}
                                    variant="compact"
                                    celebrateRemoved={isRemovedCelebrated}
                                  />
                                </td>
                                <td
                                  className={`px-5 py-3.5 text-xs font-semibold ${statusTextTone(c.status)}`}
                                >
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span>{translateStatus(c.status, lang)}</span>
                                    {isRemovedCelebrated && (
                                      <RemovalConfirmedBadge label={t.workspace.alerts.removedBadge} />
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-end text-xs text-slate-500 tabular-nums">
                                  {translateSlaLabel(sla, lang)}
                                </td>
                              </tr>
                            );
                          })}
                          {visibleCases.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                                {t.common.noResults}{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCaseQuery('');
                                    setActiveOnlyCases(false);
                                  }}
                                  className="font-semibold text-[#0057B8] hover:underline cursor-pointer"
                                >
                                  {t.common.resetFilters}
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'submit' && (
                  <div className="grid gap-6 lg:grid-cols-12 items-start">
                    <form
                      onSubmit={handleCreateCase}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 sm:p-8 space-y-5 lg:col-span-7 shadow-xs"
                    >
                      <div className="border-b border-[#EFF5FA] pb-4">
                        <h2 className="font-display text-lg font-bold text-[#041E4A]">
                          {t.workspace.submitForm.title}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {t.workspace.submitForm.subtitle}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5 space-y-2.5">
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {t.enhancements.templates.heading}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {t.enhancements.templates.subtitle}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {CASE_SCENARIO_TEMPLATES.map((tpl) => {
                            const tplCopy = t.enhancements.templates.items[tpl.id];
                            return (
                              <button
                                key={tpl.id}
                                type="button"
                                data-testid={`case-template-${tpl.id}`}
                                onClick={() => {
                                  setNewType(tpl.complaintType);
                                  setNewPlatform(tpl.defaultPlatform);
                                  setNewTitle(tplCopy.sampleTitle);
                                  setNewDesc(tplCopy.sampleDesc);
                                }}
                                className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#0057B8] hover:text-[#0057B8] transition cursor-pointer"
                              >
                                {tplCopy.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            {t.workspace.submitForm.caseTitleLabel}
                          </label>
                          <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={t.workspace.submitForm.caseTitlePlaceholder}
                            className="mt-1.5 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            {t.workspace.submitForm.platformLabel}
                          </label>
                          <input
                            type="text"
                            required
                            value={newPlatform}
                            onChange={(e) => setNewPlatform(e.target.value)}
                            placeholder={t.workspace.submitForm.platformPlaceholder}
                            className="mt-1.5 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            {t.workspace.submitForm.urlLabel}
                          </label>
                          <input
                            type="url"
                            required
                            dir="ltr"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://..."
                            className="mt-1.5 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            {t.workspace.submitForm.categoryLabel}
                          </label>
                          <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as ComplaintType)}
                            className="mt-1.5 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                          >
                            {Object.entries(t.workspace.submitForm.categories).map(([val, label]) => (
                              <option key={val} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          {t.workspace.submitForm.detailsLabel}
                        </label>
                        <textarea
                          rows={4}
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder={t.workspace.submitForm.detailsPlaceholder}
                          className="mt-1.5 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-[#0057B8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#004494] transition cursor-pointer"
                      >
                        {t.workspace.submitForm.submitBtn}
                      </button>
                    </form>

                    {/* Live Case Readiness Check */}
                    <aside className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 lg:col-span-5 shadow-xs">
                      <div className="flex items-baseline justify-between border-b border-[#EFF5FA] pb-3.5">
                        <div>
                          <div className="text-xs font-semibold text-[#0057B8]">
                            {t.workspace.submitForm.readinessEyebrow}
                          </div>
                          <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#041E4A]">
                            {submitReadiness.readinessScore}%
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-xs text-slate-500">
                            {t.workspace.submitForm.targetSla}
                          </div>
                          <div className="text-xs font-semibold text-emerald-700" dir="ltr">
                            {submitReadiness.turnaroundLabel}
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#0057B8] transition-all duration-300"
                          style={{ width: `${submitReadiness.readinessScore}%` }}
                        />
                      </div>
                      <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5 space-y-2 text-xs">
                        <div className="font-semibold text-slate-900">
                          {t.enhancements.templates.checklistTitle}
                        </div>
                        <div
                          className={
                            /^https?:\/\/\S+/i.test(newUrl.trim())
                              ? 'font-medium text-emerald-700'
                              : 'text-slate-500'
                          }
                        >
                          {/^https?:\/\/\S+/i.test(newUrl.trim()) ? '✓ ' : '○ '}
                          {/^https?:\/\/\S+/i.test(newUrl.trim())
                            ? t.enhancements.templates.checkUrlOk
                            : t.enhancements.templates.checkUrlTodo}
                        </div>
                        <div className={newDesc.trim().length >= 15 ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                          {newDesc.trim().length >= 15 ? '✓ ' : '○ '}
                          {newDesc.trim().length >= 15
                            ? t.enhancements.templates.checkDescOk
                            : t.enhancements.templates.checkDescTodo}
                        </div>
                        <p className="pt-1 text-[11px] leading-relaxed text-slate-500">
                          {t.enhancements.templates.checkProofTip}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          {t.workspace.submitForm.whereWeReport}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-[#041E4A]">
                          {submitReadiness.escalationChannel}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          {t.workspace.submitForm.suggestedService}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-800">
                          {submitReadiness.recommendedPackage.name} (
                          {formatCurrencyUsd(submitReadiness.recommendedPackage.priceUsd)})
                        </div>
                      </div>
                      <div className="border-t border-[#EFF5FA] pt-3.5 space-y-2">
                        <div className="text-xs font-semibold text-slate-800">
                          {t.workspace.submitForm.checklistTitle}
                        </div>
                        {submitReadiness.checklist.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-xs text-slate-600">
                            <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0057B8]" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                )}

                {tab === 'packages' && (
                  <div className="space-y-6">
                    <form
                      onSubmit={handleAttachPackage}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 shadow-xs"
                    >
                      <h2 className="font-display text-base font-bold text-[#041E4A]">
                        {t.workspace.packagesTab.formTitle}
                      </h2>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <select
                          value={pkgCaseId}
                          onChange={(e) => setPkgCaseId(e.target.value)}
                          className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        >
                          {data.cases.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.case_number} · {c.title.slice(0, 32)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={pkgCode}
                          onChange={(e) => setPkgCode(e.target.value)}
                          className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        >
                          {SERVICE_PACKAGES.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name} ({formatCurrencyUsd(p.priceUsd)})
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl bg-[#0057B8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004494] transition cursor-pointer"
                        >
                          {t.workspace.packagesTab.attachBtn}
                        </button>
                      </div>
                    </form>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {SERVICE_PACKAGES.map((pkg) => (
                        <div
                          key={pkg.code}
                          className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs"
                        >
                          <div>
                            <div className="text-xs font-semibold text-[#0057B8]">
                              {t.workspace.packagesTab.firstReview(pkg.slaHours)}
                            </div>
                            <h3 className="mt-1.5 font-display text-sm font-bold text-[#041E4A]">
                              {pkg.name}
                            </h3>
                            <div className="mt-2 font-mono text-xl font-bold text-[#041E4A] tabular-nums" dir="ltr">
                              {formatCurrencyUsd(pkg.priceUsd)}{' '}
                              <span className="font-sans text-xs font-normal text-slate-500">
                                {pkg.unitLabel}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600">
                              {pkg.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPkgCode(pkg.code)}
                            className="mt-4 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs font-semibold text-slate-800 hover:border-[#0057B8] hover:text-[#0057B8] cursor-pointer"
                          >
                            {t.workspace.packagesTab.selectBtn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'billing' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Instant Card / Digital Gateway Settlement */}
                      <form
                        onSubmit={handleInstantCheckout}
                        className="rounded-2xl border border-[#0057B8]/25 bg-white p-6 space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-display text-base font-bold text-[#041E4A]">
                            {t.workspace.billingTab.cardTitle}
                          </h2>
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {t.workspace.billingTab.autoVerified}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            aria-label={t.workspace.billingTab.selectUnpaidInvoice}
                            value={payInvoiceId}
                            onChange={(e) => setPayInvoiceId(e.target.value)}
                            className="sm:col-span-2 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                          >
                            <option value="">{t.workspace.billingTab.selectUnpaidInvoice}</option>
                            {data.invoices.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.invoice_number} ({formatCurrencyUsd(inv.amount_usd)}) ·{' '}
                                {translateStatus(inv.status, lang)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder={t.workspace.billingTab.cardHolderPlaceholder}
                            className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                          />
                          <input
                            type="text"
                            required
                            dir="ltr"
                            maxLength={4}
                            value={cardLast4}
                            onChange={(e) =>
                              setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            placeholder={t.workspace.billingTab.cardLast4Placeholder}
                            className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 font-mono text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={cardBusy}
                          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                        >
                          {cardBusy ? t.workspace.billingTab.payingBtn : t.workspace.billingTab.payNowBtn}
                        </button>
                      </form>

                      {/* Manual Transfer Proof */}
                      <form
                        onSubmit={handleSubmitPayment}
                        className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 shadow-xs"
                      >
                        <h2 className="font-display text-base font-bold text-[#041E4A]">
                          {t.workspace.billingTab.manualTitle}
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            aria-label={t.workspace.billingTab.selectInvoice}
                            value={payInvoiceId}
                            onChange={(e) => setPayInvoiceId(e.target.value)}
                            className="sm:col-span-2 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                          >
                            <option value="">{t.workspace.billingTab.selectInvoice}</option>
                            {data.invoices.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.invoice_number} ({formatCurrencyUsd(inv.amount_usd)}) ·{' '}
                                {translateStatus(inv.status, lang)}
                              </option>
                            ))}
                          </select>
                          <select
                            value={payMethod}
                            onChange={(e) =>
                              setPayMethod(e.target.value as 'bank_transfer' | 'cash' | 'manual')
                            }
                            className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                          >
                            <option value="bank_transfer">
                              {t.workspace.billingTab.methods.bank_transfer}
                            </option>
                            <option value="cash">{t.workspace.billingTab.methods.cash}</option>
                            <option value="manual">{t.workspace.billingTab.methods.manual}</option>
                          </select>
                          <input
                            type="text"
                            required
                            value={payRef}
                            onChange={(e) => setPayRef(e.target.value)}
                            placeholder={t.workspace.billingTab.receiptCodePlaceholder}
                            className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-[#0057B8] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                        >
                          {t.workspace.billingTab.submitProofBtn}
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="search"
                        value={invQuery}
                        onChange={(e) => setInvQuery(e.target.value)}
                        placeholder={t.workspace.billingTab.searchPlaceholder}
                        className="w-full sm:w-72 rounded-xl border border-[#DCE7F2] bg-white px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                      />
                      <select
                        value={invSort}
                        onChange={(e) =>
                          setInvSort(
                            e.target.value as
                              | 'newest'
                              | 'oldest'
                              | 'amount_high'
                              | 'amount_low'
                              | 'status'
                          )
                        }
                        className="rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#0057B8]"
                      >
                        <option value="newest">{t.workspace.billingTab.sortNewest}</option>
                        <option value="amount_high">{t.workspace.billingTab.sortAmountHigh}</option>
                        <option value="amount_low">{t.workspace.billingTab.sortAmountLow}</option>
                        <option value="status">{t.workspace.billingTab.sortStatus}</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                      <table className="w-full text-start text-xs">
                        <thead>
                          <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                            <th className="px-5 py-3.5 text-start">{t.workspace.billingTab.cols.invoice}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.billingTab.cols.caseNum}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.billingTab.cols.service}</th>
                            <th className="px-5 py-3.5 text-end">{t.workspace.billingTab.cols.amount}</th>
                            <th className="px-5 py-3.5 text-start">{t.workspace.billingTab.cols.status}</th>
                            <th className="px-5 py-3.5 text-end">{t.workspace.billingTab.cols.receipt}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFF5FA]">
                          {visibleInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/75">
                              <td className="px-5 py-3.5 font-mono font-semibold text-[#041E4A]" dir="ltr">
                                {inv.invoice_number}
                              </td>
                              <td className="px-5 py-3.5 font-mono text-[#0057B8]" dir="ltr">
                                {inv.case_number}
                              </td>
                              <td className="px-5 py-3.5 text-slate-600">{inv.service_name}</td>
                              <td className="px-5 py-3.5 text-end font-mono font-bold tabular-nums text-[#041E4A]">
                                {formatCurrencyUsd(inv.amount_usd)}
                              </td>
                              <td className={`px-5 py-3.5 text-xs font-semibold ${statusTextTone(inv.status)}`}>
                                {translateStatus(inv.status, lang)}
                              </td>
                              <td className="px-5 py-3.5 text-end">
                                <button
                                  type="button"
                                  onClick={() => setStatementInvoice(inv)}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>{t.workspace.billingTab.viewPrint}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'support' && (
                  <div className="grid gap-6 lg:grid-cols-12">
                    <form
                      onSubmit={handleCreateSupport}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 lg:col-span-5 shadow-xs"
                    >
                      <h2 className="font-display text-base font-bold text-[#041E4A]">
                        {t.workspace.supportTab.formTitle}
                      </h2>
                      <input
                        type="text"
                        required
                        value={supSubject}
                        onChange={(e) => setSupSubject(e.target.value)}
                        placeholder={t.workspace.supportTab.subjectPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={supCategory}
                          onChange={(e) => setSupCategory(e.target.value)}
                          className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        >
                          <option value="takedown">{t.workspace.supportTab.categories.takedown}</option>
                          <option value="billing">{t.workspace.supportTab.categories.billing}</option>
                          <option value="general">{t.workspace.supportTab.categories.general}</option>
                        </select>
                        <select
                          value={supPriority}
                          onChange={(e) => setSupPriority(e.target.value)}
                          className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        >
                          <option value="normal">{t.workspace.supportTab.priorities.normal}</option>
                          <option value="high">{t.workspace.supportTab.priorities.high}</option>
                        </select>
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={supMsg}
                        onChange={(e) => setSupMsg(e.target.value)}
                        placeholder={t.workspace.supportTab.msgPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#0057B8] py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                      >
                        {t.workspace.supportTab.createBtn}
                      </button>
                    </form>

                    <div className="space-y-4 lg:col-span-7">
                      {data.supportTickets.length === 0 && (
                        <div className="rounded-2xl border border-[#DCE7F2] bg-white p-6 text-xs text-slate-500 shadow-xs">
                          {t.workspace.supportTab.emptyTickets}
                        </div>
                      )}
                      {data.supportTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="rounded-2xl border border-[#DCE7F2] bg-white p-5 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-[#EFF5FA] pb-3">
                            <div>
                              <span className="font-mono text-xs font-semibold text-[#0057B8]" dir="ltr">
                                {ticket.ticket_number}
                              </span>
                              <span className="mx-2 text-slate-300">·</span>
                              <span className="text-sm font-bold text-[#041E4A]">{ticket.subject}</span>
                            </div>
                            <span className={`text-xs font-semibold ${statusTextTone(ticket.status)}`}>
                              {translateStatus(ticket.status, lang)}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {ticket.messages.map((m) => (
                              <div
                                key={m.id}
                                className="rounded-xl border border-[#EFF5FA] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-slate-700"
                              >
                                <div className="text-[11px] text-slate-500">
                                  {translateRole(m.sender_role, lang)} ·{' '}
                                  <span className="font-mono" dir="ltr">
                                    {m.sender_email}
                                  </span>
                                </div>
                                <p className="mt-1">{m.message}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={ticketReplies[ticket.id] || ''}
                              onChange={(e) =>
                                setTicketReplies((prev) => ({
                                  ...prev,
                                  [ticket.id]: e.target.value,
                                }))
                              }
                              placeholder={t.workspace.supportTab.replyPlaceholder}
                              className="flex-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleTicketReply(ticket.id)}
                              className="rounded-xl bg-[#0057B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                            >
                              {t.workspace.supportTab.replyBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'notifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-base font-bold text-[#041E4A]">
                        {t.workspace.notificationsTab.title(unreadCount)}
                      </h2>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="rounded-lg border border-[#DCE7F2] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        {t.workspace.notificationsTab.markAllRead}
                      </button>
                    </div>
                    <div className="divide-y divide-[#EFF5FA] rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                      {data.notifications.length === 0 ? (
                        <div className="p-6 text-xs text-slate-500">
                          {t.workspace.notificationsTab.empty}
                        </div>
                      ) : (
                        data.notifications.map((n) => (
                          <div key={n.id} className="flex items-start justify-between gap-4 p-4 sm:p-5">
                            <div>
                              <div className="flex items-center gap-2">
                                {!n.read && <span className="h-2 w-2 rounded-full bg-[#0057B8]" />}
                                <span className="text-sm font-semibold text-[#041E4A]">{n.title}</span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">{n.body}</p>
                              <div className="mt-1.5 font-mono text-[11px] text-slate-400" dir="ltr">
                                {n.created_at.slice(0, 16).replace('T', ' ')}
                              </div>
                            </div>
                            {!n.read && (
                              <button
                                type="button"
                                onClick={() => handleMarkSingleRead(n.id)}
                                className="shrink-0 text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                              >
                                {t.workspace.notificationsTab.markRead}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tab === 'account' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <form
                      onSubmit={handleSaveProfile}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 shadow-xs"
                    >
                      <h2 className="font-display text-base font-bold text-[#041E4A]">
                        {t.workspace.accountTab.profileTitle}
                      </h2>
                      <input
                        type="text"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        placeholder={t.workspace.accountTab.fullNamePlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        placeholder={t.workspace.accountTab.phonePlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
                      />
                      <input
                        type="text"
                        value={idDocName}
                        onChange={(e) => setIdDocName(e.target.value)}
                        placeholder={t.workspace.accountTab.idDocPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <input
                        type="text"
                        value={facePhotoName}
                        onChange={(e) => setFacePhotoName(e.target.value)}
                        placeholder={t.workspace.accountTab.photoPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#0057B8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                      >
                        {t.workspace.accountTab.saveProfileBtn}
                      </button>
                    </form>

                    <div className="space-y-4">
                      <form
                        onSubmit={handleDataRequest}
                        className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="font-display text-base font-bold text-[#041E4A]">
                            {t.workspace.accountTab.privacyTitle}
                          </h2>
                          <a
                            href="/api/account/export"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057B8] hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{t.workspace.accountTab.exportJson}</span>
                          </a>
                        </div>
                        <select
                          value={drType}
                          onChange={(e) => setDrType(e.target.value as 'export' | 'deletion')}
                          className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        >
                          <option value="export">{t.workspace.accountTab.requestExport}</option>
                          <option value="deletion">{t.workspace.accountTab.requestDeletion}</option>
                        </select>
                        <textarea
                          rows={3}
                          value={drNotes}
                          onChange={(e) => setDrNotes(e.target.value)}
                          placeholder={t.workspace.accountTab.notesPlaceholder}
                          className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-2 text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
                        >
                          {t.workspace.accountTab.submitRequestBtn}
                        </button>
                      </form>

                      {data.dataRequests.length > 0 && (
                        <div className="rounded-2xl border border-[#DCE7F2] bg-white p-5 space-y-2.5 shadow-xs">
                          <div className="text-xs font-semibold text-slate-500">
                            {t.workspace.accountTab.submittedTitle}
                          </div>
                          {data.dataRequests.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between text-xs border-b border-[#EFF5FA] pb-2 last:border-b-0"
                            >
                              <span className="font-semibold text-[#041E4A]">
                                {r.type === 'deletion'
                                  ? t.workspace.accountTab.requestDeletion
                                  : t.workspace.accountTab.requestExport}
                              </span>
                              <span className={`font-semibold ${statusTextTone(r.status)}`}>
                                {translateStatus(r.status, lang)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </main>
      </div>

      {/* Case Detail + Evidence Vault Modal */}
      {selectedCase && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/45 p-4 backdrop-blur-xs ${
            printableReportCases ? 'no-print' : ''
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-[820px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-2xl shadow-[#041E4A]/20">
            <div className="flex items-start justify-between gap-4 border-b border-[#DCE7F2] pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-[#0057B8]" dir="ltr">
                    {selectedCase.case_number}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{selectedCase.platform}</span>
                  <span className="text-slate-300">·</span>
                  <span className={`font-semibold ${statusTextTone(selectedCase.status)}`}>
                    {translateStatus(selectedCase.status, lang)}
                  </span>
                </div>
                <h2 className="mt-1.5 font-display text-lg font-bold text-[#041E4A]">
                  {selectedCase.title}
                </h2>
                <div className="mt-1 font-mono text-[11px] text-slate-500 break-all" dir="ltr">
                  {selectedCase.source_url}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="detail-download-report-btn"
                  onClick={() => handleDownloadPrintReport([selectedCase])}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0057B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{t.enhancements.certificate.downloadReportBtn}</span>
                </button>
                <button
                  type="button"
                  data-testid="detail-certificate-pdf-btn"
                  onClick={() => handleDownloadCaseCertificate(selectedCase)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{t.enhancements.certificate.downloadBtn}</span>
                </button>
                <button
                  type="button"
                  data-testid="detail-export-csv-btn"
                  onClick={() =>
                    handleExportCaseReport('csv', [selectedCase], selectedCase.case_number)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  data-testid="detail-export-pdf-btn"
                  onClick={() =>
                    handleExportCaseReport('pdf', [selectedCase], selectedCase.case_number)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  aria-label={t.common.close}
                  onClick={() => setSelectedCaseId(null)}
                  className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#041E4A] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {selectedCase.monitoring_enabled && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800">
                {t.enhancements.watchlist.active}: {t.enhancements.watchlist.activeNote}
              </div>
            )}

            {celebratedRemovedIds[selectedCase.id] && (
              <div
                data-testid="modal-removed-celebration-banner"
                className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/75 px-4 py-3 animate-[frFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both,frCaseRemovedGlow_1.8s_ease-out]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <RemovalSealIcon size="md" animate />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-900">
                      {t.workspace.alerts.removedTitle}
                    </div>
                    <p className="mt-0.5 text-xs text-emerald-800">
                      {t.workspace.alerts.removedBannerDesc}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCaseCertificate(selectedCase)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 cursor-pointer shrink-0"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{t.enhancements.certificate.downloadBtn}</span>
                </button>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <CaseJourneyIndicator
                lang={lang}
                caseItem={selectedCase}
                variant="timeline"
                celebrateRemoved={Boolean(celebratedRemovedIds[selectedCase.id])}
              />
              <CasePhaseTracker
                lang={lang}
                mode="detail"
                caseItem={selectedCase}
                wsStatus={wsStatus}
                highlightedCaseId={highlightedCaseId}
                celebratedRemovedIds={celebratedRemovedIds}
                thresholdPresetId={pendingThresholdPresetId}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-[#DCE7F2] pb-3">
              {(
                [
                  { id: 'timeline', label: t.workspace.caseModal.tabs.timeline },
                  {
                    id: 'evidence',
                    label: t.workspace.caseModal.tabs.evidence(selectedCase.evidence?.length || 0),
                  },
                  {
                    id: 'messages',
                    label: t.workspace.caseModal.tabs.messages(selectedCase.messages.length),
                  },
                ] as const
              ).map((tabOption) => (
                <button
                  key={tabOption.id}
                  type="button"
                  onClick={() => setCaseModalSection(tabOption.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    caseModalSection === tabOption.id
                      ? 'bg-[#0057B8] text-white'
                      : 'border border-[#DCE7F2] bg-[#F7FAFC] text-slate-600 hover:text-[#041E4A]'
                  }`}
                >
                  {tabOption.label}
                </button>
              ))}
            </div>

            {caseModalSection === 'timeline' && (
              <div className="mt-4 space-y-5">
                <p className="text-xs leading-relaxed text-slate-600">{selectedCase.description}</p>
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {t.workspace.caseModal.timelineTitle}
                  </div>
                  <div className="mt-2 space-y-2">
                    {selectedCase.activity.map((act) => (
                      <div key={act.id} className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0057B8]">
                            {translateTimelineLabel(act.activity_type, act.activity_type, lang)}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500" dir="ltr">
                            {act.created_at.slice(0, 10)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700">{act.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCase.submissions.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      {t.workspace.caseModal.submissionsTitle}
                    </div>
                    <div className="mt-2 space-y-2">
                      {selectedCase.submissions.map((s) => (
                        <div key={s.id} className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold text-[#041E4A]">
                              {s.platform} ·{' '}
                              <span className="font-mono" dir="ltr">
                                {s.external_reference || translateStatus('submitted', lang)}
                              </span>
                            </span>
                            <span className={`font-semibold ${statusTextTone(s.status)}`}>
                              {translateStatus(s.status, lang)}
                            </span>
                          </div>
                          {s.response_summary && (
                            <p className="mt-1 text-slate-600">{s.response_summary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCase.verifications.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      {t.workspace.caseModal.verificationsTitle}
                    </div>
                    <div className="mt-2 space-y-2">
                      {selectedCase.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs"
                        >
                          <div className="font-semibold text-emerald-800">
                            {translateStatus(v.result, lang)}
                          </div>
                          {v.notes && <p className="mt-1 text-slate-700">{v.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canCustomerRequestRecheck(selectedCase.status) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                        <RotateCcw className="h-4 w-4 text-amber-700 shrink-0" />
                        <span>{t.enhancements.recheck.title}</span>
                      </div>
                      <button
                        type="button"
                        data-testid="toggle-recheck-form-btn"
                        onClick={() => setRecheckOpen((prev) => !prev)}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/75 cursor-pointer"
                      >
                        {recheckOpen ? t.common.cancel : t.enhancements.recheck.toggleBtn}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700">{t.enhancements.recheck.subtitle}</p>
                    {recheckOpen && (
                      <form onSubmit={handleSubmitRecheck} className="space-y-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {t.enhancements.recheck.reasonLabel}
                          </label>
                          <textarea
                            rows={2}
                            required
                            minLength={8}
                            data-testid="recheck-reason-input"
                            value={recheckReason}
                            onChange={(e) => setRecheckReason(e.target.value)}
                            placeholder={t.enhancements.recheck.reasonPlaceholder}
                            className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {t.enhancements.recheck.urlLabel}
                          </label>
                          <input
                            type="url"
                            dir="ltr"
                            data-testid="recheck-url-input"
                            value={recheckUrl}
                            onChange={(e) => setRecheckUrl(e.target.value)}
                            placeholder={t.enhancements.recheck.urlPlaceholder}
                            className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none text-start focus:border-amber-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={recheckBusy}
                          data-testid="submit-recheck-btn"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>
                            {recheckBusy
                              ? t.enhancements.recheck.submittingBtn
                              : t.enhancements.recheck.submitBtn}
                          </span>
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {caseModalSection === 'evidence' && (
              <div className="mt-4 space-y-5">
                <form
                  onSubmit={handleAddEvidence}
                  className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3"
                >
                  <div className="text-xs font-semibold text-[#0057B8]">
                    {t.workspace.caseModal.uploadTitle}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      value={evTitle}
                      onChange={(e) => setEvTitle(e.target.value)}
                      placeholder={t.workspace.caseModal.evTitlePlaceholder}
                      className="rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                    />
                    <select
                      value={evCategory}
                      onChange={(e) => setEvCategory(e.target.value as EvidenceCategory)}
                      className="rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                    >
                      {Object.entries(t.workspace.caseModal.evCategories).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1.5">
                        {t.workspace.caseModal.attachFileLabel}
                      </label>
                      <input
                        ref={evFileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.csv,.json"
                        onChange={(e) => handleEvidenceFilePick(e.target.files?.[0] || null)}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-white px-2.5 py-1.5 text-xs text-slate-600 file:me-2 file:rounded-lg file:border-0 file:bg-[#0057B8] file:px-2.5 file:py-1 file:text-[11px] file:font-semibold file:text-white cursor-pointer"
                      />
                      {evBase64 && (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                          <span className="truncate font-medium text-emerald-800">
                            {t.workspace.caseModal.stagedLabel(
                              evFile,
                              formatFileSizeLabel(evFileSize)
                            )}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              data-testid="preview-staged-evidence-btn"
                              onClick={() => setPreviewModalOpen(true)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0057B8] hover:bg-[#EFF7FC] cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              <span>{t.workspace.caseModal.previewFile}</span>
                            </button>
                            <button
                              type="button"
                              data-testid="clear-staged-evidence-btn"
                              onClick={clearStagedEvidenceFile}
                              className="text-xs text-slate-500 hover:text-rose-700 cursor-pointer"
                            >
                              {t.common.clear}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={evFile}
                        onChange={(e) => setEvFile(e.target.value)}
                        placeholder={t.workspace.caseModal.fileNamePlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                      />
                      <input
                        type="url"
                        dir="ltr"
                        value={evUrl}
                        onChange={(e) => setEvUrl(e.target.value)}
                        placeholder={t.workspace.caseModal.refUrlPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] text-start"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={evNotes}
                    onChange={(e) => setEvNotes(e.target.value)}
                    placeholder={t.workspace.caseModal.notePlaceholder}
                    className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0057B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                  >
                    {t.workspace.caseModal.saveEvidenceBtn}
                  </button>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#041E4A]">
                    <span>{t.enhancements.certificate.evidenceHeader}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums">
                      {t.enhancements.certificate.evidenceCountLabel((selectedCase.evidence || []).length)}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="evidence-download-report-btn"
                    onClick={() => handleDownloadPrintReport([selectedCase])}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/30 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{t.enhancements.certificate.downloadReportBtn}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(selectedCase.evidence || []).map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <FileCheck2 className="h-3.5 w-3.5 text-[#0057B8] shrink-0" />
                          <span className="text-slate-700 font-medium">
                            {t.workspace.caseModal.evCategories[ev.category as EvidenceCategory] ||
                              translateStatus(ev.category, lang)}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-[11px] font-medium text-emerald-700" dir="ltr">
                            SHA256:{ev.sha256_preview}
                          </span>
                          {ev.has_encrypted_file && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono text-[11px] font-medium text-[#0057B8]" dir="ltr">
                                AES-256-GCM
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 font-semibold text-[#041E4A]">{ev.title}</div>
                        {ev.file_name && (
                          <div className="mt-0.5 font-mono text-[11px] text-slate-500" dir="ltr">
                            {ev.file_name}
                          </div>
                        )}
                        {ev.notes && <p className="mt-1 text-slate-600">{ev.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono text-[11px] text-slate-500" dir="ltr">
                          {ev.created_at.slice(0, 10)}
                        </span>
                        {ev.has_encrypted_file && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadEvidence(
                                selectedCase.id,
                                ev.id,
                                ev.file_name || `${ev.id}.bin`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#0057B8] hover:bg-[#EFF7FC] cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{t.workspace.caseModal.decryptDownload}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedCase.evidence || selectedCase.evidence.length === 0) && (
                    <p className="text-xs text-slate-500">{t.workspace.caseModal.noEvidence}</p>
                  )}
                </div>
              </div>
            )}

            {caseModalSection === 'messages' && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCase.messages.length === 0 ? (
                    <p className="text-xs text-slate-500">{t.workspace.caseModal.noMessages}</p>
                  ) : (
                    selectedCase.messages.map((m) => (
                      <div key={m.id} className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5 text-xs">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>
                            {translateRole(m.sender_role, lang)} ·{' '}
                            <span className="font-mono" dir="ltr">
                              {m.sender_email}
                            </span>
                          </span>
                          <span className="font-mono" dir="ltr">
                            {m.created_at.slice(0, 10)}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-800">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleCaseReply} className="flex gap-2">
                  <input
                    type="text"
                    value={caseReply}
                    onChange={(e) => setCaseReply(e.target.value)}
                    placeholder={t.workspace.caseModal.replyPlaceholder}
                    className="flex-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0057B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                  >
                    {t.workspace.caseModal.sendReplyBtn}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Invoice Statement Modal */}
      {statementInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[600px] rounded-2xl border border-[#DCE7F2] bg-white p-8 text-[#041E4A] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#DCE7F2] pb-4">
              <div>
                <div className="text-xs font-semibold text-[#0057B8]">
                  {t.workspace.billingTab.statementEyebrow}
                </div>
                <h2 className="mt-1 font-display text-2xl font-extrabold" dir="ltr">
                  {statementInvoice.invoice_number}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStatementInvoice(null)}
                aria-label={t.common.close}
                className="no-print rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:text-[#041E4A] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500">{t.workspace.billingTab.billedAccount}</div>
                <div className="mt-0.5 font-semibold">{data?.user.name}</div>
                <div className="font-mono text-slate-600" dir="ltr">
                  {statementInvoice.customer_email}
                </div>
              </div>
              <div className="text-end">
                <div className="text-slate-500">{t.workspace.billingTab.statusDate}</div>
                <div className="mt-0.5 font-bold">
                  {translateStatus(statementInvoice.status, lang)}
                </div>
                <div className="font-mono text-slate-600" dir="ltr">
                  {statementInvoice.created_at.slice(0, 10)}
                </div>
              </div>
            </div>

            <div className="mt-6 border-y border-[#DCE7F2] py-4 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span>
                  {statementInvoice.service_name} (
                  <span className="font-mono" dir="ltr">
                    {statementInvoice.case_number}
                  </span>
                  )
                </span>
                <span className="font-mono text-base font-bold tabular-nums" dir="ltr">
                  {formatCurrencyUsd(statementInvoice.amount_usd)} {t.common.usd}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#041E4A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{t.workspace.billingTab.printBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <FilePreviewModal
        lang={lang}
        isOpen={previewModalOpen && Boolean(evBase64)}
        file={
          evBase64
            ? {
                fileName: evFile || 'staged-evidence',
                mimeType: evMimeType || 'application/octet-stream',
                fileSizeBytes: evFileSize,
                base64Content: evBase64,
                title: evTitle,
                category: evCategory,
              }
            : null
        }
        onClose={() => setPreviewModalOpen(false)}
        onRemoveFile={clearStagedEvidenceFile}
        canSubmitDirectly={Boolean(selectedCase && evTitle.trim())}
        onConfirmSubmit={submitStagedEvidence}
      />

      <QuickJumpModal
        open={quickJumpOpen}
        onClose={() => setQuickJumpOpen(false)}
        lang={lang}
        sections={navItems.map((item) => ({
          id: item.id,
          label: item.label,
          onSelect: () => setTab(item.id),
        }))}
        cases={(data?.cases || []).map((c) => ({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          platform: c.platform,
          status: c.status,
          onSelect: () => {
            setSelectedCaseId(c.id);
            setCaseModalSection('timeline');
          },
        }))}
      />

      {printableReportCases && (
        <PrintableCertificateModal
          cases={printableReportCases}
          user={data?.user}
          lang={lang}
          onClose={() => setPrintableReportCases(null)}
          onDownloadPdf={handleDownloadCaseCertificate}
        />
      )}

      <WorkspaceToastStack
        lang={lang}
        alerts={liveToastAlerts}
        onDismiss={(alertId) =>
          setLiveToastAlerts((prev) => prev.filter((item) => item.id !== alertId))
        }
        onInspectCase={(alert) => {
          setSelectedCaseId(alert.caseId);
          setCaseModalSection(alert.kind === 'urgent_input' ? 'messages' : 'timeline');
          setLiveToastAlerts((prev) => prev.filter((item) => item.id !== alert.id));
        }}
      />
    </div>
  );
}
