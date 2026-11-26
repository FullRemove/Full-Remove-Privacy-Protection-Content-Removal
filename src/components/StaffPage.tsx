import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Globe2,
  Inbox,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  PORTAL_TRANSLATIONS,
  translateActionLabel,
  translateRole,
  translateSlaLabel,
  translateStatus,
} from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { authFetch, clearAuthToken } from '../lib/authClient';
import {
  buildSingleCaseCertificateData,
  buildStaffQueueCsv,
  computeCaseSla,
  computePlatformAnalyticsBreakdown,
  filterAndSortCases,
  filterStaffCasesQueue,
  getNextCaseActions,
  type InquiryRecord,
  type ProtectionCase,
  type StaffQueueStatusFilter,
} from '../lib/caseLogic';
import { generateSingleCaseCertificatePdfBlob, triggerBlobDownload } from '../lib/caseReportPdf';
import { BrandLogoMark } from './BrandLogoMark';
import { PortalLanguageSwitcher } from './PortalLanguageSwitcher';
import { QuickJumpModal } from './QuickJumpModal';
import { TakedownNoticeModal } from './TakedownNoticeModal';

interface StaffPageProps {
  onNavigate: (path: string) => void;
  lang?: LangCode;
  onChangeLang?: (lang: LangCode) => void;
}

type StaffTab = 'cases' | 'inquiries' | 'team';

interface StaffWorkspaceData {
  organization: { name: string };
  current_role: string;
  user: { email: string; name: string };
  totals: { total: number; open: number; needs_information: number; resolved: number };
  cases: ProtectionCase[];
  inquiries: InquiryRecord[];
  staff: { id: string; email: string; display_name: string; role: string; status: string }[];
  invitations: { id: string; invited_email: string; role: string; expires_at: string }[];
}

function slaColor(health: string): string {
  if (health === 'overdue') return 'text-rose-700';
  if (health === 'due_soon') return 'text-amber-700';
  if (health === 'completed') return 'text-emerald-700';
  return 'text-[#0057B8]';
}

function statusColor(status: string): string {
  if (['resolved', 'closed', 'converted', 'confirmed_removed', 'action_taken'].includes(status)) {
    return 'text-emerald-700';
  }
  if (['rejected', 'disputed'].includes(status)) {
    return 'text-rose-700';
  }
  if (['needs_information', 'new'].includes(status)) {
    return 'text-amber-700';
  }
  if (['reviewing', 'submitted_to_platform', 'under_review'].includes(status)) {
    return 'text-[#0057B8]';
  }
  return 'text-slate-600';
}

export function StaffPage({
  onNavigate,
  lang = 'en',
  onChangeLang,
}: StaffPageProps) {
  const [tab, setTab] = useState<StaffTab>('cases');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<StaffWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffQueueStatusFilter>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'case_az' | 'status' | 'sla_urgent'>('newest');
  const [onlyAssignedToMe, setOnlyAssignedToMe] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sweepBusy, setSweepBusy] = useState(false);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  // Modal Workbench Forms
  const [actionNote, setActionNote] = useState('');
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [subPlatform, setSubPlatform] = useState('');
  const [subChannel, setSubChannel] = useState('platform_portal');
  const [subRef, setSubRef] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [verResult, setVerResult] = useState('confirmed_removed');
  const [verUrl, setVerUrl] = useState('');
  const [verNotes, setVerNotes] = useState('');
  const [urlCheckBusy, setUrlCheckBusy] = useState(false);
  const [urlCheckDiagnostic, setUrlCheckDiagnostic] = useState('');

  // Invite form
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst');

  const t = PORTAL_TRANSLATIONS[lang];
  const langRef = useRef<LangCode>(lang);
  langRef.current = lang;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/staff/workspace');
      if (res.status === 401 || res.status === 403) {
        onNavigate('/login');
        return;
      }
      const json = (await res.json()) as StaffWorkspaceData;
      setData(json);
    } catch {
      setBanner({ kind: 'error', text: PORTAL_TRANSLATIONS[langRef.current].staff.loadError });
    } finally {
      setLoading(false);
    }
  }, [onNavigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const isReadOnly = data?.current_role === 'viewer';

  const visibleCases = useMemo(() => {
    if (!data) return [];
    const filtered = filterStaffCasesQueue(data.cases, {
      query,
      statusFilter,
      assigneeEmail: onlyAssignedToMe ? data.user.email : undefined,
    });
    return filterAndSortCases(filtered, '', sort);
  }, [data, onlyAssignedToMe, query, sort, statusFilter]);

  const queuePulse = useMemo(
    () => computePlatformAnalyticsBreakdown(data?.cases || []),
    [data?.cases]
  );

  const selectedCase = useMemo(
    () => data?.cases.find((c) => c.id === selectedCaseId) || null,
    [data, selectedCaseId]
  );

  const visibleCaseIds = useMemo(() => visibleCases.map((c) => c.id), [visibleCases]);
  const allVisibleSelected =
    visibleCaseIds.length > 0 && visibleCaseIds.every((id) => selectedCaseIds.includes(id));

  const toggleSelectCase = (caseId: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedCaseIds((prev) => prev.filter((id) => !visibleCaseIds.includes(id)));
    } else {
      setSelectedCaseIds((prev) => Array.from(new Set([...prev, ...visibleCaseIds])));
    }
  };

  const runBulkAction = async (action: 'assign_self' | 'start_review' | 'toggle_monitor') => {
    if (selectedCaseIds.length === 0 || isReadOnly) return;
    setBulkBusy(true);
    try {
      const res = await authFetch('/api/staff/cases/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCaseIds, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.staff.loadError });
        return;
      }
      setBanner({
        kind: 'success',
        text: t.enhancements.queueFilters.bulkUpdated(json.updated_count ?? selectedCaseIds.length),
      });
      setSelectedCaseIds([]);
      await loadData();
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExportStaffCsv = () => {
    if (visibleCases.length === 0) return;
    const csv = buildStaffQueueCsv(visibleCases);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, `full-remove-staff-queue-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleRunWatchlistSweep = async () => {
    if (isReadOnly || sweepBusy) return;
    setSweepBusy(true);
    setBanner(null);
    try {
      const res = await authFetch('/api/staff/watchlist/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.staff.loadError });
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
      await loadData();
    } catch {
      setBanner({ kind: 'error', text: t.staff.loadError });
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

  const handleSignOut = async () => {
    await authFetch('/api/auth/signout', { method: 'POST' });
    clearAuthToken();
    onNavigate('/');
  };

  const runCaseAction = async (
    action: string,
    message?: string,
    extra: Record<string, unknown> = {}
  ) => {
    if (!selectedCase) return;
    const res = await authFetch(`/api/staff/cases/${selectedCase.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, message, ...extra }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.staff.loadError });
      return;
    }
    setActionNote('');
    setReplyText('');
    setInternalNote('');
    setBanner({ kind: 'success', text: json.message || t.staff.inquiriesTable.updatedToast });
    await loadData();
  };

  const handleRunLiveUrlCheck = async () => {
    if (!selectedCase) return;
    setUrlCheckBusy(true);
    setUrlCheckDiagnostic('');
    try {
      const res = await authFetch(`/api/staff/cases/${selectedCase.id}/check-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked_url: verUrl.trim() || selectedCase.source_url }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBanner({ kind: 'error', text: json.error || t.staff.loadError });
        return;
      }
      setUrlCheckDiagnostic(json.diagnostic_note || '');
      setBanner({
        kind: 'success',
        text: `${translateStatus(json.verification.result, lang)} — ${json.diagnostic_note}`,
      });
      await loadData();
    } finally {
      setUrlCheckBusy(false);
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
        setBanner({ kind: 'error', text: t.staff.loadError });
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
      setBanner({ kind: 'error', text: t.staff.loadError });
    }
  };

  const handleAddSubmission = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    const res = await authFetch(`/api/staff/cases/${selectedCase.id}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: subPlatform || selectedCase.platform,
        submission_channel: subChannel,
        status: 'submitted',
        external_reference: subRef,
        response_summary: subSummary,
      }),
    });
    if (res.ok) {
      setSubRef('');
      setSubSummary('');
      setBanner({ kind: 'success', text: t.staff.caseModal.submissionSaved });
      await loadData();
    }
  };

  const handleAddVerification = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    const res = await authFetch(`/api/staff/cases/${selectedCase.id}/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: verResult,
        checked_url: verUrl || selectedCase.source_url,
        notes: verNotes,
      }),
    });
    if (res.ok) {
      setVerNotes('');
      setBanner({ kind: 'success', text: t.staff.caseModal.verifySaved });
      await loadData();
    }
  };

  const handleInquiryAction = async (
    inqId: string,
    action: 'mark_reviewed' | 'convert_to_case' | 'archive'
  ) => {
    const res = await authFetch(`/api/staff/inquiries/${inqId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.staff.loadError });
      return;
    }
    if (action === 'convert_to_case' && json.case) {
      setBanner({
        kind: 'success',
        text: t.staff.inquiriesTable.convertedToast(json.case.case_number),
      });
      setTab('cases');
      setSelectedCaseId(json.case.id);
    } else {
      setBanner({ kind: 'success', text: t.staff.inquiriesTable.updatedToast });
    }
    await loadData();
  };

  const handleInviteStaff = async (e: FormEvent) => {
    e.preventDefault();
    const res = await authFetch('/api/staff/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invEmail, role: invRole }),
    });
    const json = await res.json();
    if (!res.ok) {
      setBanner({ kind: 'error', text: json.error || t.staff.loadError });
      return;
    }
    setInvEmail('');
    setBanner({
      kind: 'success',
      text: t.staff.teamTab.invitedToast(json.invitation.invited_email),
    });
    await loadData();
  };

  const handleRoleUpdate = async (id: string, payload: { role?: string; action?: string }) => {
    await authFetch(`/api/staff/team/${id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#041E4A] flex">
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
              <BrandLogoMark size="sm" tone="light" label={t.staff.brandTitle} />
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
            <div className="text-[11px] font-semibold text-[#00758A]">
              {t.staff.consoleLabel} · {translateRole(data?.current_role || 'analyst', lang)}
            </div>
            <div className="mt-1 truncate text-xs font-semibold text-[#041E4A]">
              {data?.user.name || t.staff.consoleLabel}
            </div>
            <div className="truncate font-mono text-[11px] text-slate-500" dir="ltr">
              {data?.user.email || ''}
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'cases' as const, label: t.staff.nav.cases, icon: Briefcase, count: data?.totals.open },
              {
                id: 'inquiries' as const,
                label: t.staff.nav.inquiries,
                icon: Inbox,
                count: data?.inquiries.filter((i) => !i.status || i.status === 'new').length,
              },
              { id: 'team' as const, label: t.staff.nav.team, icon: Users, count: data?.staff.length },
            ].map((item) => {
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
                      ? 'bg-[#E6F6F8] text-[#00758A] font-semibold border border-[#00869E]/30'
                      : 'text-slate-600 hover:bg-[#EFF5FA] hover:text-[#041E4A] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00758A]' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && (
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
          <button
            type="button"
            onClick={() => onNavigate('/platform-ops')}
            className="flex w-full items-center justify-between rounded-xl border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-2 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
          >
            <span>{t.staff.openCentralAdmin}</span>
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/workspace')}
            className="w-full rounded-xl border border-[#DCE7F2] px-3 py-2 text-start text-xs font-medium text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
          >
            {t.staff.backToWorkspace}
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

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[#DCE7F2] bg-white/92 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t.workspace.openMenu}
              className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-600 lg:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-400">{t.staff.breadcrumbRoot}</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="truncate font-semibold text-[#041E4A]">
                {tab === 'cases'
                  ? t.staff.nav.cases
                  : tab === 'inquiries'
                    ? t.staff.nav.inquiries
                    : t.staff.nav.team}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="staff-quick-jump-btn"
              onClick={() => setQuickJumpOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-[#041E4A] cursor-pointer"
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
              onClick={() => onNavigate('/platform-ops')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer whitespace-nowrap"
            >
              <span>{t.staff.openCentralAdmin}</span>
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-[1240px] w-full mx-auto space-y-6">
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
              {t.staff.loadingText}
            </div>
          ) : (
            data && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: t.staff.kpis.total, value: data.totals.total },
                    { label: t.staff.kpis.open, value: data.totals.open },
                    { label: t.staff.kpis.waitingClient, value: data.totals.needs_information },
                    { label: t.staff.kpis.resolved, value: data.totals.resolved },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs"
                    >
                      <div className="text-xs font-medium text-slate-500">{k.label}</div>
                      <div className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[#041E4A]">
                        {k.value}
                      </div>
                    </div>
                  ))}
                </div>

                {tab === 'cases' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE7F2] bg-white px-4 py-3 text-xs shadow-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-600">
                        <span>
                          {t.enhancements.analytics.slaCompliance}:{' '}
                          <strong className="font-mono tabular-nums text-emerald-700">
                            {queuePulse.slaCompliancePercent}%
                          </strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>
                          {t.enhancements.analytics.watchedLinks}:{' '}
                          <strong className="font-mono tabular-nums text-[#0057B8]">
                            {queuePulse.watchedCount}
                          </strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>
                          {t.enhancements.analytics.overdueCases}:{' '}
                          <strong
                            className={`font-mono tabular-nums ${
                              queuePulse.overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'
                            }`}
                          >
                            {queuePulse.overdueCount}
                          </strong>
                        </span>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          data-testid="staff-watchlist-sweep-btn"
                          disabled={sweepBusy || queuePulse.watchedCount === 0}
                          onClick={handleRunWatchlistSweep}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-45 cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${sweepBusy ? 'animate-spin' : ''}`} />
                          <span>
                            {sweepBusy
                              ? t.enhancements.watchlistSweep.runningBtn
                              : `${t.enhancements.watchlistSweep.runBtn} (${queuePulse.watchedCount})`}
                          </span>
                        </button>
                      )}
                    </div>

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
                        const active = statusFilter === filterKey;
                        return (
                          <button
                            key={filterKey}
                            type="button"
                            data-testid={`staff-status-filter-${filterKey}`}
                            onClick={() => setStatusFilter(filterKey)}
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
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={t.staff.filters.searchPlaceholder}
                          className="w-full sm:w-80 rounded-xl border border-[#DCE7F2] bg-white px-3.5 py-2 text-xs text-[#041E4A] placeholder:text-slate-400 outline-none focus:border-[#0057B8]"
                        />
                        <button
                          type="button"
                          onClick={() => setOnlyAssignedToMe((v) => !v)}
                          className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                            onlyAssignedToMe
                              ? 'border-[#0057B8]/25 bg-[#EFF7FC] text-[#0057B8]'
                              : 'border-[#DCE7F2] bg-white text-slate-600 hover:text-[#041E4A]'
                          }`}
                        >
                          {t.staff.filters.assignedToMe}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          data-testid="staff-sort-select"
                          value={sort}
                          onChange={(e) =>
                            setSort(
                              e.target.value as
                                | 'newest'
                                | 'oldest'
                                | 'case_az'
                                | 'status'
                                | 'sla_urgent'
                            )
                          }
                          className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#0057B8]"
                        >
                          <option value="newest">{t.staff.filters.sortNewest}</option>
                          <option value="sla_urgent">{t.enhancements.queueFilters.sortUrgentSla}</option>
                          <option value="oldest">{t.staff.filters.sortOldest}</option>
                          <option value="case_az">{t.staff.filters.sortCaseAz}</option>
                          <option value="status">{t.staff.filters.sortStatus}</option>
                        </select>
                        <button
                          type="button"
                          data-testid="staff-export-csv-btn"
                          disabled={visibleCases.length === 0}
                          onClick={handleExportStaffCsv}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-[#041E4A] disabled:opacity-45 cursor-pointer"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t.enhancements.queueFilters.exportCsv}</span>
                        </button>
                      </div>
                    </div>

                    {selectedCaseIds.length > 0 && !isReadOnly && (
                      <div
                        data-testid="staff-bulk-bar"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0057B8]/25 bg-[#EFF7FC] px-4 py-3"
                      >
                        <span className="text-xs font-semibold text-[#0057B8]">
                          {t.enhancements.queueFilters.selectedCount(selectedCaseIds.length)}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={bulkBusy}
                            data-testid="staff-bulk-assign-btn"
                            onClick={() => runBulkAction('assign_self')}
                            className="rounded-lg bg-[#0057B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] disabled:opacity-50 cursor-pointer"
                          >
                            {t.enhancements.queueFilters.assignMe}
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            data-testid="staff-bulk-review-btn"
                            onClick={() => runBulkAction('start_review')}
                            className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                          >
                            {t.enhancements.queueFilters.startReview}
                          </button>
                          <button
                            type="button"
                            disabled={bulkBusy}
                            data-testid="staff-bulk-watch-btn"
                            onClick={() => runBulkAction('toggle_monitor')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t.enhancements.queueFilters.toggleWatch}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCaseIds([])}
                            className="rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:text-[#041E4A] cursor-pointer"
                          >
                            {t.enhancements.queueFilters.clearSelection}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                      <table className="w-full text-start text-xs">
                        <thead>
                          <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                            {!isReadOnly && (
                              <th className="ps-3.5 pe-2 py-3.5 w-8">
                                <input
                                  type="checkbox"
                                  aria-label={t.enhancements.queueFilters.selectAll}
                                  checked={allVisibleSelected}
                                  onChange={toggleSelectAllVisible}
                                  className="h-3.5 w-3.5 accent-[#0057B8] cursor-pointer"
                                />
                              </th>
                            )}
                            <th className="px-3.5 py-3.5 text-start whitespace-nowrap">{t.staff.casesTable.caseNum}</th>
                            <th className="px-3.5 py-3.5 text-start whitespace-nowrap">{t.staff.casesTable.client}</th>
                            <th className="px-3.5 py-3.5 text-start">{t.staff.casesTable.title}</th>
                            <th className="px-3.5 py-3.5 text-start whitespace-nowrap">{t.staff.casesTable.platform}</th>
                            <th className="px-3.5 py-3.5 text-start whitespace-nowrap">{t.staff.casesTable.owner}</th>
                            <th className="px-3.5 py-3.5 text-start whitespace-nowrap">{t.staff.casesTable.status}</th>
                            <th className="px-3.5 py-3.5 text-end whitespace-nowrap">{t.staff.casesTable.response}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFF5FA]">
                          {visibleCases.map((c) => {
                            const sla = computeCaseSla(c);
                            const isChecked = selectedCaseIds.includes(c.id);
                            return (
                              <tr
                                key={c.id}
                                onClick={() => {
                                  setUrlCheckDiagnostic('');
                                  setSelectedCaseId(c.id);
                                }}
                                className={`hover:bg-slate-50/80 cursor-pointer ${
                                  isChecked ? 'bg-[#EFF7FC]' : ''
                                }`}
                              >
                                {!isReadOnly && (
                                  <td
                                    className="ps-3.5 pe-2 py-3.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      aria-label={`${c.case_number}`}
                                      checked={isChecked}
                                      onChange={() => toggleSelectCase(c.id)}
                                      className="h-3.5 w-3.5 accent-[#0057B8] cursor-pointer"
                                    />
                                  </td>
                                )}
                                <td
                                  className="px-3.5 py-3.5 font-mono font-semibold text-[#0057B8] whitespace-nowrap"
                                  dir="ltr"
                                >
                                  {c.case_number}
                                </td>
                                <td className="px-3.5 py-3.5 text-slate-700 whitespace-nowrap">
                                  {c.customer_name}
                                </td>
                                <td
                                  className="px-3.5 py-3.5 font-semibold text-[#041E4A] max-w-[230px] truncate"
                                  dir="auto"
                                >
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
                                <td className="px-3.5 py-3.5 text-slate-600 whitespace-nowrap">
                                  {c.platform}
                                </td>
                                <td className="px-3.5 py-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap" dir="ltr">
                                  {c.assigned_to || t.common.unassigned}
                                </td>
                                <td
                                  className={`px-3.5 py-3.5 text-xs font-semibold whitespace-nowrap ${statusColor(c.status)}`}
                                >
                                  {translateStatus(c.status, lang)}
                                </td>
                                <td
                                  className={`px-3.5 py-3.5 text-end text-xs font-semibold tabular-nums whitespace-nowrap ${slaColor(sla.health)}`}
                                >
                                  {translateSlaLabel(sla, lang)}
                                </td>
                              </tr>
                            );
                          })}
                          {visibleCases.length === 0 && (
                            <tr>
                              <td
                                colSpan={isReadOnly ? 7 : 8}
                                className="px-5 py-8 text-center text-xs text-slate-500"
                              >
                                {t.common.noResults}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === 'inquiries' && (
                  <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white shadow-xs">
                    <table className="w-full text-start text-xs">
                      <thead>
                        <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                          <th className="px-5 py-3.5 text-start">{t.staff.inquiriesTable.sender}</th>
                          <th className="px-5 py-3.5 text-start">{t.staff.inquiriesTable.topic}</th>
                          <th className="px-5 py-3.5 text-start">{t.staff.inquiriesTable.message}</th>
                          <th className="px-5 py-3.5 text-start">{t.staff.inquiriesTable.status}</th>
                          <th className="px-5 py-3.5 text-end">{t.staff.inquiriesTable.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFF5FA]">
                        {data.inquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50/75">
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-[#041E4A]">{inq.name}</div>
                              <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                                {inq.email} · {inq.language.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 max-w-[200px]">
                              {inq.interest}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 max-w-sm">{inq.message}</td>
                            <td
                              className={`px-5 py-3.5 text-xs font-semibold ${statusColor(inq.status || 'new')}`}
                            >
                              {translateStatus(inq.status || 'new', lang)}
                            </td>
                            <td className="px-5 py-3.5 text-end whitespace-nowrap space-x-2">
                              {inq.status !== 'converted' ? (
                                <button
                                  type="button"
                                  onClick={() => handleInquiryAction(inq.id, 'convert_to_case')}
                                  className="rounded-lg bg-[#0057B8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                                >
                                  {t.staff.inquiriesTable.convertBtn}
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-700">
                                  {t.staff.inquiriesTable.caseOpened}
                                </span>
                              )}
                              {inq.status === 'new' && (
                                <button
                                  type="button"
                                  onClick={() => handleInquiryAction(inq.id, 'mark_reviewed')}
                                  className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  {t.staff.inquiriesTable.markReviewed}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {tab === 'team' && (
                  <div className="grid gap-6 lg:grid-cols-12">
                    <form
                      onSubmit={handleInviteStaff}
                      className="rounded-2xl border border-[#DCE7F2] bg-white p-6 space-y-4 lg:col-span-4 shadow-xs"
                    >
                      <h2 className="font-display text-base font-bold text-[#041E4A]">
                        {t.staff.teamTab.inviteTitle}
                      </h2>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        value={invEmail}
                        onChange={(e) => setInvEmail(e.target.value)}
                        placeholder={t.staff.teamTab.emailPlaceholder}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
                      />
                      <select
                        value={invRole}
                        onChange={(e) => setInvRole(e.target.value as 'admin' | 'analyst' | 'viewer')}
                        className="w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2.5 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                      >
                        <option value="analyst">{translateRole('analyst', lang)}</option>
                        <option value="admin">{translateRole('admin', lang)}</option>
                        <option value="viewer">{translateRole('viewer', lang)}</option>
                      </select>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#0057B8] py-2.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                      >
                        {t.staff.teamTab.sendInviteBtn}
                      </button>
                    </form>

                    <div className="overflow-x-auto rounded-2xl border border-[#DCE7F2] bg-white lg:col-span-8 shadow-xs">
                      <table className="w-full text-start text-xs">
                        <thead>
                          <tr className="border-b border-[#DCE7F2] bg-[#F7FAFC] text-xs font-semibold text-slate-500">
                            <th className="px-5 py-3.5 text-start">{t.staff.teamTab.member}</th>
                            <th className="px-5 py-3.5 text-start">{t.staff.teamTab.role}</th>
                            <th className="px-5 py-3.5 text-start">{t.staff.teamTab.status}</th>
                            <th className="px-5 py-3.5 text-end">{t.staff.teamTab.manage}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFF5FA]">
                          {data.staff.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/75">
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-[#041E4A]">{m.display_name}</div>
                                <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                                  {m.email}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-semibold text-[#0057B8]">
                                {translateRole(m.role, lang)}
                              </td>
                              <td className="px-5 py-3.5 text-slate-600">
                                {translateStatus(m.status, lang)}
                              </td>
                              <td className="px-5 py-3.5 text-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleRoleUpdate(m.id, { role: 'admin' })}
                                  className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  {t.staff.teamTab.makeAdmin}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRoleUpdate(m.id, { action: 'suspend' })}
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 cursor-pointer"
                                >
                                  {t.staff.teamTab.pauseAccess}
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
            )
          )}
        </main>
      </div>

      {/* Staff Case Triage & Submission Modal */}
      {selectedCase && (
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
                    {selectedCase.case_number}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-700" dir="ltr">
                    {selectedCase.customer_email}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`font-semibold ${statusColor(selectedCase.status)}`}>
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
              <button
                type="button"
                aria-label={t.common.close}
                onClick={() => setSelectedCaseId(null)}
                className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#041E4A] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Workflow transitions & Analyst Assignment */}
            <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-700">
                  {t.staff.caseModal.actionsTitle}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-slate-500" htmlFor="staff-assignee">
                    {t.staff.caseModal.assignedTo}
                  </label>
                  <select
                    id="staff-assignee"
                    value={selectedCase.assigned_to || ''}
                    onChange={(e) => runCaseAction('assign', undefined, { assignee: e.target.value })}
                    className="rounded-lg border border-[#DCE7F2] bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#0057B8]"
                  >
                    <option value="">{t.staff.caseModal.unassignedPool}</option>
                    {data?.staff
                      .filter((s) => s.status === 'active')
                      .map((s) => (
                        <option key={s.id} value={s.email}>
                          {s.display_name} ({s.email})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    data-testid="staff-toggle-monitor-btn"
                    onClick={() => runCaseAction('toggle_monitor')}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-45 cursor-pointer ${
                      selectedCase.monitoring_enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-[#DCE7F2] bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>
                      {selectedCase.monitoring_enabled
                        ? t.enhancements.watchlist.pauseBtn
                        : t.enhancements.watchlist.enableBtn}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-testid="staff-certificate-pdf-btn"
                    onClick={() => handleDownloadCaseCertificate(selectedCase)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{t.enhancements.certificate.downloadBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{t.staff.caseModal.draftNoticeBtn}</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={t.staff.caseModal.actionNotePlaceholder}
                className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
              />
              <div className="flex flex-wrap gap-2">
                {getNextCaseActions(selectedCase.status).map((act) => (
                  <button
                    key={act.action}
                    type="button"
                    onClick={() => runCaseAction(act.action, actionNote)}
                    className="rounded-lg bg-[#0057B8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                  >
                    {translateActionLabel(act.action, act.label, lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column Workbench: Platform Submissions + Verification & Evidence */}
            <div className="grid gap-5 lg:grid-cols-2">
              <form
                onSubmit={handleAddSubmission}
                className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3"
              >
                <div className="text-xs font-semibold text-[#0057B8]">
                  {t.staff.caseModal.logSubmissionTitle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={subPlatform}
                    onChange={(e) => setSubPlatform(e.target.value)}
                    placeholder={selectedCase.platform}
                    className="rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                  />
                  <select
                    value={subChannel}
                    onChange={(e) => setSubChannel(e.target.value)}
                    className="rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                  >
                    <option value="platform_portal">
                      {t.staff.caseModal.channels.platform_portal}
                    </option>
                    <option value="web_form">{t.staff.caseModal.channels.web_form}</option>
                    <option value="email">{t.staff.caseModal.channels.email}</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={subRef}
                  onChange={(e) => setSubRef(e.target.value)}
                  placeholder={t.staff.caseModal.extRefPlaceholder}
                  className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <input
                  type="text"
                  value={subSummary}
                  onChange={(e) => setSubSummary(e.target.value)}
                  placeholder={t.staff.caseModal.subSummaryPlaceholder}
                  className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#041E4A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  {t.staff.caseModal.saveSubmissionBtn}
                </button>
              </form>

              <form
                onSubmit={handleAddVerification}
                className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-emerald-700">
                    {t.staff.caseModal.verifyTitle}
                  </div>
                  <button
                    type="button"
                    disabled={urlCheckBusy}
                    onClick={handleRunLiveUrlCheck}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-[#EFF7FC] px-3 py-1 text-xs font-semibold text-[#0057B8] hover:bg-[#DCEEFB] disabled:opacity-60 cursor-pointer"
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    <span>
                      {urlCheckBusy ? t.staff.caseModal.checkingUrl : t.staff.caseModal.runUrlCheck}
                    </span>
                  </button>
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
                  className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                >
                  <option value="confirmed_removed">{translateStatus('confirmed_removed', lang)}</option>
                  <option value="still_accessible">{translateStatus('still_accessible', lang)}</option>
                  <option value="redirected">{translateStatus('redirected', lang)}</option>
                  <option value="login_required">{translateStatus('login_required', lang)}</option>
                </select>
                <input
                  type="url"
                  dir="ltr"
                  value={verUrl}
                  onChange={(e) => setVerUrl(e.target.value)}
                  placeholder={selectedCase.source_url}
                  className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] text-start"
                />
                <input
                  type="text"
                  value={verNotes}
                  onChange={(e) => setVerNotes(e.target.value)}
                  placeholder={t.staff.caseModal.verNotesPlaceholder}
                  className="w-full rounded-xl border border-[#DCE7F2] bg-white px-3 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.staff.caseModal.saveVerifyBtn}</span>
                </button>
              </form>
            </div>

            {/* Evidence Vault preview */}
            <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">
                {t.staff.caseModal.evidenceTitle(selectedCase.evidence?.length || 0)}
              </div>
              {(selectedCase.evidence || []).map((ev) => (
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
                            selectedCase.id,
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
              {(!selectedCase.evidence || selectedCase.evidence.length === 0) && (
                <p className="text-xs text-slate-500">{t.staff.caseModal.noEvidence}</p>
              )}
            </div>

            {/* Messages & Internal Notes */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  {t.staff.caseModal.replyClientTitle}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">
                    {t.enhancements.quickReplies.heading}
                  </span>
                  {t.enhancements.quickReplies.items.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`staff-quick-reply-${preset.id}`}
                      onClick={() => setReplyText(preset.text)}
                      className="rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-[#0057B8] hover:text-[#0057B8] cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.staff.caseModal.replyClientPlaceholder}
                    className="flex-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => runCaseAction('reply_customer', replyText)}
                    className="rounded-lg bg-[#0057B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
                  >
                    {t.common.send}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-amber-700">
                  {t.staff.caseModal.teamNoteTitle}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder={t.staff.caseModal.teamNotePlaceholder}
                    className="flex-1 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs text-[#041E4A] outline-none focus:border-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => runCaseAction('internal_note', internalNote)}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                  >
                    {t.staff.caseModal.saveNoteBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCase && noticeModalOpen && (
        <TakedownNoticeModal
          lang={lang}
          caseItem={selectedCase}
          onClose={() => setNoticeModalOpen(false)}
          onRecordSubmission={async ({
            platform,
            submission_channel,
            external_reference,
            response_summary,
          }) => {
            const res = await authFetch(`/api/staff/cases/${selectedCase.id}/submissions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                platform,
                submission_channel,
                status: 'submitted',
                external_reference,
                response_summary,
              }),
            });
            if (res.ok) {
              setBanner({
                kind: 'success',
                text: t.staff.caseModal.noticeRecorded(selectedCase.case_number),
              });
              await loadData();
            }
          }}
        />
      )}
      <QuickJumpModal
        open={quickJumpOpen}
        onClose={() => setQuickJumpOpen(false)}
        lang={lang}
        sections={[
          { id: 'cases', label: t.staff.nav.cases, onSelect: () => setTab('cases') },
          { id: 'inquiries', label: t.staff.nav.inquiries, onSelect: () => setTab('inquiries') },
          { id: 'team', label: t.staff.nav.team, onSelect: () => setTab('team') },
          {
            id: 'central-admin',
            label: t.staff.openCentralAdmin,
            onSelect: () => onNavigate('/platform-ops'),
          },
        ]}
        cases={(data?.cases || []).map((c) => ({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          platform: c.platform,
          status: c.status,
          onSelect: () => {
            setTab('cases');
            setUrlCheckDiagnostic('');
            setSelectedCaseId(c.id);
          },
        }))}
      />
    </div>
  );
}
