import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  Clock,
  History,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import {
  buildCaseActivityLogEntries,
  buildWorkspaceCaseActivityLog,
  filterCaseActivityLogEntries,
  formatActivityActionLabel,
  formatTimelineTimestampUtc,
  resolveCaseActivityVisualStatus,
  summarizeCaseActivityLog,
  type CaseActivityLogEntry,
  type CaseActivityLogKind,
  type CaseActivityVisualStatus,
  type ProtectionCase,
} from '../lib/caseLogic';

interface CaseActivityLogProps {
  lang: LangCode;
  mode: 'workspace' | 'case';
  cases?: ProtectionCase[];
  caseItem?: ProtectionCase;
  onSelectCase?: (caseId: string) => void;
}

type ActivityFilterKind = 'all' | CaseActivityLogKind;

function kindTextTone(entry: CaseActivityLogEntry): string {
  if (entry.kind === 'status_update') {
    switch (entry.statusTag) {
      case 'resolved':
      case 'closed':
      case 'action_taken':
        return 'text-emerald-700';
      case 'needs_information':
        return 'text-amber-700';
      case 'rejected':
      case 'disputed':
        return 'text-rose-700';
      default:
        return 'text-[#0057B8]';
    }
  }
  switch (entry.eventType) {
    case 'verification_check':
    case 'watchlist_sweep':
      return entry.statusTag === 'confirmed_removed' ? 'text-emerald-700' : 'text-[#00758A]';
    case 'platform_response':
      return 'text-[#00758A]';
    default:
      return 'text-[#041E4A]';
  }
}

function visualStatusChipMeta(status: CaseActivityVisualStatus) {
  switch (status) {
    case 'resolved':
      return {
        Icon: CheckCircle2,
        chipClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        iconClass: 'text-emerald-600',
      };
    case 'pending':
      return {
        Icon: Clock,
        chipClass: 'border-amber-200 bg-amber-50 text-amber-800',
        iconClass: 'text-amber-600',
      };
    case 'attention':
      return {
        Icon: AlertCircle,
        chipClass: 'border-rose-200 bg-rose-50 text-rose-800',
        iconClass: 'text-rose-600',
      };
    default:
      return {
        Icon: RefreshCw,
        chipClass: 'border-[#BFDBFE] bg-[#EFF7FC] text-[#0057B8]',
        iconClass: 'text-[#0057B8]',
      };
  }
}

export function CaseActivityLog({
  lang,
  mode,
  cases = [],
  caseItem,
  onSelectCase,
}: CaseActivityLogProps) {
  const t = PORTAL_TRANSLATIONS[lang];
  const copy = t.enhancements.caseActivityLog;

  const [kindFilter, setKindFilter] = useState<ActivityFilterKind>('all');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedWorkspace, setExpandedWorkspace] = useState(false);

  const rawEntries = useMemo(() => {
    if (mode === 'case' && caseItem) {
      return buildCaseActivityLogEntries(caseItem);
    }
    return buildWorkspaceCaseActivityLog(cases, { order: 'desc' });
  }, [mode, caseItem, cases]);

  const caseScopedEntries = useMemo(() => {
    if (mode === 'case') return rawEntries;
    if (selectedCaseFilter === 'all') return rawEntries;
    return rawEntries.filter((entry) => entry.caseId === selectedCaseFilter);
  }, [mode, rawEntries, selectedCaseFilter]);

  const summary = useMemo(
    () => summarizeCaseActivityLog(caseScopedEntries),
    [caseScopedEntries]
  );

  const visibleEntries = useMemo(
    () =>
      filterCaseActivityLogEntries(caseScopedEntries, {
        kind: kindFilter,
        query: searchQuery,
        order: sortOrder,
      }),
    [caseScopedEntries, kindFilter, searchQuery, sortOrder]
  );

  const workspaceLimit = 6;
  const displayedEntries =
    mode === 'workspace' && !expandedWorkspace
      ? visibleEntries.slice(0, workspaceLimit)
      : visibleEntries;

  const hasActiveFilters =
    kindFilter !== 'all' ||
    Boolean(searchQuery.trim()) ||
    (mode === 'workspace' && selectedCaseFilter !== 'all');

  const resetFilters = () => {
    setKindFilter('all');
    setSelectedCaseFilter('all');
    setSearchQuery('');
  };

  const resolveEventLabel = (entry: CaseActivityLogEntry): string => {
    return copy.eventLabels[entry.eventType] || formatActivityActionLabel(entry.eventType);
  };

  const testId =
    mode === 'case' ? 'detail-case-activity-log' : 'workspace-case-activity-log';

  return (
    <section
      data-testid={testId}
      aria-label={copy.title}
      className={
        mode === 'workspace'
          ? 'min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-5 shadow-xs flex flex-col'
          : 'min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-4 sm:p-5'
      }
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFF5FA] pb-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#0057B8] shrink-0" />
            <h2 className="font-display text-sm font-bold text-[#041E4A]">{copy.title}</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{copy.subtitle}</p>
        </div>
        <div
          data-testid={`${testId}-summary`}
          className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap shrink-0"
        >
          {copy.summaryCounts(summary.total, summary.statusUpdates, summary.adminActions)}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
        <div
          role="group"
          aria-label={copy.title}
          className="inline-flex items-center gap-1 rounded-lg bg-[#EFF5FA] p-1"
        >
          {(
            [
              { id: 'all', label: copy.filters.all },
              { id: 'status_update', label: copy.filters.status },
              { id: 'admin_action', label: copy.filters.admin },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              data-testid={`${testId}-filter-${option.id}`}
              aria-pressed={kindFilter === option.id}
              onClick={() => setKindFilter(option.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                kindFilter === option.id
                  ? 'bg-white text-[#041E4A] shadow-xs'
                  : 'text-slate-600 hover:text-[#041E4A]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'workspace' && cases.length > 1 && (
            <select
              aria-label={copy.allCasesOption}
              data-testid="workspace-activity-case-select"
              value={selectedCaseFilter}
              onChange={(e) => {
                setSelectedCaseFilter(e.target.value);
                setExpandedWorkspace(false);
              }}
              className="max-w-[190px] rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 py-1.5 text-xs font-medium text-[#041E4A] outline-none focus:border-[#0057B8]"
            >
              <option value="all">{copy.allCasesOption}</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} · {c.platform}
                </option>
              ))}
            </select>
          )}

          {mode === 'case' && (
            <div className="relative min-w-[205px] flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                data-testid="detail-activity-search"
                aria-label={copy.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] ps-8 pe-7 py-1.5 text-xs text-[#041E4A] placeholder-slate-400 outline-none focus:border-[#0057B8] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={t.common.clear}
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#041E4A] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            data-testid={`${testId}-sort-btn`}
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-[#041E4A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-[#0057B8]" />
            <span>{sortOrder === 'desc' ? copy.sortNewest : copy.sortOldest}</span>
          </button>
        </div>
      </div>

      {/* Activity Entries Ledger */}
      {displayedEntries.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#DCE7F2] bg-[#F7FAFC] px-4 py-6 text-center space-y-2">
          <p className="text-xs text-slate-500">{copy.empty}</p>
          {hasActiveFilters && (
            <button
              type="button"
              data-testid={`${testId}-reset-btn`}
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
            >
              {t.common.resetFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 divide-y divide-[#EFF5FA]">
          {displayedEntries.map((entry) => {
            const label = resolveEventLabel(entry);
            const actorLabel = copy.actors[entry.actorRole];
            const kindLabel = copy.kinds[entry.kind];
            const statusText = entry.statusTag
              ? translateStatus(entry.statusTag, lang)
              : null;
            const visualStatus = resolveCaseActivityVisualStatus(entry);
            const chipMeta = visualStatusChipMeta(visualStatus);
            const ChipIcon = chipMeta.Icon;

            return (
              <div
                key={entry.id}
                data-testid={`${testId}-row`}
                data-entry-kind={entry.kind}
                data-event-type={entry.eventType}
                data-visual-status={visualStatus}
                className="py-3 first:pt-2 last:pb-1 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {mode === 'workspace' && onSelectCase && (
                      <>
                        <button
                          type="button"
                          dir="ltr"
                          onClick={() => onSelectCase(entry.caseId)}
                          className="font-mono text-xs font-semibold text-[#0057B8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {entry.caseNumber}
                        </button>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                      </>
                    )}
                    <span className={`text-xs font-semibold ${kindTextTone(entry)}`}>
                      {label}
                    </span>
                    <span
                      data-testid={`${testId}-status-chip`}
                      data-status-tone={visualStatus}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0 ${chipMeta.chipClass}`}
                    >
                      <ChipIcon className={`h-3 w-3 shrink-0 ${chipMeta.iconClass}`} />
                      <span>{copy.visualStatuses[visualStatus]}</span>
                    </span>
                  </div>

                  <time
                    dateTime={entry.timestamp}
                    dir="ltr"
                    className="font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap shrink-0"
                  >
                    {formatTimelineTimestampUtc(entry.timestamp)}
                  </time>
                </div>

                <p className="text-xs leading-relaxed text-slate-700" dir="auto">
                  {entry.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="font-medium text-slate-500">{kindLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-600">{actorLabel}</span>
                    {statusText && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#041E4A]">{statusText}</span>
                      </>
                    )}
                    {entry.referenceMeta && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono break-all text-slate-500" dir="ltr">
                          {entry.referenceMeta}
                        </span>
                      </>
                    )}
                  </div>

                  {mode === 'workspace' && onSelectCase && (
                    <button
                      type="button"
                      onClick={() => onSelectCase(entry.caseId)}
                      className="text-[11px] font-semibold text-[#0057B8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copy.openCaseLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'workspace' && visibleEntries.length > workspaceLimit && (
        <div className="mt-3 border-t border-[#EFF5FA] pt-3 flex justify-end">
          <button
            type="button"
            data-testid="workspace-activity-expand-btn"
            onClick={() => setExpandedWorkspace((prev) => !prev)}
            className="text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
          >
            {expandedWorkspace
              ? t.common.close
              : `${t.common.viewAll} (${visibleEntries.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
