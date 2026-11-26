import type { LangCode } from '../data/translations';
import { PORTAL_TRANSLATIONS } from '../data/portalTranslations';

interface PortalLanguageSwitcherProps {
  lang: LangCode;
  onChangeLang?: (lang: LangCode) => void;
  onChange?: (lang: LangCode) => void;
  variant?: 'light' | 'dark';
}

const LANGUAGES: { code: LangCode; label: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'ar', label: 'AR', nativeName: 'العربية' },
  { code: 'ku', label: 'KU', nativeName: 'کوردی' },
];

export function PortalLanguageSwitcher({
  lang,
  onChangeLang,
  onChange,
  variant = 'light',
}: PortalLanguageSwitcherProps) {
  const ariaLabel = PORTAL_TRANSLATIONS[lang].common.languageLabel;
  const handleSelect = onChangeLang ?? onChange;
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex h-9 items-center rounded-lg border p-0.5 shrink-0 ${
        isDark
          ? 'border-white/15 bg-white/[0.06]'
          : 'border-[#DCE7F2] bg-[#EFF5FA]'
      }`}
      role="group"
      aria-label={ariaLabel}
      data-testid="portal-language-switcher"
    >
      {LANGUAGES.map((item) => {
        const active = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            title={item.nativeName}
            aria-pressed={active}
            data-testid={`lang-btn-${item.code}`}
            onClick={() => handleSelect?.(item.code)}
            className={`inline-flex h-full items-center justify-center rounded-md px-2.5 text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0057B8] ${
              active
                ? isDark
                  ? 'bg-white text-[#041E4A] shadow-xs'
                  : 'bg-white text-[#041E4A] shadow-xs ring-1 ring-[#0057B8]/20'
                : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-500 hover:text-[#041E4A]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
