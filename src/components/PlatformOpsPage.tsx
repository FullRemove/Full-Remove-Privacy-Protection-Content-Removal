import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Globe2,
  History,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  RefreshCw,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import {
  PORTAL_TRANSLATIONS,
  translateRole,
  translateSlaLabel,
  translateStatus,
} from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { authFetch, clearAuthToken } from '../lib/authClient';
import {
  buildCsv,
  buildPlatformAnalyticsCsv,
  buildSingleCaseCertificateData,
  buildStaffQueueCsv,
  computeCaseSla,
  computePlatformAnalyticsBreakdown,
  filterStaffCasesQueue,
  formatCurrencyUsd,
  hasPlatformPermission,
  mergeActivityEventsIdempotent,
  type AuditEventRecord,
  type InquiryRecord,
  type PlatformAnalyticsBreakdown,
  type PlatformPermission,
  type PlatformRoleName,
  type PlatformRoleRecord,
  type ProtectionCase,
  type StaffQueueStatusFilter,
  type VisitorSessionRecord,
} from '../lib/caseLogic';
import { generateSingleCaseCertificatePdfBlob, triggerBlobDownload } from '../lib/caseReportPdf';
import { BrandLogoMark } from './BrandLogoMark';
import { PortalLanguageSwitcher } from './PortalLanguageSwitcher';
import { QuickJumpModal } from './QuickJumpModal';
import { RealTimeActivityLog } from './RealTimeActivityLog';
import { TakedownNoticeModal } from './TakedownNoticeModal';

interface PlatformOpsPageProps {
  onNavigate: (path: string) => void;
  lang?: LangCode;
  onChangeLang?: (lang: LangCode) => void;
}

type PlatformView =
  | 'overview'
  | 'customers'
  | 'payments'
  | 'cases'
  | 'support'
  | 'requests'
  | 'audit'
  | 'reports'
  | 'visitors'
  | 'roles';

function statusTone(status: string): string {
  if (
    [
      'approved',
      'paid',
      'resolved',
      'closed',
      'completed',
      'active',
      'confirmed_removed',
      'action_taken',
      'converted',
    ].includes(status)
  ) {
    return 'text-emerald-700';
  }
  if (['pending_review', 'needs_information', 'open', 'received', 'overdue', 'new'].includes(status)) {
    return 'text-amber-700';
  }
  if (['rejected', 'suspended', 'disputed'].includes(status)) {
    return 'text-rose-700';
  }
  return 'text-[#0057B8]';
}

export function PlatformOpsPage({
  onNavigate,
  lang = 'en',
  onChangeLang,
}: PlatformOpsPageProps) {
  const [view, setView] = useState<PlatformView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [actor, setActor] = useState('');
  const [currentRole, setCurrentRole] = useState('operations_admin');

  // View Payloads
  const [overview, setOverview] = useState<any>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSummary, setCustomerSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [cases, setCases] = useState<(ProtectionCase & { organization_name?: string })[]>([]);
  const [caseOrgFilter, setCaseOrgFilter] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventRecord[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [visitorsData, setVisitorsData] = useState<any>(null);
  const [roles, setRoles] = useState<PlatformRoleRecord[]>([]);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState<StaffQueueStatusFilter>('all');
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [visitorDays, setVisitorDays] = useState(30);

  // Modals
  const [customerProfileModal, setCustomerProfileModal] = useState<any>(null);
  const [caseModalData, setCaseModalData] = useState<{
    case: ProtectionCase & { organization_name?: string };
    evidence: any[];
    activity: any[];
    messages: any[];
    submissions: any[];
    verifications: any[];
  } | null>(null);
  const [ticketModalData, setTicketModalData] = useState<any>(null);

  // Modal Form Inputs
  const [caseNote, setCaseNote] = useState('');
  const [caseReply, setCaseReply] = useState('');
  const [caseStatusInput, setCaseStatusInput] = useState('reviewing');
  const [caseAssigneeInput, setCaseAssigneeInput] = useState('');
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [urlCheckBusy, setUrlCheckBusy] = useState(false);
  const [sweepBusy, setSweepBusy] = useState(false);
  const [urlCheckDiagnostic, setUrlCheckDiagnostic] = useState('');
  const [subPlatform, setSubPlatform] = useState('');
  const [subRef, setSubRef] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [verResult, setVerResult] = useState('confirmed_removed');
  const [verNotes, setVerNotes] = useState('');

  const [ticketNote, setTicketNote] = useState('');
  const [ticketReply, setTicketReply] = useState('');
  const [ticketStatus, setTicketStatus] = useState('in_progress');
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const [requestNotes, setRequestNotes] = useState<Record<string, string>>({});

  // Broadcast Notice Form
  const [broadcastTarget, setBroadcastTarget] = useState('all_customers');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Role Management Form
  const [newRoleEmail, setNewRoleEmail] = useState('');
  const [newRoleName, setNewRoleName] = useState<PlatformRoleName>('operations_admin');

  const t = PORTAL_TRANSLATIONS[lang];
  const langRef = useRef<LangCode>(lang);
  langRef.current = lang;

  const fetchView = useCallback(
    async (targetView: PlatformView = view) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ view: targetView });
        if (targetView === 'cases' && caseOrgFilter) {
          params.set('organization_id', caseOrgFilter);
        }
        if (targetView === 'reports') {
          if (reportStart) params.set('start_date', reportStart);
          if (reportEnd) params.set('end_date', reportEnd);
        }
        if (targetView === 'visitors') {
          params.set('days', String(visitorDays));
        }

        const res = await authFetch(`/api/platform/operations?${params.toString()}`);
        if (res.status === 401 || res.status === 403) {
          onNavigate('/login');
          return;
        }
        const json = await res.json();
        setActor(json.actor || '');
        setCurrentRole(json.current_role || 'operations_admin');

        if (targetView === 'overview') {
          setOverview(json.overview);
          setInquiries(json.inquiries || []);
          if (Array.isArray(json.events)) {
            setAuditEvents((prev) => mergeActivityEventsIdempotent(prev, json.events, 200));
          }
        } else if (targetView === 'customers') {
          setCustomers(json.customers || []);
          setCustomerSummary(json.summary || null);
        } else if (targetView === 'payments') {
          setPayments(json.payments || []);
        } else if (targetView === 'cases') {
          setCases(json.cases || []);
        } else if (targetView === 'support') {
          setTickets(json.tickets || []);
        } else if (targetView === 'requests') {
          setRequests(json.requests || []);
        } else if (targetView === 'audit') {
          setAuditEvents(json.events || []);
        } else if (targetView === 'reports') {
          setReportsData(json.reports || null);
        } else if (targetView === 'visitors') {
          setVisitorsData(json.analytics || null);
        } else if (targetView === 'roles') {
          setRoles(json.roles || []);
        }
      } catch {
        setBanner({ kind: 'error', text: PORTAL_TRANSLATIONS[langRef.current].admin.loadError });
      } finally {
        setLoading(false);
      }
    },
    [caseOrgFilter, onNavigate, reportEnd, reportStart, view, visitorDays]
  );

  useEffect(() => {
    fetchView(view);
  }, [fetchView, view]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickJumpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const postOperation = async (payload: Record<string, unknown>, successMsg: string) => {
    setBanner(null);
    const res = await authFetch('/api/platform/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.admin.loadError });
      return null;
    }
    setBanner({ kind: 'success', text: successMsg });
    await fetchView(view);
    return json;
  };

  const openCaseModal = async (caseId: string) => {
    setUrlCheckDiagnostic('');
    const res = await authFetch(`/api/platform/operations?view=case&id=${encodeURIComponent(caseId)}`);
    if (res.ok) {
      const json = await res.json();
      setCaseModalData({
        case: json.case,
        evidence: json.evidence || [],
        activity: json.activity || [],
        messages: json.messages || [],
        submissions: json.submissions || [],
        verifications: json.verifications || [],
      });
      setCaseStatusInput(json.case.status);
      setCaseAssigneeInput(json.case.assigned_to || '');
    }
  };

  const handleDownloadEvidence = async (
    caseId: string,
    evidenceId: string,
    fallbackName: string
  ) => {
    try {
      const res = await authFetch(`/api/cases/${caseId}/evidence/${evidenceId}/download`);
      if (!res.ok) {
        setBanner({ kind: 'error', text: t.admin.loadError });
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
      setBanner({ kind: 'error', text: t.admin.loadError });
    }
  };

  const handleRunLiveUrlCheck = async (caseId: string, checkedUrl: string) => {
    setUrlCheckBusy(true);
    setUrlCheckDiagnostic('');
    try {
      const out = await postOperation(
        { action: 'check_url', id: caseId, checked_url: checkedUrl },
        t.staff.caseModal.verifySaved
      );
      if (out?.diagnostic_note) {
        setUrlCheckDiagnostic(String(out.diagnostic_note));
      }
      await openCaseModal(caseId);
    } finally {
      setUrlCheckBusy(false);
    }
  };

  const openTicketModal = async (ticketId: string) => {
    const res = await authFetch(
      `/api/platform/operations?view=ticket&id=${encodeURIComponent(ticketId)}`
    );
    if (res.ok) {
      const json = await res.json();
      setTicketModalData({ ...json.ticket, messages: json.messages || [] });
      setTicketStatus(json.ticket.status);
    }
  };

  const openCustomerProfile = async (id: string) => {
    const res = await authFetch(
      `/api/platform/operations?view=customer_profile&id=${encodeURIComponent(id)}`
    );
    if (res.ok) {
      const json = await res.json();
      setCustomerProfileModal(json.customer);
    }
  };

  const handleBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    const out = await postOperation(
      {
        action: 'broadcast_notice',
        target: broadcastTarget,
        title: broadcastTitle,
        body: broadcastBody,
      },
      t.admin.broadcast.sentToast
    );
    if (out) {
      setBroadcastTitle('');
      setBroadcastBody('');
    }
  };

  const handleGrantRole = async (e: FormEvent) => {
    e.preventDefault();
    const out = await postOperation(
      { action: 'set_role', email: newRoleEmail, role: newRoleName },
      `${translateRole(newRoleName, lang)} · ${newRoleEmail}`
    );
    if (out) {
      setNewRoleEmail('');
    }
  };

  const downloadSectionCsv = (sectionKey: string, rows: Record<string, unknown>[]) => {
    if (!rows || rows.length === 0) {
      setBanner({ kind: 'error', text: t.common.noResults });
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = buildCsv(keys, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullremove-${sectionKey}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await authFetch('/api/auth/signout', { method: 'POST' });
    clearAuthToken();
    onNavigate('/');
  };

  const navGroups: {
    id: PlatformView;
    label: string;
    icon: typeof LayoutDashboard;
    permission: PlatformPermission;
  }[] = [
    { id: 'overview', label: t.admin.nav.overview, icon: LayoutDashboard, permission: 'overview' },
    { id: 'customers', label: t.admin.nav.customers, icon: Building2, permission: 'customers' },
    { id: 'payments', label: t.admin.nav.payments, icon: CreditCard, permission: 'payments' },
    { id: 'cases', label: t.admin.nav.cases, icon: Briefcase, permission: 'cases' },
    { id: 'support', label: t.admin.nav.support, icon: LifeBuoy, permission: 'support' },
    { id: 'requests', label: t.admin.nav.requests, icon: Lock, permission: 'requests' },
    { id: 'audit', label: t.admin.nav.audit, icon: History, permission: 'audit' },
    { id: 'reports', label: t.admin.nav.reports, icon: BarChart3, permission: 'reports' },
    { id: 'visitors', label: t.admin.nav.visitors, icon: Globe2, permission: 'visitors' },
    { id: 'roles', label: t.admin.nav.roles, icon: UserCheck, permission: 'roles' },
  ];

  const can = (perm: PlatformPermission): boolean =>
    hasPlatformPermission(currentRole as PlatformRoleName, perm);

  const visibleNavGroups = navGroups.filter((item) => can(item.permission));

  const handleLiveActivityEvent = useCallback((event: AuditEventRecord) => {
    setAuditEvents((prev) => mergeActivityEventsIdempotent(prev, event, 200));
  }, []);

  const lcSearch = searchTerm.trim().toLowerCase();

  const visibleAdminCases = useMemo(() => {
    const statusFiltered = filterStaffCasesQueue(cases, { statusFilter: caseStatusFilter });
    if (!lcSearch) return statusFiltered;
    return statusFiltered.filter((c) =>
      [
        c.case_number,
        c.organization_name,
        c.title,
        c.platform,
        c.assigned_to,
        c.status,
      ].some((v) => String(v || '').toLowerCase().includes(lcSearch))
    );
  }, [cases, caseStatusFilter, lcSearch]);

  const handleExportAdminCasesCsv = () => {
    if (visibleAdminCases.length === 0) return;
    const csv = buildStaffQueueCsv(visibleAdminCases);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, `full-remove-admin-cases-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleRunAdminWatchlistSweep = async () => {
    setSweepBusy(true);
    setBanner(null);
    try {
      const res = await authFetch('/api/platform/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'watchlist_sweep' }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.admin.loadError });
        return;
      }
      const s = json.summary || {
        checkedCount: 0,
        removedCount: 0,
        stillOnlineCount: 0,
        flaggedReappearedCount: 0,
      };
      setBanner({
        kind: 'success',
        text: t.enhancements.watchlistSweep.summaryBanner(
          s.checkedCount,
          s.removedCount,
          s.stillOnlineCount,
          s.flaggedReappearedCount
        ),
      });
      await fetchView(view);
    } catch {
      setBanner({ kind: 'error', text: t.admin.loadError });
    } finally {
      setSweepBusy(false);
    }
  };

  const handleDownloadCaseCertificate = (c: ProtectionCase) => {
    const cert = buildSingleCaseCertificateData(c);
    const blob = generateSingleCaseCertificatePdfBlob(cert);
    triggerBlobDownload(blob, `full-remove-certificate-${c.case_number}.pdf`);
    setBanner({
      kind: 'success',
      text: t.enhancements.certificate.toastDownloaded(c.case_number),
    });
  };

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
        className={`fixed inset-y-0 start-0 z-30 w-64 shrink-0 border-e border-[#DCE7F2] bg-white flex flex-col justify-between transition-transform lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${
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
              <BrandLogoMark size="sm" tone="light" label={t.admin.brandTitle} />
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

          <div className="border-b border-[#EFF5FA] bg-[#F7FAFC] px-4 py-3.5">
            <div className="truncate text-xs font-semibold text-[#00758A]">
              {translateRole(currentRole, lang) === t.admin.brandTitle
                ? t.admin.brandTitle
                : `${t.admin.brandTitle} · ${translateRole(currentRole, lang)}`}
            </div>
            <div className="mt-1 truncate font-mono text-[11px] text-slate-600" dir="ltr">
              {actor || 'ops@fremove.com'}
            </div>
          </div>

          <nav className="p-2.5 space-y-1" aria-label={t.admin.brandTitle}>
            {visibleNavGroups.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setView(item.id);
                    setSearchTerm('');
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-[#041E4A] text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-[#EFF5FA] hover:text-[#041E4A] border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00C8D7]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#DCE7F2] p-3 space-y-1.5">
          <button
            type="button"
            onClick={() => onNavigate('/staff')}
            className="w-full rounded-xl border border-[#DCE7F2] px-3 py-2 text-start text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
          >
            {t.admin.openStaffConsole}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/workspace')}
            className="w-full rounded-xl border border-[#DCE7F2] px-3 py-2 text-start text-xs font-medium text-slate-600 hover:bg-[#EFF5FA] cursor-pointer"
          >
            {t.admin.openClientWorkspace}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t.common.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 sm:gap-3 border-b border-[#DCE7F2] bg-white/95 px-3 sm:px-6 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t.workspace.openMenu}
              className="shrink-0 rounded-lg border border-[#DCE7F2] p-1.5 text-slate-600 lg:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-400">{t.admin.breadcrumbRoot}</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="truncate font-semibold text-[#041E4A]">
                {navGroups.find((g) => g.id === view)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              data-testid="admin-quick-jump-btn"
              onClick={() => setQuickJumpOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2 sm:px-2.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-[#041E4A] transition cursor-pointer"
              aria-label={t.enhancements.quickJump.buttonLabel}
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
            <button
              type="button"
              onClick={() => fetchView(view)}
              className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 sm:px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-white hover:text-[#041E4A] transition cursor-pointer"
            >
              {t.common.refresh}
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-[1280px] w-full mx-auto space-y-6">
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

          {loading &&
          !overview &&
          customers.length === 0 &&
          payments.length === 0 &&
          cases.length === 0 &&
          !visitorsData ? (
            <div className="rounded-2xl border border-[#DCE7F2] bg-white p-8 text-xs text-slate-500 shadow-xs">
              {t.admin.loadingText}
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW */}
              {view === 'overview' && overview && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        label: t.admin.overviewKpis.customers.label,
                        value: overview.organizations,
                        sub: t.admin.overviewKpis.customers.sub,
                        action: () => setView('customers'),
                      },
                      {
                        label: t.admin.overviewKpis.cases.label,
                        value: `${overview.cases.open} / ${overview.cases.total}`,
                        sub: t.admin.overviewKpis.cases.sub(overview.cases.sla_attention || 0),
                        action: () => setView('cases'),
                      },
                      {
                        label: t.admin.overviewKpis.payments.label,
                        value: overview.pending_payments,
                        sub: t.admin.overviewKpis.payments.sub,
                        action: () => setView('payments'),
                      },
                      {
                        label: t.admin.overviewKpis.support.label,
                        value: `${overview.support.open} / ${overview.support.total}`,
                        sub: t.admin.overviewKpis.support.sub,
                        action: () => setView('support'),
                      },
                      {
                        label: t.admin.overviewKpis.requests.label,
                        value: `${overview.requests.open} / ${overview.requests.total}`,
                        sub: t.admin.overviewKpis.requests.sub,
                        action: () => setView('requests'),
                      },
                      {
                        label: t.admin.overviewKpis.inquiries.label,
                        value: overview.inquiries_new ?? inquiries.length,
                        sub: t.admin.overviewKpis.inquiries.sub,
                        action: () => setView('visitors'),
                      },
                    ].map((card) => (
                      <button
                        key={card.label}
                        type="button"
                        onClick={card.action}
                        className="rounded-2xl border border-[#DCE7F2] bg-white p-5 text-start transition hover:border-[#0057B8]/50 cursor-pointer shadow-xs"
                      >
                        <div className="text-xs font-medium text-slate-500">{card.label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[#041E4A]">
                          <span dir="ltr" className="inline-block">
                            {card.value}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Customer Broadcast Notice */}
                    <form
                      onSubmit={handleBroadcast}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 lg:col-span-5 shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-[#0057B8]" />
                        <h2 className="font-display text-sm font-bold text-[#041E4A]">
                          {t.admin.broadcast.title}
                        </h2>
                      </div>
                      <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                      >
                        <option value="all_customers">{t.admin.broadcast.allClients}</option>
                        <option value="sara@example.com">Sara Kareem (sara@example.com)</option>
                        <option value="noor@example.com">Noor Al-Mansoor (noor@example.com)</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder={t.admin.broadcast.subjectPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <textarea
                        rows={3}
                        required
                        value={broadcastBody}
                        onChange={(e) => setBroadcastBody(e.target.value)}
                        placeholder={t.admin.broadcast.bodyPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#0057B8] py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                      >
                        {t.admin.broadcast.sendBtn}
                      </button>
                    </form>

                    {/* Recent Public Inquiries with 1-click conversion */}
                    <div className="rounded-2xl border border-[#DCE7F2] bg-white p-6 lg:col-span-7 shadow-xs">
                      <h2 className="font-display text-sm font-bold text-[#041E4A] border-b border-[#EFF5FA] pb-3.5">
                        {t.admin.intake.title}
                      </h2>
                      <div className="mt-2 divide-y divide-[#EFF5FA]">
                        {inquiries.slice(0, 5).map((inq) => (
                          <div
                            key={inq.id}
                            className="flex items-start justify-between gap-4 py-3.5 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-[#041E4A]">
                                {inq.name}{' '}
                                <span className="font-mono text-[11px] font-normal text-slate-500" dir="ltr">
                                  ({inq.email})
                                </span>
                              </div>
                              <div className="mt-0.5 font-medium text-[#0057B8]" dir="auto">
                                {inq.interest}
                              </div>
                              <p className="mt-1 text-slate-600" dir="auto">
                                {inq.message}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {inq.status === 'converted' ? (
                                <span className="text-xs font-semibold text-emerald-700">
                                  {t.admin.intake.converted}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    postOperation(
                                      { action: 'inquiry_convert', id: inq.id },
                                      t.admin.intake.convertedToast
                                    )
                                  }
                                  className="rounded-lg bg-[#0057B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                                >
                                  {t.admin.intake.convertBtn}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <RealTimeActivityLog
                    lang={lang}
                    mode="compact"
                    initialEvents={auditEvents}
                    onOpenFullView={() => setView('audit')}
                    onLiveEvent={handleLiveActivityEvent}
                  />
                </div>
              )}

              {/* 2. CUSTOMERS */}
              {view === 'customers' && (
                <div className="space-y-4">
                  {customerSummary && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500">
                          {t.admin.customersView.registered}
                        </div>
                        <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#041E4A]">
                          {customerSummary.registered}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500">
                          {t.admin.customersView.activeBilling}
                        </div>
                        <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#041E4A]">
                          {customerSummary.active_subscriptions}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500">
                          {t.admin.customersView.needingAttention}
                        </div>
                        <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-amber-700">
                          {customerSummary.attention}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.admin.customersView.cols.organization}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.customersView.cols.contact}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.customersView.cols.cases}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.customersView.cols.invoices}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.customersView.cols.access}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.customersView.cols.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {customers.map((c) => (
                          <tr key={c.organization_id} className="hover:bg-slate-50/75">
                            <td className="px-5 py-3.5 font-semibold text-[#041E4A]">
                              {c.workspace_name}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-slate-600" dir="ltr">
                              {c.email}
                            </td>
                            <td className="px-5 py-3.5 text-end font-mono tabular-nums text-slate-700">
                              {c.case_count}
                            </td>
                            <td className="px-5 py-3.5 text-end font-mono tabular-nums text-slate-700">
                              {c.invoice_count}
                            </td>
                            <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(c.access_status)}`}>
                              {translateStatus(c.access_status, lang)}
                            </td>
                            <td className="px-5 py-3.5 text-end space-x-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openCustomerProfile(c.email)}
                                className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                {t.admin.customersView.profileBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCaseOrgFilter(c.email);
                                  setView('cases');
                                }}
                                className="rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
                              >
                                {t.admin.customersView.viewCasesBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  postOperation(
                                    {
                                      action: 'customer_status',
                                      organization_id: c.email,
                                      status:
                                        c.access_status === 'suspended' ? 'active' : 'suspended',
                                    },
                                    translateStatus(
                                      c.access_status === 'suspended' ? 'active' : 'suspended',
                                      lang
                                    )
                                  )
                                }
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 cursor-pointer"
                              >
                                {c.access_status === 'suspended'
                                  ? t.admin.customersView.restoreBtn
                                  : t.admin.customersView.suspendBtn}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. PAYMENTS */}
              {view === 'payments' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.admin.paymentsView.cols.invoiceRef}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.paymentsView.cols.client}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.paymentsView.cols.amount}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.paymentsView.cols.status}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.paymentsView.cols.decision}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/75">
                            <td className="px-5 py-3.5">
                              <div className="font-mono font-bold text-[#041E4A]" dir="ltr">
                                {p.invoice_number}
                              </div>
                              <div className="font-mono text-[11px] font-medium text-[#0057B8]" dir="ltr">
                                {p.customer_reference} ({p.method})
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                onClick={() => openCustomerProfile(p.customer_email)}
                                className="font-semibold text-[#041E4A] hover:text-[#0057B8] cursor-pointer"
                              >
                                {p.organization_name}
                              </button>
                              <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                                {p.customer_email}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-end font-mono font-bold tabular-nums text-[#041E4A]">
                              {formatCurrencyUsd(p.amount)}
                            </td>
                            <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(p.status)}`}>
                              {translateStatus(p.status, lang)}
                            </td>
                            <td className="px-5 py-3.5 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="text"
                                  value={paymentNotes[p.id] ?? p.admin_note ?? ''}
                                  onChange={(e) =>
                                    setPaymentNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                                  }
                                  placeholder={t.admin.paymentsView.notePlaceholder}
                                  className="w-40 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    postOperation(
                                      {
                                        action: 'payment_review',
                                        id: p.id,
                                        decision: 'approved',
                                        admin_note: paymentNotes[p.id] || '',
                                      },
                                      `${p.invoice_number} · ${translateStatus('approved', lang)}`
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                                >
                                  {t.admin.paymentsView.approveBtn}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    postOperation(
                                      {
                                        action: 'payment_review',
                                        id: p.id,
                                        decision: 'rejected',
                                        admin_note: paymentNotes[p.id] || '',
                                      },
                                      `${p.invoice_number} · ${translateStatus('rejected', lang)}`
                                    )
                                  }
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                                >
                                  {t.admin.paymentsView.rejectBtn}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. CASES */}
              {view === 'cases' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        'all',
                        'open',
                        'submitted',
                        'reviewing',
                        'needs_information',
                        'submitted_to_platform',
                        'resolved',
                        'watched',
                      ] as const
                    ).map((filterKey) => {
                      const active = caseStatusFilter === filterKey;
                      return (
                        <button
                          key={filterKey}
                          type="button"
                          data-testid={`admin-status-filter-${filterKey}`}
                          onClick={() => setCaseStatusFilter(filterKey)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            active
                              ? 'border-[#0057B8]/25 bg-[#EFF7FC] text-[#0057B8]'
                              : 'border-[#DCE7F2] bg-white text-slate-600 hover:border-slate-300 hover:text-[#041E4A]'
                          }`}
                        >
                          {t.enhancements.queueFilters[filterKey]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t.admin.casesView.searchPlaceholder}
                      className="w-full sm:w-80 rounded-xl border border-[#DCE7F2] bg-white px-3.5 py-2 text-xs text-[#041E4A] placeholder:text-slate-400 outline-none focus:border-[#0057B8]"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {caseOrgFilter && (
                        <button
                          type="button"
                          onClick={() => setCaseOrgFilter('')}
                          className="rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] cursor-pointer"
                        >
                          {t.admin.casesView.clearOrgFilter(caseOrgFilter)} ×
                        </button>
                      )}
                      {can('write_cases') && (
                        <button
                          type="button"
                          data-testid="admin-watchlist-sweep-btn"
                          disabled={sweepBusy}
                          onClick={handleRunAdminWatchlistSweep}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-45 cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${sweepBusy ? 'animate-spin' : ''}`} />
                          <span>
                            {sweepBusy
                              ? t.enhancements.watchlistSweep.runningBtn
                              : t.enhancements.watchlistSweep.runBtn}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid="admin-export-csv-btn"
                        disabled={visibleAdminCases.length === 0}
                        onClick={handleExportAdminCasesCsv}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-[#041E4A] disabled:opacity-45 cursor-pointer"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{t.enhancements.queueFilters.exportCsv}</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.caseNum}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.client}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.subject}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.platform}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.owner}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.casesView.cols.status}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.casesView.cols.response}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {visibleAdminCases.map((c: any) => {
                          const sla = computeCaseSla(c);
                          return (
                            <tr
                              key={c.id}
                              onClick={() => openCaseModal(c.id)}
                              className="hover:bg-slate-50/80 cursor-pointer"
                            >
                              <td
                                className="px-5 py-3.5 font-mono font-bold text-[#0057B8] whitespace-nowrap"
                                dir="ltr"
                              >
                                {c.case_number}
                              </td>
                              <td className="px-5 py-3.5 text-slate-700">{c.organization_name}</td>
                              <td className="px-5 py-3.5 font-semibold text-[#041E4A] max-w-xs truncate" dir="auto">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="truncate">{c.title}</span>
                                  {c.monitoring_enabled && (
                                    <Eye
                                      className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                                      aria-label={t.enhancements.watchlist.active}
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-slate-600">{c.platform}</td>
                              <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600" dir="ltr">
                                {c.assigned_to || t.common.unassigned}
                              </td>
                              <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(c.status)}`}>
                                {translateStatus(c.status, lang)}
                              </td>
                              <td className="px-5 py-3.5 text-end text-xs tabular-nums text-slate-500">
                                {translateSlaLabel(sla, lang)}
                              </td>
                            </tr>
                          );
                        })}
                        {visibleAdminCases.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                              {t.common.noResults}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. SUPPORT */}
              {view === 'support' && (
                <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                        <th className="px-5 py-3.5 text-start">{t.admin.supportView.cols.ticket}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.supportView.cols.client}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.supportView.cols.subject}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.supportView.cols.priority}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.supportView.cols.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFF5FA]">
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() => openTicketModal(ticket.id)}
                          className="hover:bg-slate-50/80 cursor-pointer"
                        >
                          <td className="px-5 py-3.5 font-mono font-bold text-[#0057B8]" dir="ltr">
                            {ticket.ticket_number}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700">{ticket.organization_name}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#041E4A]">{ticket.subject}</td>
                          <td className="px-5 py-3.5 font-semibold text-amber-700">
                            {ticket.priority === 'high'
                              ? t.workspace.supportTab.priorities.high
                              : t.workspace.supportTab.priorities.normal}
                          </td>
                          <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(ticket.status)}`}>
                            {translateStatus(ticket.status, lang)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 6. PRIVACY REQUESTS */}
              {view === 'requests' && (
                <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                        <th className="px-5 py-3.5 text-start">{t.admin.requestsView.cols.client}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.requestsView.cols.type}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.requestsView.cols.notes}</th>
                        <th className="px-5 py-3.5 text-start">{t.admin.requestsView.cols.status}</th>
                        <th className="px-5 py-3.5 text-end">{t.admin.requestsView.cols.action}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFF5FA]">
                      {requests.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/75">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-[#041E4A]">{r.organization_name}</div>
                            <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                              {r.customer_email}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-[#0057B8]">
                            {r.request_type === 'deletion'
                              ? t.workspace.accountTab.requestDeletion
                              : t.workspace.accountTab.requestExport}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 max-w-xs">{r.notes}</td>
                          <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(r.status)}`}>
                            {translateStatus(r.status, lang)}
                          </td>
                          <td className="px-5 py-3.5 text-end space-x-2">
                            <input
                              type="text"
                              value={requestNotes[r.id] ?? r.admin_note ?? ''}
                              onChange={(e) =>
                                setRequestNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              placeholder={t.admin.requestsView.notePlaceholder}
                              className="w-36 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 py-1 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                postOperation(
                                  {
                                    action: 'request_review',
                                    id: r.id,
                                    status: 'completed',
                                    admin_note: requestNotes[r.id] || '',
                                  },
                                  translateStatus('completed', lang)
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              {t.admin.requestsView.completeBtn}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 7. LIVE ACTIVITY & AUDIT LOG */}
              {view === 'audit' && (
                <RealTimeActivityLog
                  lang={lang}
                  mode="full"
                  initialEvents={auditEvents}
                  onLiveEvent={handleLiveActivityEvent}
                />
              )}

              {/* 8. DETAILED REPORTS */}
              {view === 'reports' && reportsData && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500">
                          {t.admin.reportsView.startDate}
                        </label>
                        <input
                          type="date"
                          dir="ltr"
                          value={reportStart}
                          onChange={(e) => setReportStart(e.target.value)}
                          className="mt-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500">
                          {t.admin.reportsView.endDate}
                        </label>
                        <input
                          type="date"
                          dir="ltr"
                          value={reportEnd}
                          onChange={(e) => setReportEnd(e.target.value)}
                          className="mt-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                        />
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-xs font-medium text-slate-500">
                        {t.admin.reportsView.approvedRevenue}
                      </div>
                      <div className="font-display text-2xl font-extrabold tabular-nums text-emerald-700" dir="ltr">
                        {formatCurrencyUsd(reportsData.revenue?.USD || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(reportsData.counts || {}).map(([key, count]) => (
                      <div
                        key={key}
                        className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs"
                      >
                        <div>
                          <div className="text-xs font-medium text-slate-500">
                            {translateStatus(key, lang)}
                          </div>
                          <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-[#041E4A]">
                            {String(count)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            downloadSectionCsv(key, reportsData.sections?.[key] || [])
                          }
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{t.admin.reportsView.exportCsv}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const breakdown: PlatformAnalyticsBreakdown =
                      reportsData.breakdown ||
                      computePlatformAnalyticsBreakdown(reportsData.sections?.cases || []);
                    const categoryLabels = t.workspace.submitForm.categories as Record<string, string>;
                    return (
                      <div
                        data-testid="admin-analytics-breakdown"
                        className="rounded-2xl border border-[#DCE7F2] bg-white p-5 space-y-5 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="font-display text-base font-bold text-[#041E4A]">
                              {t.enhancements.analytics.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {t.enhancements.analytics.subtitle}
                            </p>
                          </div>
                          <button
                            type="button"
                            data-testid="admin-export-platform-csv-btn"
                            disabled={breakdown.totalCases === 0}
                            onClick={() => {
                              const csv = buildPlatformAnalyticsCsv(breakdown);
                              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                              triggerBlobDownload(
                                blob,
                                `fullremove-platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-[#041E4A] disabled:opacity-45 cursor-pointer"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{t.enhancements.analytics.exportPlatformCsv}</span>
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3">
                            <div className="text-[11px] font-medium text-slate-500">
                              {t.enhancements.analytics.slaCompliance}
                            </div>
                            <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-emerald-700" dir="ltr">
                              {breakdown.slaCompliancePercent}%
                            </div>
                          </div>
                          <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3">
                            <div className="text-[11px] font-medium text-slate-500">
                              {t.enhancements.analytics.resolutionRate}
                            </div>
                            <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#0057B8]" dir="ltr">
                              {breakdown.overallResolutionRatePercent}%
                            </div>
                          </div>
                          <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3">
                            <div className="text-[11px] font-medium text-slate-500">
                              {t.enhancements.analytics.watchedLinks}
                            </div>
                            <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#041E4A]" dir="ltr">
                              {breakdown.watchedCount}
                            </div>
                          </div>
                          <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3">
                            <div className="text-[11px] font-medium text-slate-500">
                              {t.enhancements.analytics.overdueCases}
                            </div>
                            <div
                              className={`mt-1 font-display text-xl font-extrabold tabular-nums ${
                                breakdown.overdueCount > 0 ? 'text-amber-700' : 'text-[#041E4A]'
                              }`}
                              dir="ltr"
                            >
                              {breakdown.overdueCount}
                            </div>
                          </div>
                        </div>

                        {breakdown.totalCases === 0 ? (
                          <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-6 text-center text-xs text-slate-500">
                            {t.enhancements.analytics.emptyText}
                          </div>
                        ) : (
                          <div className="grid gap-5 lg:grid-cols-2 min-w-0">
                            <div className="min-w-0 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3">
                              <div className="text-xs font-semibold text-slate-900">
                                {t.enhancements.analytics.byPlatform}
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-start text-xs">
                                  <thead>
                                    <tr className="border-b border-[#DCE7F2] text-[11px] text-slate-500">
                                      <th className="py-2 pe-3 text-start">{t.enhancements.analytics.platformCol}</th>
                                      <th className="py-2 px-2 text-end">{t.enhancements.analytics.totalCol}</th>
                                      <th className="py-2 px-2 text-end">{t.enhancements.analytics.resolvedCol}</th>
                                      <th className="py-2 px-2 text-end">{t.enhancements.analytics.rateCol}</th>
                                      <th className="py-2 ps-2 text-end">{t.enhancements.analytics.avgTurnaroundCol}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200/70">
                                    {breakdown.byPlatform.map((row) => (
                                      <tr key={row.platform}>
                                        <td className="py-2.5 pe-3 font-medium text-slate-900">
                                          <div>{row.platform}</div>
                                          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                              className="h-full rounded-full bg-[#0057B8]"
                                              style={{ width: `${row.resolutionRatePercent}%` }}
                                            />
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-2 text-end tabular-nums text-slate-600" dir="ltr">
                                          {row.total}
                                        </td>
                                        <td className="py-2.5 px-2 text-end tabular-nums font-medium text-emerald-700" dir="ltr">
                                          {row.resolved}
                                        </td>
                                        <td className="py-2.5 px-2 text-end tabular-nums font-semibold text-[#041E4A]" dir="ltr">
                                          {row.resolutionRatePercent}%
                                        </td>
                                        <td className="py-2.5 ps-2 text-end tabular-nums text-slate-500" dir="ltr">
                                          {row.averageLabel || '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="min-w-0 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3">
                              <div className="text-xs font-semibold text-slate-900">
                                {t.enhancements.analytics.byCategory}
                              </div>
                              <div className="space-y-3">
                                {breakdown.byCategory.map((row) => (
                                  <div key={row.complaintType} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                      <span className="font-medium text-slate-700 truncate">
                                        {categoryLabels[row.complaintType] || row.complaintType}
                                      </span>
                                      <span className="shrink-0 tabular-nums text-slate-600 font-medium" dir="ltr">
                                        {row.resolved}/{row.total} · {row.resolutionRatePercent}%
                                      </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                      <div
                                        className="h-full rounded-full bg-emerald-600"
                                        style={{ width: `${row.resolutionRatePercent}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 9. WEBSITE VISITORS */}
              {view === 'visitors' && visitorsData && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      <span>
                        {t.admin.visitorsView.liveSummary(
                          visitorsData.realtime.visitors_online,
                          visitorsData.realtime.requests_per_min,
                          visitorsData.realtime.top_country
                        )}
                      </span>
                    </div>
                    <select
                      value={visitorDays}
                      onChange={(e) => setVisitorDays(Number(e.target.value))}
                      className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0057B8]"
                    >
                      <option value={7}>{t.admin.visitorsView.last7Days}</option>
                      <option value={30}>{t.admin.visitorsView.last30Days}</option>
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {[
                      { label: t.admin.visitorsView.sessions, value: visitorsData.summary.sessions },
                      {
                        label: t.admin.visitorsView.uniqueVisitors,
                        value: visitorsData.summary.unique_visitors,
                      },
                      { label: t.admin.visitorsView.pageViews, value: visitorsData.summary.page_views },
                      { label: t.admin.visitorsView.conversions, value: visitorsData.summary.inquiries },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                        <div className="text-xs font-medium text-slate-500">{s.label}</div>
                        <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums text-[#041E4A]">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Activity className="h-4 w-4 text-[#0057B8]" />
                      <span>{t.admin.visitorsView.trafficTitle}</span>
                    </div>
                    <div className="mt-4 flex items-end gap-2 h-28" dir="ltr">
                      {visitorsData.realtime.traffic.map((bucket: any) => (
                        <div
                          key={bucket.bucket}
                          className="flex-1 h-full flex flex-col justify-end items-center gap-1.5"
                        >
                          <div className="w-full flex-1 flex items-end">
                            <div
                              className="w-full rounded-t bg-[#0057B8] min-h-[4px]"
                              style={{
                                height: `${Math.min(100, Math.max(10, bucket.requests * 12))}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">{bucket.bucket}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.admin.visitorsView.cols.session}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.visitorsView.cols.location}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.visitorsView.cols.device}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.visitorsView.cols.pages}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.visitorsView.cols.views}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.visitorsView.cols.inquiry}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {visitorsData.sessions.map((s: VisitorSessionRecord) => (
                          <tr key={s.id} className="hover:bg-slate-50/75">
                            <td className="px-5 py-3.5 font-mono text-slate-600" dir="ltr">
                              {s.session_key}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-[#041E4A]">
                              {s.country_code} {s.city ? `· ${s.city}` : ''}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">
                              {s.device_type} · {s.browser} ({s.operating_system})
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[#0057B8]" dir="ltr">
                              {s.landing_page} → {s.last_page}
                            </td>
                            <td className="px-5 py-3.5 text-end font-mono tabular-nums text-slate-700">
                              {s.page_views}
                            </td>
                            <td className="px-5 py-3.5 text-end">
                              {s.inquiry_submitted ? (
                                <span className="text-emerald-700 font-semibold">
                                  {t.admin.visitorsView.convertedTag}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 10. PLATFORM STAFF ROLES */}
              {view === 'roles' && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <form
                    onSubmit={handleGrantRole}
                    className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 lg:col-span-4 shadow-xs"
                  >
                    <h2 className="font-display text-base font-bold text-[#041E4A]">
                      {t.admin.rolesView.formTitle}
                    </h2>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={newRoleEmail}
                      onChange={(e) => setNewRoleEmail(e.target.value)}
                      placeholder={t.admin.rolesView.emailPlaceholder}
                      className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
                    />
                    <select
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value as PlatformRoleName)}
                      className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                    >
                      <option value="operations_admin">{translateRole('operations_admin', lang)}</option>
                      <option value="case_manager">{translateRole('case_manager', lang)}</option>
                      <option value="support_agent">{translateRole('support_agent', lang)}</option>
                      <option value="privacy_officer">{translateRole('privacy_officer', lang)}</option>
                      <option value="auditor">{translateRole('auditor', lang)}</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#0057B8] py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                    >
                      {t.admin.rolesView.assignBtn}
                    </button>
                  </form>

                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white lg:col-span-8 shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.admin.rolesView.cols.email}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.rolesView.cols.role}</th>
                          <th className="px-5 py-3.5 text-start">{t.admin.rolesView.cols.status}</th>
                          <th className="px-5 py-3.5 text-end">{t.admin.rolesView.cols.manage}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {roles.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/75">
                            <td className="px-5 py-3.5 font-mono font-semibold text-[#041E4A]" dir="ltr">
                              {r.email}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-[#0057B8]">
                              {translateRole(r.role, lang)}
                            </td>
                            <td className={`px-5 py-3.5 text-xs font-semibold ${statusTone(r.status)}`}>
                              {translateStatus(r.status, lang)}
                            </td>
                            <td className="px-5 py-3.5 text-end">
                              <button
                                type="button"
                                onClick={() =>
                                  postOperation(
                                    { action: 'suspend_role', email: r.email },
                                    `${r.email} · ${translateStatus(
                                      r.status === 'suspended' ? 'active' : 'suspended',
                                      lang
                                    )}`
                                  )
                                }
                                className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                {r.status === 'suspended'
                                  ? t.admin.rolesView.activate
                                  : t.admin.rolesView.suspend}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Customer Profile Modal */}
      {customerProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/45 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[520px] rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#DCE7F2] pb-3.5">
              <div>
                <div className="text-xs font-semibold text-[#0057B8]">
                  {t.admin.profileModal.eyebrow}
                </div>
                <h2 className="mt-1 font-display text-lg font-bold text-[#041E4A]">
                  {customerProfileModal.full_name}
                </h2>
              </div>
              <button
                type="button"
                aria-label={t.common.close}
                onClick={() => setCustomerProfileModal(null)}
                className="rounded-lg border border-[#DCE7F2] p-1 text-slate-500 hover:text-[#041E4A] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">{t.admin.profileModal.email}</span>{' '}
                <span className="font-mono text-[#041E4A]" dir="ltr">
                  {customerProfileModal.email}
                </span>
              </div>
              <div>
                <span className="text-slate-500">{t.admin.profileModal.phone}</span>{' '}
                <span className="font-mono text-[#041E4A]" dir="ltr">
                  {customerProfileModal.phone_number || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">{t.admin.profileModal.workspace}</span>{' '}
                <span className="font-medium text-[#041E4A]">{customerProfileModal.workspace_name}</span>
              </div>
              <div>
                <span className="text-slate-500">{t.admin.profileModal.idDoc}</span>{' '}
                <span className="font-mono font-medium text-emerald-700" dir="ltr">
                  {customerProfileModal.identity_document_name || t.common.none}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Central Admin Case Workbench Modal */}
      {caseModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/45 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-[920px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-2xl shadow-[#041E4A]/20 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#DCE7F2] pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-[#0057B8]" dir="ltr">
                    {caseModalData.case.case_number}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{caseModalData.case.organization_name}</span>
                </div>
                <h2 className="mt-1 font-display text-lg font-bold text-[#041E4A]">
                  {caseModalData.case.title}
                </h2>
                <div className="mt-1 font-mono text-[11px] text-slate-500 break-all" dir="ltr">
                  {caseModalData.case.source_url}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {can('write_cases') && (
                  <button
                    type="button"
                    data-testid="admin-toggle-monitor-btn"
                    onClick={async () => {
                      await postOperation(
                        { action: 'case_toggle_monitor', id: caseModalData.case.id },
                        caseModalData.case.monitoring_enabled
                          ? t.enhancements.watchlist.paused
                          : t.enhancements.watchlist.active
                      );
                      await openCaseModal(caseModalData.case.id);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      caseModalData.case.monitoring_enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-[#DCE7F2] bg-[#F7FAFC] text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>
                      {caseModalData.case.monitoring_enabled
                        ? t.enhancements.watchlist.pauseBtn
                        : t.enhancements.watchlist.enableBtn}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="admin-certificate-pdf-btn"
                  onClick={() => handleDownloadCaseCertificate(caseModalData.case)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{t.enhancements.certificate.downloadBtn}</span>
                </button>
                {can('write_cases') && (
                  <button
                    type="button"
                    onClick={() => setNoticeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{t.staff.caseModal.draftNoticeBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t.common.close}
                  onClick={() => setCaseModalData(null)}
                  className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#041E4A] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="text-xs font-semibold text-slate-700">
                  {t.admin.caseModal.statusControl}
                </div>
                <select
                  value={caseStatusInput}
                  onChange={(e) => setCaseStatusInput(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                >
                  {[
                    'submitted',
                    'reviewing',
                    'needs_information',
                    'approved',
                    'submitted_to_platform',
                    'action_taken',
                    'resolved',
                    'rejected',
                    'disputed',
                    'closed',
                  ].map((s) => (
                    <option key={s} value={s}>
                      {translateStatus(s, lang)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      {
                        action: 'case_status',
                        id: caseModalData.case.id,
                        status: caseStatusInput,
                      },
                      translateStatus(caseStatusInput, lang)
                    );
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="w-full rounded-lg bg-[#0057B8] py-2 text-xs font-semibold text-white hover:bg-[#004494] disabled:opacity-40 cursor-pointer"
                >
                  {t.admin.caseModal.updateStatusBtn}
                </button>
              </div>

              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="text-xs font-semibold text-slate-700">
                  {t.admin.caseModal.ownerTitle}
                </div>
                <select
                  aria-label={t.admin.caseModal.ownerTitle}
                  value={caseAssigneeInput}
                  onChange={(e) => setCaseAssigneeInput(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                >
                  <option value="">{t.common.unassigned}</option>
                  <option value="ops@fremove.com">ops@fremove.com</option>
                  <option value="amina@fremove.com">amina@fremove.com</option>
                  <option value="tariq@fremove.com">tariq@fremove.com</option>
                </select>
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      {
                        action: 'case_assign',
                        id: caseModalData.case.id,
                        assignee: caseAssigneeInput,
                      },
                      caseAssigneeInput || t.common.unassigned
                    );
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  {t.admin.caseModal.assignBtn}
                </button>
              </div>

              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="text-xs font-semibold text-[#0057B8]">
                  {t.admin.caseModal.replyTitle}
                </div>
                {can('write_cases') && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-medium text-slate-500">
                      {t.enhancements.quickReplies.heading}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.enhancements.quickReplies.items.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          data-testid={`admin-quick-reply-${preset.id}`}
                          onClick={() => setCaseReply(preset.text)}
                          className="rounded-lg border border-[#DCE7F2] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#0057B8] hover:text-[#0057B8] cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={caseReply}
                  onChange={(e) => setCaseReply(e.target.value)}
                  placeholder={t.admin.caseModal.replyPlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      { action: 'case_reply', id: caseModalData.case.id, message: caseReply },
                      t.workspace.caseModal.messageSent
                    );
                    setCaseReply('');
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="w-full rounded-lg bg-[#041E4A] py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  {t.admin.caseModal.sendBtn}
                </button>
              </div>

              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="text-xs font-semibold text-amber-700">
                  {t.admin.caseModal.privateNoteTitle}
                </div>
                <input
                  type="text"
                  value={caseNote}
                  onChange={(e) => setCaseNote(e.target.value)}
                  placeholder={t.admin.caseModal.privateNotePlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      { action: 'case_note', id: caseModalData.case.id, message: caseNote },
                      t.staff.caseModal.saveNoteBtn
                    );
                    setCaseNote('');
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-40 cursor-pointer"
                >
                  {t.admin.caseModal.saveNoteBtn}
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="text-xs font-semibold text-[#0057B8]">
                  {t.admin.caseModal.filingTitle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={subPlatform}
                    onChange={(e) => setSubPlatform(e.target.value)}
                    placeholder={caseModalData.case.platform}
                    className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                  />
                  <input
                    type="text"
                    value={subRef}
                    onChange={(e) => setSubRef(e.target.value)}
                    placeholder={t.admin.caseModal.refPlaceholder}
                    className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                  />
                </div>
                <input
                  type="text"
                  value={subSummary}
                  onChange={(e) => setSubSummary(e.target.value)}
                  placeholder={t.admin.caseModal.filingNotePlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      {
                        action: 'case_submission',
                        id: caseModalData.case.id,
                        platform: subPlatform || caseModalData.case.platform,
                        external_reference: subRef,
                        response_summary: subSummary,
                      },
                      t.staff.caseModal.submissionSaved
                    );
                    setSubRef('');
                    setSubSummary('');
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="rounded-lg bg-[#0057B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004494] disabled:opacity-40 cursor-pointer"
                >
                  {t.admin.caseModal.saveFilingBtn}
                </button>
              </div>

              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-emerald-700">
                    {t.admin.caseModal.verifyTitle}
                  </div>
                  {can('write_cases') && (
                    <button
                      type="button"
                      disabled={urlCheckBusy}
                      onClick={() =>
                        handleRunLiveUrlCheck(
                          caseModalData.case.id,
                          caseModalData.case.source_url
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] disabled:opacity-60 cursor-pointer"
                    >
                      <Globe2 className="h-3.5 w-3.5" />
                      <span>
                        {urlCheckBusy ? t.staff.caseModal.checkingUrl : t.staff.caseModal.runUrlCheck}
                      </span>
                    </button>
                  )}
                </div>
                {urlCheckDiagnostic && (
                  <div
                    dir="ltr"
                    className="rounded-lg border border-[#0057B8]/25 bg-white px-3 py-2 font-mono text-[11px] text-slate-700 text-start"
                  >
                    {urlCheckDiagnostic}
                  </div>
                )}
                <select
                  value={verResult}
                  onChange={(e) => setVerResult(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                >
                  <option value="confirmed_removed">{translateStatus('confirmed_removed', lang)}</option>
                  <option value="still_accessible">{translateStatus('still_accessible', lang)}</option>
                  <option value="redirected">{translateStatus('redirected', lang)}</option>
                </select>
                <input
                  type="text"
                  value={verNotes}
                  onChange={(e) => setVerNotes(e.target.value)}
                  placeholder={t.admin.caseModal.verifyNotePlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <button
                  type="button"
                  disabled={!can('write_cases')}
                  onClick={async () => {
                    await postOperation(
                      {
                        action: 'case_verification',
                        id: caseModalData.case.id,
                        result: verResult,
                        checked_url: caseModalData.case.source_url,
                        notes: verNotes,
                      },
                      t.staff.caseModal.verifySaved
                    );
                    setVerNotes('');
                    await openCaseModal(caseModalData.case.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.admin.caseModal.saveVerifyBtn}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">
                {t.admin.caseModal.evidenceTitle(caseModalData.evidence.length)}
              </div>
              {caseModalData.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 text-xs border-b border-[#DCE7F2] pb-2 last:border-b-0"
                >
                  <span className="flex items-center gap-2 font-medium text-[#041E4A]">
                    <FileCheck2 className="h-3.5 w-3.5 text-[#0057B8]" />
                    <span>{ev.title}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] font-medium text-emerald-700" dir="ltr">
                      {ev.sha256_preview}
                    </span>
                    {ev.has_encrypted_file && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadEvidence(
                            caseModalData.case.id,
                            ev.id,
                            ev.file_name || `${ev.id}.bin`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#0057B8] hover:bg-[#EFF7FC] cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>{t.common.download}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {caseModalData && noticeModalOpen && (
        <TakedownNoticeModal
          lang={lang}
          caseItem={caseModalData.case}
          onClose={() => setNoticeModalOpen(false)}
          onRecordSubmission={async ({
            platform,
            submission_channel,
            external_reference,
            response_summary,
          }) => {
            await postOperation(
              {
                action: 'case_submission',
                id: caseModalData.case.id,
                platform,
                submission_channel,
                external_reference,
                response_summary,
              },
              t.staff.caseModal.noticeRecorded(caseModalData.case.case_number)
            );
            await openCaseModal(caseModalData.case.id);
          }}
        />
      )}

      {/* Support Ticket Modal */}
      {ticketModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/45 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#DCE7F2] pb-3.5">
              <div>
                <div className="text-xs font-semibold text-[#0057B8]">
                  <span className="font-mono" dir="ltr">
                    {ticketModalData.ticket_number}
                  </span>{' '}
                  · {ticketModalData.organization_name}
                </div>
                <h2 className="mt-1 font-display text-lg font-bold text-[#041E4A]">
                  {ticketModalData.subject}
                </h2>
              </div>
              <button
                type="button"
                aria-label={t.common.close}
                onClick={() => setTicketModalData(null)}
                className="rounded-lg border border-[#DCE7F2] p-1 text-slate-500 hover:text-[#041E4A] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {ticketModalData.messages.map((m: any) => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-3.5 text-xs ${
                    m.visibility === 'internal'
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-[#DCE7F2] bg-[#F7FAFC] text-slate-800'
                  }`}
                >
                  <div className="text-[11px] text-slate-500">
                    {translateRole(m.sender_role, lang)} ({m.visibility || 'customer'}) ·{' '}
                    <span className="font-mono" dir="ltr">
                      {m.sender_email}
                    </span>
                  </div>
                  <p className="mt-1">{m.message}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 border-t border-[#DCE7F2] pt-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  placeholder={t.admin.ticketModal.replyPlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await postOperation(
                      { action: 'support_reply', id: ticketModalData.id, message: ticketReply },
                      t.workspace.supportTab.replyPosted
                    );
                    setTicketReply('');
                    await openTicketModal(ticketModalData.id);
                  }}
                  className="w-full rounded-lg bg-[#0057B8] py-2 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                >
                  {t.admin.ticketModal.sendReply}
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={ticketNote}
                  onChange={(e) => setTicketNote(e.target.value)}
                  placeholder={t.admin.ticketModal.notePlaceholder}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await postOperation(
                      { action: 'support_note', id: ticketModalData.id, message: ticketNote },
                      t.staff.caseModal.saveNoteBtn
                    );
                    setTicketNote('');
                    await openTicketModal(ticketModalData.id);
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                >
                  {t.admin.ticketModal.saveNote}
                </button>
              </div>

              <div className="space-y-2">
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                >
                  <option value="open">{translateStatus('open', lang)}</option>
                  <option value="in_progress">{translateStatus('in_progress', lang)}</option>
                  <option value="waiting_customer">{translateStatus('waiting_customer', lang)}</option>
                  <option value="resolved">{translateStatus('resolved', lang)}</option>
                  <option value="closed">{translateStatus('closed', lang)}</option>
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    await postOperation(
                      { action: 'support_status', id: ticketModalData.id, status: ticketStatus },
                      translateStatus(ticketStatus, lang)
                    );
                    await openTicketModal(ticketModalData.id);
                  }}
                  className="w-full rounded-lg bg-[#041E4A] py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  {t.admin.ticketModal.saveStatus}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <QuickJumpModal
        open={quickJumpOpen}
        onClose={() => setQuickJumpOpen(false)}
        lang={lang}
        sections={[
          ...visibleNavGroups.map((item) => ({
            id: item.id,
            label: item.label,
            onSelect: () => {
              setView(item.id);
              setSearchTerm('');
            },
          })),
          {
            id: 'staff-console',
            label: t.admin.openStaffConsole,
            onSelect: () => onNavigate('/staff'),
          },
        ]}
        cases={cases.map((c) => ({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          platform: c.platform,
          status: c.status,
          onSelect: () => {
            setView('cases');
            openCaseModal(c.id);
          },
        }))}
      />
    </div>
  );
}
