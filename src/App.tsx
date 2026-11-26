import { useEffect, useState } from 'react';
import { SITE_TRANSLATIONS, type LangCode } from './data/translations';
import { PORTAL_TRANSLATIONS } from './data/portalTranslations';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { WorkspacePage } from './components/WorkspacePage';
import { StaffPage } from './components/StaffPage';
import { PlatformOpsPage } from './components/PlatformOpsPage';
import { LegalPage } from './components/LegalPage';
import { PublicVerifyPage } from './components/PublicVerifyPage';

function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\.html$/, '');
  if (clean === '' || clean === '/index') return '/';
  return clean;
}

export default function App() {
  const [route, setRoute] = useState<string>(() => normalizePath(window.location.pathname));
  const [lang, setLang] = useState<LangCode>(() => {
    try {
      const saved = localStorage.getItem('fullremove-language');
      if (saved === 'ar' || saved === 'ku') return saved;
    } catch {
      // ignore storage access errors
    }
    return 'en';
  });

  useEffect(() => {
    const onPopState = () => {
      setRoute(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const copy = SITE_TRANSLATIONS[lang];
    const portalCopy = PORTAL_TRANSLATIONS[lang];
    document.documentElement.lang = copy.htmlLang;
    document.documentElement.dir = copy.dir;

    if (route === '/') {
      document.title = copy.metaTitle;
    } else if (route === '/login') {
      document.title = portalCopy.routes.login;
    } else if (route === '/workspace') {
      document.title = portalCopy.routes.workspace;
    } else if (route === '/staff') {
      document.title = portalCopy.routes.staff;
    } else if (route === '/platform-ops') {
      document.title = portalCopy.routes.platformOps;
    } else if (route === '/verify') {
      document.title = portalCopy.routes.verify;
    } else if (route === '/privacy') {
      document.title = `${copy.footer.privacyLink} — Full Remove`;
    } else {
      document.title = `${copy.footer.termsLink} — Full Remove`;
    }
  }, [lang, route]);

  const navigate = (path: string) => {
    const [rawPath, rawSearch] = path.split('?');
    const normalized = normalizePath(rawPath || '/');
    const nextUrl = rawSearch ? `${normalized}?${rawSearch}` : normalized;
    if (normalized !== route || window.location.search !== (rawSearch ? `?${rawSearch}` : '')) {
      window.history.pushState({}, '', nextUrl);
      setRoute(normalized);
      window.scrollTo({ top: 0 });
    }
  };

  const handleLanguageChange = (nextLang: LangCode) => {
    setLang(nextLang);
    try {
      localStorage.setItem('fullremove-language', nextLang);
    } catch {
      // ignore
    }
  };

  if (route === '/login') {
    return (
      <LoginPage
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
        onAuthenticated={(role, targetPath) => {
          if (targetPath) {
            navigate(targetPath);
          } else if (['owner', 'admin', 'analyst', 'viewer'].includes(role)) {
            navigate('/staff');
          } else {
            navigate('/workspace');
          }
        }}
      />
    );
  }

  if (route === '/workspace') {
    return (
      <WorkspacePage
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/staff') {
    return (
      <StaffPage
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/platform-ops') {
    return (
      <PlatformOpsPage
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/verify') {
    return (
      <PublicVerifyPage
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/privacy') {
    return (
      <LegalPage
        mode="privacy"
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/terms') {
    return (
      <LegalPage
        mode="terms"
        lang={lang}
        onChangeLang={handleLanguageChange}
        onNavigate={navigate}
      />
    );
  }

  return (
    <LandingPage
      lang={lang}
      onChangeLang={handleLanguageChange}
      onNavigate={navigate}
    />
  );
}
