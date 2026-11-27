interface RemovalSealIconProps {
  size?: 'sm' | 'md';
  animate?: boolean;
  dataTestId?: string;
}

export function RemovalSealIcon({
  size = 'md',
  animate = true,
  dataTestId,
}: RemovalSealIconProps) {
  const boxSize = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  const svgSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span
      data-testid={dataTestId}
      className={`relative inline-flex ${boxSize} shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 ${
        animate
          ? 'animate-[frCheckRing_420ms_cubic-bezier(0.16,1,0.3,1)_both,frEmeraldHalo_950ms_cubic-bezier(0.16,1,0.3,1)_180ms_both]'
          : ''
      }`}
    >
      {animate && size === 'md' && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 end-0.5 h-1.5 w-1.5 rounded-full bg-[#00B8D4] animate-[frSparkleDot_800ms_ease-out_140ms_both]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-0.5 start-0 h-1 w-1 rounded-full bg-emerald-500 animate-[frSparkleDot_760ms_ease-out_240ms_both]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-0.5 end-0 h-1 w-1 rounded-full bg-emerald-400 animate-[frSparkleDot_780ms_ease-out_300ms_both]"
          />
        </>
      )}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svgSize}
        aria-hidden="true"
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          strokeDasharray="28"
          strokeDashoffset={animate ? undefined : 0}
          className={animate ? 'animate-[frCheckStroke_360ms_cubic-bezier(0.22,1,0.36,1)_140ms_both]' : ''}
        />
      </svg>
    </span>
  );
}

interface RemovalConfirmedBadgeProps {
  label: string;
  dataTestId?: string;
}

export function RemovalConfirmedBadge({ label, dataTestId }: RemovalConfirmedBadgeProps) {
  return (
    <span
      data-testid={dataTestId}
      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 animate-[frFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both]"
    >
      <RemovalSealIcon size="sm" animate />
      <span>{label}</span>
    </span>
  );
}
