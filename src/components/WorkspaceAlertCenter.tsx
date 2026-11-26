import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PORTAL_TRANSLATIONS } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import type {
  WorkspaceAlertSummary,
  WorkspaceCaseAlert,
} from '../lib/caseLogic';

interface WorkspaceAlertBellProps {
  alertSummary: WorkspaceAlertSummary;
  liveAlerts: WorkspaceCaseAlert[];
  unreadNotificationsCount: number;
  onOpenCase: (caseId: string, section?: 'timeline' | 'evidence' | 'messages') => void;
  onOpenNotificationsTab: () => void;
  lang?: LangCode;
}

export function WorkspaceAlertBell({
  alertSummary,
  liveAlerts,
  unreadNotificationsCount,
  onOpenCase,
  onOpenNotificationsTab,
  lang = 'en',
}: WorkspaceAlertBellProps) {
  const [open, setOpen] = useState(false);

  const urgentCount = alertSummary.urgentCount;
  const resolvedToastCount = liveAlerts.filter((a) => a.kind === 'resolved').length;
  const hasUrgent = urgentCount > 0;
  const hasLiveResolved = resolvedToastCount > 0;
  const t = PORTAL_TRANSLATIONS[lang];

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="workspace-status-alert-badge"
        aria-expanded={open}
        aria-label={t.workspace.alerts.ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
          hasUrgent
            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/75'
            : hasLiveResolved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/75'
              : 'border-[#DCE7F2] bg-white text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA]'
        }`}
      >
        {hasUrgent ? (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        ) : hasLiveResolved ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        ) : (
          <Bell className="h-3.5 w-3.5 text-[#0057B8] shrink-0" />
        )}

        <span className="hidden sm:inline">
          {hasUrgent
            ? t.workspace.alerts.urgentInput
            : hasLiveResolved
              ? t.workspace.alerts.resolved
              : t.workspace.alerts.statusAlerts}
        </span>

        {(urgentCount > 0 || resolvedToastCount > 0 || unreadNotificationsCount > 0) && (
          <span
            data-testid="workspace-status-alert-count"
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
              hasUrgent
                ? 'bg-amber-600 text-white'
                : hasLiveResolved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0057B8] text-white'
            }`}
          >
            {urgentCount > 0
              ? urgentCount
              : resolvedToastCount > 0
                ? resolvedToastCount
                : unreadNotificationsCount}
          </span>
        )}
      </button>

      {open && (
        <div
          data-testid="workspace-alert-popover"
          className="fixed inset-x-4 top-16 sm:inset-x-auto sm:absolute sm:end-0 sm:top-full sm:mt-2 z-40 sm:w-96 rounded-2xl border border-[#DCE7F2] bg-white shadow-xl shadow-[#041E4A]/12 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#EFF5FA] bg-[#F7FAFC] px-4 py-3.5">
            <div>
              <div className="text-xs font-semibold text-[#00758A]">
                {t.workspace.alerts.popoverTitle}
              </div>
              <div className="mt-0.5 text-xs font-medium text-[#041E4A]">
                {t.workspace.alerts.popoverSummary(
                  alertSummary.urgentCount,
                  alertSummary.resolvedCount
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#DCE7F2] bg-white p-1.5 text-slate-500 hover:text-[#041E4A] cursor-pointer"
              aria-label={t.common.close}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#EFF5FA]">
            {alertSummary.urgentInputCases.map((entry) => (
              <button
                key={entry.caseItem.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenCase(
                    entry.caseItem.id,
                    entry.reason === 'needs_information' ? 'messages' : 'timeline'
                  );
                }}
                className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-start hover:bg-[#F7FAFC] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                      {t.workspace.alerts.urgentInput}
                    </span>
                    <span className="font-mono font-bold text-[#0057B8]" dir="ltr">
                      {entry.caseItem.case_number}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-[#041E4A]">
                    {entry.caseItem.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-amber-700">
                    {entry.reason === 'needs_information'
                      ? t.statuses.needs_information
                      : t.sla.overdue}{' '}
                    · {entry.caseItem.platform}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 rtl:rotate-180" />
              </button>
            ))}

            {alertSummary.resolvedCases.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenCase(item.id, 'timeline');
                }}
                className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-start hover:bg-[#F7FAFC] cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {t.workspace.alerts.resolved}
                    </span>
                    <span className="font-mono font-bold text-[#0057B8]" dir="ltr">
                      {item.case_number}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-[#041E4A]">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {t.workspace.alerts.resolvedNote} · {item.platform}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 rtl:rotate-180" />
              </button>
            ))}

            {alertSummary.urgentInputCases.length === 0 && alertSummary.resolvedCases.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                {t.workspace.alerts.emptyAlerts}
              </div>
            )}
          </div>

          <div className="border-t border-[#EFF5FA] bg-[#F7FAFC] px-4 py-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {t.workspace.alerts.unreadCount(unreadNotificationsCount)}
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenNotificationsTab();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
            >
              <span>{t.workspace.alerts.viewAllAlerts}</span>
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkspaceToastStackProps {
  alerts: WorkspaceCaseAlert[];
  onDismiss: (alertId: string) => void;
  onInspectCase: (alert: WorkspaceCaseAlert) => void;
  lang?: LangCode;
}

export function WorkspaceToastStack({
  alerts,
  onDismiss,
  onInspectCase,
  lang = 'en',
}: WorkspaceToastStackProps) {
  if (alerts.length === 0) return null;
  const t = PORTAL_TRANSLATIONS[lang];

  return (
    <div
      aria-live="polite"
      aria-label={t.workspace.alerts.ariaLabel}
      data-testid="workspace-toast-stack"
      className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:end-5 sm:bottom-5 z-40 flex flex-col gap-2.5 sm:w-96 no-print"
    >
      {alerts.map((alert) => {
        const isResolved = alert.kind === 'resolved';
        return (
          <div
            key={alert.id}
            role="status"
            data-testid={`workspace-toast-${alert.caseNumber}`}
            data-alert-kind={alert.kind}
            className={`rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/10 ${
              isResolved ? 'border-emerald-300' : 'border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                {isResolved ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-semibold ${
                        isResolved
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      {isResolved ? t.workspace.alerts.resolved : t.workspace.alerts.urgentInput}
                    </span>
                    <span className="text-slate-500">{alert.platform}</span>
                  </div>
                  <div className="mt-1.5 text-xs font-bold text-slate-950">
                    {alert.headline}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    {alert.detail}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onInspectCase(alert)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer ${
                        isResolved ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <span>
                        {isResolved
                          ? t.workspace.alerts.viewResolution
                          : t.workspace.alerts.replyNow}
                      </span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(alert.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      {t.workspace.alerts.dismiss}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                aria-label={t.workspace.alerts.dismiss}
                className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-slate-900 cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
