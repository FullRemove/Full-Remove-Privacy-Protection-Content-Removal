import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const OFFICIAL_LOGO_SRC =
  '/assets/aistudio/Full_Remove_Digital_Protection_Logo_28eec57d.png';

interface BrandLogoMarkProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  label?: string;
}

export function BrandLogoMark({
  size = 'md',
  tone = 'light',
  label,
}: BrandLogoMarkProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const heightClass =
    size === 'sm' ? 'h-10 w-auto' : size === 'lg' ? 'h-14 w-auto' : 'h-12 w-auto';

  const fallbackBadgeClass =
    size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';

  const altText = label && label !== 'Full Remove' ? `Full Remove — ${label}` : 'Full Remove';

  if (imgFailed) {
    return (
      <span className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
        <span
          className={`${fallbackBadgeClass} flex shrink-0 items-center justify-center rounded-full bg-[#041E4A] text-[#00B8D4]`}
        >
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="font-display text-base font-extrabold tracking-tight">
          <span className={tone === 'dark' ? 'text-white' : 'text-[#041E4A]'}>Full</span>{' '}
          <span className={tone === 'dark' ? 'text-[#00C8D7]' : 'text-[#00758A]'}>Remove</span>
        </span>
      </span>
    );
  }

  if (tone === 'dark') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-xl bg-white px-3 py-1.5 shadow-xs ring-1 ring-white/20">
        <img
          src={OFFICIAL_LOGO_SRC}
          alt={altText}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className={`${heightClass} max-w-full shrink-0 object-contain`}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap">
      <img
        src={OFFICIAL_LOGO_SRC}
        alt={altText}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${heightClass} max-w-full shrink-0 object-contain`}
      />
    </span>
  );
}
