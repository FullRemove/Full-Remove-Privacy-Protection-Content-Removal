import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Check,
  Clock,
  FileCheck2,
  Flame,
  MessageSquare,
  Radio,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  PORTAL_TRANSLATIONS,
  translateSlaLabel,
  translateStatus,
  translateTimelineLabel,
} from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import {
  buildCaseChronologicalLog,
  computeCasePendingPriority,
  computeCaseProgression,
  computeCaseSla,
  formatTimelineTimestampUtc,
  getPendingThresholdPreset,
  PENDING_THRESHOLD_PRESETS,
  type CasePendingPriorityResult,
  type CasePendingThresholdConfig,
  type CaseProgressionPhaseId,
  type CaseTimelineEventCategory,
  type PendingThresholdPresetId,
  type ProtectionCase,
} from '../lib/caseLogic';
import { RemovalConfirmedBadge } from './RemovalSuccessAnimation';

export type CustomerWsStatus = 'connecting' | 'live' | 'reconnecting';

interface CasePhaseTrackerProps {
  mode: 'overview' | 'detail';
  cases?: ProtectionCase[];
  caseItem?: ProtectionCase;
  wsStatus: CustomerWsStatus;
  lastLiveUpdateAt?: string | null;
  highlightedCaseId?: string | null;
  celebratedRemovedIds?: Record<string, boolean>;
  onSelectCase?: (caseId: string) => void;
  thresholdPresetId?: PendingThresholdPresetId;
  onChangeThresholdPresetId?: (id: PendingThresholdPresetId) => void;
  lang?: LangCode;
}

const DEFAULT_VISIBLE_EVENTS = 8;

function wsLabel(
  status: CustomerWsStatus,
  lang: LangCode
): { text: string; dotClass: string; textClass: string } {
  const t = PORTAL_TRANSLATIONS[lang].workspace.tracker;
  if (status === 'live') {
    return {
      text: t.liveActive,
      dotClass: 'bg-emerald-600',
      textClass: 'text-emerald-700',
    };
  }
  if (status === 'reconnecting') {
    return {
      text: t.reconnecting,
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-700',
    };
  }
  return {
    text: t.connecting,
    dotClass: 'bg-[#0057B8]',
    textClass: 'text-[#0057B8]',
  };
}

function eventCategoryVisual(
  category: CaseTimelineEventCategory,
  label: string
): { colorClass: string; Icon: typeof Activity } {
  switch (category) {
    case 'evidence':
      return { colorClass: 'text-[#00758A]', Icon: FileCheck2 };
    case 'platform_response':
      return { colorClass: 'text-emerald-700', Icon: ShieldCheck };
    case 'submission':
      return { colorClass: 'text-[#0057B8]', Icon: Send };
    case 'verification':
      return { colorClass: 'text-emerald-700', Icon: Check };
    case 'message':
      return { colorClass: 'text-[#041E4A]', Icon: MessageSquare };
    case 'submitted':
      return { colorClass: 'text-slate-600', Icon: Clock };
    default: {
      const lower = label.toLowerCase();
      if (lower.includes('information') || lower.includes('rejected') || lower.includes('dispute')) {
        return { colorClass: 'text-amber-700', Icon: AlertTriangle };
      }
      if (lower.includes('resolved') || lower.includes('closed')) {
        return { colorClass: 'text-emerald-700', Icon: Check };
      }
      return { colorClass: 'text-slate-700', Icon: Activity };
    }
  }
}

function PendingPriorityBadge({
  caseNumber,
  priority,
  thresholds,
  lang,
  testIdSuffix,
}: {
  caseNumber: string;
  priority: CasePendingPriorityResult;
  thresholds: CasePendingThresholdConfig;
  lang: LangCode;
  testIdSuffix?: string;
}) {
  if (!priority.badgeLabel || priority.tier === 'normal') return null;

  const t = PORTAL_TRANSLATIONS[lang];
  const isUrgent = priority.tier === 'urgent';
  const Icon = isUrgent ? Flame : AlertTriangle;
  const thresholdHours = isUrgent ? thresholds.urgentHours : thresholds.highPriorityHours;
  const label = t.priorityBadges[priority.tier] || priority.badgeLabel;

  return (
    <span
      data-testid={`case-priority-badge-${caseNumber}${testIdSuffix ? `-${testIdSuffix}` : ''}`}
      data-priority-tier={priority.tier}
      title={`${label}: ${t.workspace.tracker.pendingOver(priority.pendingDurationLabel, thresholdHours)}`}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold shrink-0 ${
        isUrgent
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function CasePhaseTracker({
  mode,
  cases = [],
  caseItem,
  wsStatus,
  lastLiveUpdateAt,
  highlightedCaseId,
  celebratedRemovedIds,
  onSelectCase,
  thresholdPresetId,
  onChangeThresholdPresetId,
  lang = 'en',
}: CasePhaseTrackerProps) {
  const [logOrder, setLogOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedCaseIds, setExpandedCaseIds] = useState<Record<string, boolean>>({});
  const [internalPresetId, setInternalPresetId] = useState<PendingThresholdPresetId>('standard');
  const activePresetId = thresholdPresetId ?? internalPresetId;
  const activePreset = getPendingThresholdPreset(activePresetId);
  const activeThresholds: CasePendingThresholdConfig = {
    highPriorityHours: activePreset.highPriorityHours,
    urgentHours: activePreset.urgentHours,
  };
  const t = PORTAL_TRANSLATIONS[lang];
  const wsMeta = wsLabel(wsStatus, lang);

  const handlePresetChange = (nextId: PendingThresholdPresetId) => {
    setInternalPresetId(nextId);
    onChangeThresholdPresetId?.(nextId);
  };

  const toggleExpandCase = (caseId: string) => {
    setExpandedCaseIds((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  if (mode === 'detail' && caseItem) {
    const prog = computeCaseProgression(caseItem);
    const priority = computeCasePendingPriority(caseItem, activeThresholds);
    const isHighlighted = highlightedCaseId === caseItem.id;
    const isRemovedCelebrated = Boolean(celebratedRemovedIds?.[caseItem.id]);
    const currentPhaseCopy = t.phases[prog.currentPhaseId as CaseProgressionPhaseId];
    const currentPhaseTitle =
      prog.exceptionFlag === 'needs_information'
        ? t.statuses.needs_information
        : prog.exceptionFlag === 'rejected'
          ? t.statuses.rejected
          : currentPhaseCopy?.label || prog.currentPhaseLabel;

    return (
      <section
        aria-label={t.workspace.tracker.overviewTitle}
        data-testid="case-phase-tracker-detail"
        className={`rounded-xl border p-5 space-y-4 transition-colors ${
          isRemovedCelebrated
            ? 'border-emerald-300 bg-emerald-50/35 animate-[frCaseRemovedGlow_1.8s_ease-out]'
            : isHighlighted
              ? 'border-[#0057B8]/40 bg-[#EFF7FC]/75'
              : 'border-[#DCE7F2] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFF5FA] pb-3.5">
          <div>
            <div className="text-xs font-medium text-slate-500">
              {t.workspace.tracker.detailEyebrow}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <span className="font-display text-base font-bold text-[#041E4A]">
                {currentPhaseTitle}
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-[#0057B8]">
                ({prog.progressPercent}%)
              </span>
              {isRemovedCelebrated && (
                <RemovalConfirmedBadge
                  dataTestId={`detail-removed-celebration-${caseItem.case_number}`}
                  label={t.workspace.alerts.removedBadge}
                />
              )}
              <PendingPriorityBadge
                caseNumber={caseItem.case_number}
                priority={priority}
                thresholds={activeThresholds}
                lang={lang}
                testIdSuffix="detail"
              />
              {priority.thresholdExceededHours !== null && (
                <span className="text-xs tabular-nums text-slate-500">
                  {t.workspace.tracker.pendingOver(
                    priority.pendingDurationLabel,
                    priority.thresholdExceededHours
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`h-2 w-2 rounded-full ${wsMeta.dotClass}`} />
            <span className={wsMeta.textClass}>{wsMeta.text}</span>
          </div>
        </div>

        {/* 4-Phase Stepper Rail */}
        <ol className="grid gap-3 sm:grid-cols-4">
          {prog.phases.map((step) => {
            const isCompleted = step.state === 'completed';
            const isCurrent = step.state === 'current';
            const isAttention = step.state === 'attention';
            const phaseText = t.phases[step.id];

            return (
              <li
                key={step.id}
                data-phase-id={step.id}
                data-phase-state={step.state}
                className={`rounded-xl border p-3.5 transition-colors ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/55'
                    : isAttention
                      ? 'border-amber-200 bg-amber-50/75'
                      : isCurrent
                        ? 'border-[#0057B8]/30 bg-[#EFF7FC]'
                        : 'border-[#DCE7F2] bg-[#F7FAFC]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                  <span
                    className={
                      isCompleted
                        ? 'text-emerald-700 font-bold'
                        : isAttention
                          ? 'text-amber-700 font-bold'
                          : isCurrent
                            ? 'text-[#0057B8] font-bold'
                            : 'text-slate-400'
                    }
                  >
                    {step.stepNumber}
                  </span>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                  ) : isAttention ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                  ) : isCurrent ? (
                    <Radio className="h-3.5 w-3.5 text-[#0057B8]" />
                  ) : null}
                </div>
                <div
                  className={`mt-2 text-xs font-semibold ${
                    isCompleted || isCurrent || isAttention ? 'text-[#041E4A]' : 'text-slate-500'
                  }`}
                >
                  {phaseText?.label || step.label}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  {phaseText?.desc || step.description}
                </p>
              </li>
            );
          })}
        </ol>

        {prog.exceptionNote && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
              prog.exceptionFlag === 'rejected'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{prog.exceptionNote}</span>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-label={t.workspace.tracker.overviewTitle}
      data-testid="case-phase-tracker-overview"
      className="min-w-0 rounded-2xl border border-[#DCE7F2] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFF5FA] pb-4">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-[#041E4A]">
            {t.workspace.tracker.overviewTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t.workspace.tracker.overviewSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {cases.length > 0 && (
            <>
              <select
                aria-label={t.thresholdPresets[activePresetId]}
                data-testid="pending-threshold-select"
                value={activePresetId}
                onChange={(e) => handlePresetChange(e.target.value as PendingThresholdPresetId)}
                className="rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white cursor-pointer"
              >
                {PENDING_THRESHOLD_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {t.thresholdPresets[preset.id] || preset.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setLogOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA] transition cursor-pointer"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-[#0057B8]" />
                <span>
                  {logOrder === 'asc'
                    ? t.workspace.tracker.oldestFirst
                    : t.workspace.tracker.newestFirst}
                </span>
              </button>
            </>
          )}
          {lastLiveUpdateAt && (
            <span className="font-mono text-[11px] text-slate-500 tabular-nums" dir="ltr">
              {t.workspace.tracker.syncedAt(lastLiveUpdateAt.slice(11, 19))}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className={`h-2 w-2 rounded-full ${wsMeta.dotClass}`} />
            <span className={wsMeta.textClass}>{wsMeta.text}</span>
          </span>
        </div>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">
          {t.workspace.tracker.emptyText}
        </p>
      ) : (
        <div className="space-y-4 min-w-0">
          {cases.map((c) => {
            const prog = computeCaseProgression(c);
            const sla = computeCaseSla(c);
            const priority = computeCasePendingPriority(c, activeThresholds);
            const highlighted = highlightedCaseId === c.id;
            const isRemovedCelebrated = Boolean(celebratedRemovedIds?.[c.id]);
            const timeline = buildCaseChronologicalLog(c, logOrder);
            const isExpanded = Boolean(expandedCaseIds[c.id]);
            const visibleEvents = isExpanded ? timeline : timeline.slice(0, DEFAULT_VISIBLE_EVENTS);
            const currentPhaseText = t.phases[prog.currentPhaseId as CaseProgressionPhaseId];
            const phaseLabel =
              prog.exceptionFlag === 'needs_information'
                ? t.statuses.needs_information
                : prog.exceptionFlag === 'rejected'
                  ? t.statuses.rejected
                  : currentPhaseText?.label || prog.currentPhaseLabel;

            return (
              <div
                key={c.id}
                data-testid={`tracker-case-${c.case_number}`}
                className={`min-w-0 overflow-hidden rounded-xl border transition-colors ${
                  isRemovedCelebrated
                    ? 'border-emerald-300 bg-emerald-50/30 animate-[frCaseRemovedGlow_1.8s_ease-out]'
                    : highlighted
                      ? 'border-[#0057B8] bg-[#EFF7FC]/75'
                      : 'border-[#DCE7F2] bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCase?.(c.id)}
                  className="block w-full min-w-0 p-4 sm:p-5 text-start transition hover:bg-[#F7FAFC] cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#0057B8]" dir="ltr">
                          {c.case_number}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-slate-700">{c.platform}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-medium">
                          {translateStatus(c.status, lang)}
                        </span>
                        {isRemovedCelebrated && (
                          <RemovalConfirmedBadge
                            dataTestId={`case-removed-celebration-${c.case_number}`}
                            label={t.workspace.alerts.removedBadge}
                          />
                        )}
                        <PendingPriorityBadge
                          caseNumber={c.case_number}
                          priority={priority}
                          thresholds={activeThresholds}
                          lang={lang}
                        />
                      </div>
                      <div
                        className="mt-1.5 text-sm font-semibold text-[#041E4A] break-words sm:truncate"
                        dir="auto"
                      >
                        {c.title}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-start sm:text-end">
                        <div
                          className={`text-xs font-bold ${
                            prog.exceptionFlag === 'needs_information'
                              ? 'text-amber-700'
                              : prog.exceptionFlag === 'rejected'
                                ? 'text-rose-700'
                                : prog.currentPhaseId === 'resolved'
                                  ? 'text-emerald-700'
                                  : 'text-[#0057B8]'
                          }`}
                        >
                          {phaseLabel}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                          <span className="font-mono">{prog.progressPercent}%</span> ·{' '}
                          {translateSlaLabel(sla, lang)}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 rtl:rotate-180" />
                    </div>
                  </div>

                  {/* 4-segment progression bar */}
                  <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-w-0">
                    {prog.phases.map((phase) => {
                      const barColor =
                        phase.state === 'completed'
                          ? 'bg-emerald-600'
                          : phase.state === 'attention'
                            ? 'bg-amber-500'
                            : phase.state === 'current'
                              ? 'bg-[#0057B8]'
                              : 'bg-[#DCE7F2]';
                      const labelColor =
                        phase.state === 'completed'
                          ? 'text-emerald-700'
                          : phase.state === 'attention'
                            ? 'text-amber-700 font-semibold'
                            : phase.state === 'current'
                              ? 'text-[#041E4A] font-semibold'
                              : 'text-slate-400';
                      return (
                        <div key={phase.id} className="min-w-0 space-y-1.5">
                          <div className={`h-1.5 w-full rounded-full ${barColor} transition-colors`} />
                          <div className={`truncate text-[11px] ${labelColor}`}>
                            {t.phases[phase.id]?.label || phase.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </button>

                {/* Detailed Chronological Case Activity Log */}
                <div
                  data-testid={`case-activity-log-${c.case_number}`}
                  className="border-t border-[#EFF5FA] bg-[#F7FAFC] px-4 sm:px-5 py-3.5 min-w-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#041E4A]">
                        {t.workspace.tracker.activityLogTitle}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-[11px] tabular-nums text-slate-500">
                        {t.workspace.tracker.eventsCount(timeline.length)}
                      </span>
                    </div>

                    {timeline.length > DEFAULT_VISIBLE_EVENTS && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpandCase(c.id)}
                        className="text-xs font-semibold text-[#0057B8] hover:underline cursor-pointer"
                      >
                        {isExpanded
                          ? t.workspace.tracker.showFewer
                          : t.workspace.tracker.showAllEvents(timeline.length)}
                      </button>
                    )}
                  </div>

                  {visibleEvents.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {t.workspace.tracker.noEvents}
                    </p>
                  ) : (
                    <ol className="mt-2.5 divide-y divide-slate-200/75 min-w-0">
                      {visibleEvents.map((ev) => {
                        const { colorClass, Icon } = eventCategoryVisual(ev.category, ev.label);
                        const localizedLabel = translateTimelineLabel(ev.category, ev.label, lang);
                        return (
                          <li
                            key={ev.id}
                            className="py-2 first:pt-1 last:pb-0.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0"
                          >
                            <time
                              dateTime={ev.timestamp}
                              dir="ltr"
                              className="font-mono text-[11px] tabular-nums text-slate-500 shrink-0 sm:w-36 text-start"
                            >
                              {formatTimelineTimestampUtc(ev.timestamp)}
                            </time>

                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 sm:w-44 ${colorClass}`}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              <span>{localizedLabel}</span>
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs leading-relaxed text-slate-700 break-words">
                                {ev.detail}
                              </div>
                              {ev.meta && (
                                <div className="mt-0.5 font-mono text-[11px] text-slate-500 break-all" dir="ltr">
                                  {ev.meta}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
