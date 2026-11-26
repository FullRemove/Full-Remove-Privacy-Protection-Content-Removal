import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Lock, ShieldCheck, UserCheck, Users } from 'lucide-react';
import type { LangCode } from '../data/translations';
import { PORTAL_TRANSLATIONS } from '../data/portalTranslations';
import { setAuthToken } from '../lib/authClient';
import { PortalLanguageSwitcher } from './PortalLanguageSwitcher';
import { BrandLogoMark } from './BrandLogoMark';

interface LoginPageProps {
  lang?: LangCode;
  onChangeLang?: (lang: LangCode) => void;
  onNavigate: (path: string) => void;
  onAuthenticated: (role: string, targetPath?: string) => void;
}

export function LoginPage({
  lang = 'en',
  onChangeLang,
  onNavigate,
  onAuthenticated,
}: LoginPageProps) {
  const t = PORTAL_TRANSLATIONS[lang].login;
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: 'error', text: data.error || t.codeSendFailed });
      } else {
        setDevCode(data.dev_code || '');
        setCode(data.dev_code || '');
        setStep('code');
        setStatus({
          kind: 'info',
          text: t.codeSentToast(email),
        });
      }
    } catch {
      setStatus({ kind: 'error', text: t.networkErrorStart });
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: 'error', text: data.error || t.codeInvalid });
      } else {
        if (data.token) setAuthToken(data.token);
        onAuthenticated(data.user.role);
      }
    } catch {
      setStatus({ kind: 'error', text: t.networkErrorVerify });
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async (
    role: 'customer' | 'staff',
    targetPath?: '/workspace' | '/staff' | '/platform-ops'
  ) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: 'error', text: t.demoFailed });
      } else {
        if (data.token) setAuthToken(data.token);
        onAuthenticated(data.user.role, targetPath);
      }
    } catch {
      setStatus({ kind: 'error', text: t.demoNetworkError });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#041E4A] flex flex-col">
      <header className="border-b border-[#DCE7F2] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#041E4A] cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{t.backHome}</span>
            </button>
            <span className="hidden sm:inline-block h-4 w-px bg-[#DCE7F2]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hidden sm:inline-flex cursor-pointer shrink-0"
            >
              <BrandLogoMark size="sm" tone="light" />
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-xs font-medium text-[#00758A]">
              {t.portalTag}
            </span>
            {onChangeLang && <PortalLanguageSwitcher lang={lang} onChangeLang={onChangeLang} />}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1060px] flex-1 items-center px-5 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="rounded-2xl border border-[#DCE7F2] bg-white p-7 sm:p-9 shadow-[0_18px_40px_-24px_rgba(4,30,74,0.14)]">
            <div className="text-xs font-semibold text-[#00758A]">{t.eyebrow}</div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#041E4A] sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.subtitle}</p>

            {step === 'email' ? (
              <form onSubmit={handleStart} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700">
                    {t.emailLabel}
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    dir="ltr"
                    className="mt-2 w-full rounded-xl border border-[#C7D7E8] bg-[#F7FAFC] px-3.5 py-2.5 text-sm text-[#041E4A] placeholder-slate-400 outline-none transition focus:border-[#0057B8] focus:bg-white focus:ring-2 focus:ring-[#0057B8]/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0057B8] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004494] disabled:opacity-60 cursor-pointer"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>{busy ? t.sendingCode : t.sendCode}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="mt-7 space-y-5">
                {devCode && (
                  <div className="rounded-xl border border-[#0057B8]/25 bg-[#EFF7FC] px-4 py-3 text-xs text-[#041E4A]">
                    {t.devCodePrefix}{' '}
                    <strong className="font-mono tracking-widest text-[#0057B8]" dir="ltr">
                      {devCode}
                    </strong>
                  </div>
                )}
                <div>
                  <label htmlFor="auth-code" className="block text-xs font-semibold text-slate-700">
                    {t.codeLabel}
                  </label>
                  <input
                    id="auth-code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    dir="ltr"
                    className="mt-2 w-full rounded-xl border border-[#C7D7E8] bg-[#F7FAFC] px-3.5 py-2.5 font-mono text-base tracking-[0.28em] text-[#041E4A] outline-none transition focus:border-[#0057B8] focus:bg-white focus:ring-2 focus:ring-[#0057B8]/15"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-xl bg-[#0057B8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004494] disabled:opacity-60 cursor-pointer"
                  >
                    {busy ? t.signingInBtn : t.signInBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="rounded-xl border border-[#DCE7F2] px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-[#EFF5FA] cursor-pointer"
                  >
                    {t.changeEmail}
                  </button>
                </div>
              </form>
            )}

            {status && (
              <div
                className={`mt-5 rounded-xl border px-3.5 py-2.5 text-xs ${
                  status.kind === 'error'
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                {status.text}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#DCE7F2] bg-white p-6 sm:p-7 shadow-[0_12px_32px_-22px_rgba(4,30,74,0.12)]">
              <div className="text-xs font-semibold text-[#00758A]">{t.demoEyebrow}</div>
              <h2 className="mt-1.5 font-display text-lg font-bold text-[#041E4A]">
                {t.demoTitle}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{t.demoSubtitle}</p>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  disabled={busy}
                  data-testid="demo-customer-btn"
                  onClick={() => handleDemoLogin('customer', '/workspace')}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3 text-start transition hover:border-[#0057B8]/50 hover:bg-white disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserCheck className="h-4 w-4 text-[#0057B8] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#041E4A]">
                        {t.demoCustomerTitle}
                      </div>
                      <div className="text-xs text-slate-500">{t.demoCustomerDesc}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 rtl:rotate-180" />
                </button>

                <button
                  type="button"
                  disabled={busy}
                  data-testid="demo-staff-btn"
                  onClick={() => handleDemoLogin('staff', '/staff')}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-3 text-start transition hover:border-[#00758A]/60 hover:bg-white disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className="h-4 w-4 text-[#00758A] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#041E4A]">{t.demoStaffTitle}</div>
                      <div className="text-xs text-slate-500">{t.demoStaffDesc}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 rtl:rotate-180" />
                </button>

                <button
                  type="button"
                  disabled={busy}
                  data-testid="demo-admin-btn"
                  onClick={() => handleDemoLogin('staff', '/platform-ops')}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#041E4A] bg-[#041E4A] px-4 py-3 text-start transition hover:bg-[#07224D] disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ShieldCheck className="h-4 w-4 text-[#00C8D7] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{t.demoAdminTitle}</div>
                      <div className="text-xs text-slate-300">{t.demoAdminDesc}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#7CE7F5] shrink-0 rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#DCE7F2] bg-white/80 p-4 text-xs text-slate-600">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#00758A]" />
              <p>{t.securityNote}</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
