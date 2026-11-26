import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE_TRANSLATIONS, type LangCode } from '../data/translations';
import { BrandLogoMark } from './BrandLogoMark';

interface LandingHeaderProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigate: (path: string) => void;
  subpage?: boolean;
}

export function LandingHeader({
  lang,
  onChangeLang,
  onNavigate,
  subpage = false,
}: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = SITE_TRANSLATIONS[lang];

  const handleAnchor = (hash: string) => {
    setMobileOpen(false);
    if (subpage) {
      onNavigate('/');
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DCE7F2] bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-5 py-2.5 sm:px-8">
        {/* Zone 1: Official Full Remove Brand Lockup */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex shrink-0 items-center whitespace-nowrap no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0057B8]"
        >
          <BrandLogoMark size="md" tone="light" />
        </a>

        {/* Zone 2: Clean Single-Line Typography Nav Links */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {[
            { href: '#services', label: copy.nav.services },
            { href: '#process', label: copy.nav.process },
            { href: '#pricing', label: copy.nav.pricing },
            { href: '#faq', label: copy.nav.faq },
          ].map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleAnchor(item.href)}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 underline-offset-8 decoration-[#00869E] transition-colors duration-150 hover:text-[#041E4A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0057B8] cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onNavigate('/verify')}
            className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-600 underline-offset-8 decoration-[#00869E] transition-colors duration-150 hover:text-[#041E4A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0057B8] cursor-pointer"
          >
            {copy.footer.verifyLink}
          </button>
        </nav>

        {/* Zone 3: Language Links + Primary CTA */}
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-1" role="group" aria-label="Language switcher">
            {(['en', 'ar', 'ku'] as LangCode[]).map((code) => (
              <button
                key={code}
                type="button"
                data-testid={`header-lang-${code}`}
                onClick={() => onChangeLang(code)}
                className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors rounded-md cursor-pointer ${
                  lang === code
                    ? 'bg-[#041E4A] text-white'
                    : 'text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A]'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="hidden sm:inline-flex shrink-0 whitespace-nowrap items-center justify-center rounded-lg bg-[#0057B8] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-[#004494] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057B8] cursor-pointer"
          >
            {copy.nav.getStarted}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#041E4A] hover:bg-[#EFF5FA] lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#DCE7F2] bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {[
              { href: '#services', label: copy.nav.services },
              { href: '#process', label: copy.nav.process },
              { href: '#pricing', label: copy.nav.pricing },
              { href: '#faq', label: copy.nav.faq },
            ].map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleAnchor(item.href)}
                className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-slate-700 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onNavigate('/verify');
              }}
              className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-slate-700 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
            >
              {copy.footer.verifyLink}
            </button>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <div className="inline-flex items-center gap-1">
                {(['en', 'ar', 'ku'] as LangCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onChangeLang(code)}
                    className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-md cursor-pointer ${
                      lang === code ? 'bg-[#041E4A] text-white' : 'text-slate-500'
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate('/login');
                }}
                className="rounded-lg bg-[#0057B8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004494] cursor-pointer"
              >
                {copy.nav.getStarted}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
