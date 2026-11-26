import { AlertTriangle, Check, Clock, Radio } from 'lucide-react';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { computeCaseJourneyTimeline, type ProtectionCase } from '../lib/caseLogic';

interface CaseJourneyIndicatorProps {
  caseItem: Pick<
    ProtectionCase,
    'id' | 'case_number' | 'status' | 'submitted_at' | 'updated_at' | 'submissions' | 'verifications'
  >;
  variant?: 'compact' | 'timeline';
  lang?: LangCode;
}

function toneFillClass(tone: 'sky' | 'emerald' | 'amber' | 'rose'): string {
  switch (tone) {
    case 'emerald':
      return 'bg-emerald-600';
    case 'amber':
      return 'bg-amber-500';
    case 'rose':
      return 'bg-rose-600';
    default:
      return 'bg-[#0057B8]';
  }
}

function toneTextClass(tone: 'sky' | 'emerald' | 'amber' | 'rose'): string {
  switch (tone) {
    case 'emerald':
      return 'text-emerald-700';
    case 'amber':
      return 'text-amber-700';
    case 'rose':
      return 'text-rose-700';
    default:
      return 'text-[#0057B8]';
  }
}

export function CaseJourneyIndicator({
  caseItem,
  variant = 'compact',
  lang = 'en',
}: CaseJourneyIndicatorProps) {
  const journey = computeCaseJourneyTimeline(caseItem);
  const fillClass = toneFillClass(journey.tone);
  const textClass = toneTextClass(journey.tone);
  const t = PORTAL_TRANSLATIONS[lang];
  const stageLabel = translateStatus(caseItem.status, lang) || journey.currentStageLabel;

  if (variant === 'compact') {
    return (
      <div
        data-testid={`case-journey-compact-${caseItem.case_number}`}
        className="mt-2.5 w-full space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className={`truncate font-semibold ${textClass}`}>
            {stageLabel}
          </span>
          <span className="shrink-0 font-mono tabular-nums text-slate-500 font-medium">
            {journey.progressPercent}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label={`${caseItem.case_number} ${t.workspace.tracker.journeyHeading}`}
          aria-valuenow={journey.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
            style={{ width: `${journey.progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-1 text-[10px]">
          {journey.milestones.map((step) => {
            const labelTone =
              step.state === 'completed'
                ? 'text-emerald-700 font-medium'
                : step.state === 'attention'
                  ? 'text-amber-700 font-semibold'
                  : step.state === 'current'
                    ? 'text-[#041E4A] font-semibold'
                    : 'text-slate-400';
            const milestoneCopy = t.journeyMilestones[step.id];
            return (
              <div key={step.id} className={`truncate ${labelTone}`}>
                {milestoneCopy?.shortLabel || step.shortLabel}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`case-journey-timeline-${caseItem.case_number}`}
      className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 sm:p-5 space-y-3.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold text-[#041E4A]">
          {t.workspace.tracker.journeyHeading}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold ${textClass}`}>{stageLabel}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono tabular-nums font-semibold text-[#041E4A]">
            {journey.progressPercent}%
          </span>
        </div>
      </div>

      {/* Continuous track progress bar */}
      <div
        role="progressbar"
        aria-label={`${caseItem.case_number} ${t.workspace.tracker.journeyHeading}`}
        aria-valuenow={journey.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-[#DCE7F2]"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
          style={{ width: `${journey.progressPercent}%` }}
        />
      </div>

      {/* Connected 4-milestone nodes */}
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {journey.milestones.map((step) => {
          const isCompleted = step.state === 'completed';
          const isCurrent = step.state === 'current';
          const isAttention = step.state === 'attention';
          const milestoneCopy = t.journeyMilestones[step.id];

          return (
            <li
              key={step.id}
              data-milestone-id={step.id}
              data-milestone-state={step.state}
              className="flex items-start gap-2.5 min-w-0"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : isAttention
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : isCurrent
                        ? 'border-[#0057B8]/30 bg-[#EFF7FC] text-[#0057B8]'
                        : 'border-[#DCE7F2] bg-white text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isAttention ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <Radio className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <div
                  className={`text-xs font-semibold truncate ${
                    isCompleted || isCurrent || isAttention ? 'text-[#041E4A]' : 'text-slate-400'
                  }`}
                >
                  {milestoneCopy?.label || step.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {step.dateLabel ||
                    (isCompleted
                      ? t.journeyMilestones.completed
                      : isAttention
                        ? t.journeyMilestones.actionNeeded
                        : isCurrent
                          ? t.journeyMilestones.inProgress
                          : t.journeyMilestones.pending)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
