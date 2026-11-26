import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SITE_TRANSLATIONS, type LangCode } from '../data/translations';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import { formatTimelineTimestampUtc, type MirrorSummary } from '../lib/caseLogic';
import { LandingHeader } from './LandingHeader';

interface PublicVerifyPageProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigate: (path: string) => void;
}

interface VerifyResponsePayload {
  verified: boolean;
  case_number: string;
  verification_seal_code: string;
  platform: string;
  complaint_type: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  monitoring_enabled: boolean;
  latest_verification: {
    result: string;
    checked_at: string;
  } | null;
  mirror_summary: MirrorSummary;
}

export function PublicVerifyPage({ lang, onChangeLang, onNavigate }: PublicVerifyPageProps) {
  const siteCopy = SITE_TRANSLATIONS[lang];
  const portalCopy = PORTAL_TRANSLATIONS[lang];
  const vCopy = portalCopy.enhancements.verifyPage;

  const [code, setCode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('code') || '';
    } catch {
      return '';
    }
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResponsePayload | null>(null);
  const [notFound, setNotFound] = useState(false);

  const performLookup = async (rawCode: string) => {
    const cleaned = rawCode.trim().toUpperCase();
    if (!cleaned) return;
    setBusy(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/public-verify?code=${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        setResult(null);
        setNotFound(true);
      } else {
        const data = (await res.json()) as VerifyResponsePayload;
        if (data.verified) {
          setResult(data);
        } else {
          setResult(null);
          setNotFound(true);
        }
      }
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (code.trim()) {
      void performLookup(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void performLookup(code);
  };

  return (
    <div
      dir={siteCopy.dir}
      lang={siteCopy.htmlLang}
      className="min-h-screen bg-[#F7FAFC] text-[#041E4A]"
    >
      <LandingHeader lang={lang} onChangeLang={onChangeLang} onNavigate={onNavigate} subpage />

      <main className="mx-auto max-w-[820px] px-5 pt-12 pb-20 sm:px-8">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#041E4A] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{vCopy.backHome}</span>
        </button>

        <section className="mt-6 rounded-2xl border border-[#DCE7F2] bg-white p-6 sm:p-8 shadow-[0_12px_32px_-22px_rgba(4,30,74,0.12)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00758A]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{vCopy.eyebrow}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#041E4A] sm:text-3xl">
            {vCopy.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{vCopy.subtitle}</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={vCopy.placeholder}
                data-testid="public-verify-input"
                dir="ltr"
                className="w-full rounded-xl border border-[#C7D7E8] bg-[#F7FAFC] py-3 ps-10 pe-4 font-mono text-sm text-[#041E4A] placeholder-slate-400 outline-none focus:border-[#0057B8] focus:bg-white focus:ring-2 focus:ring-[#0057B8]/15"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !code.trim()}
              data-testid="public-verify-submit"
              className="rounded-xl bg-[#0057B8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004494] disabled:opacity-60 cursor-pointer shrink-0"
            >
              {busy ? vCopy.verifyingBtn : vCopy.verifyBtn}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#00758A] shrink-0" />
              <span>{vCopy.privacyNote}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setCode('FR-SEAL-1022A4');
                void performLookup('FR-SEAL-1022A4');
              }}
              className="font-mono text-[11px] font-semibold text-[#0057B8] hover:underline cursor-pointer"
              dir="ltr"
            >
              FR-SEAL-1022A4
            </button>
          </div>
        </section>

        {result && (
          <section
            data-testid="public-verify-result"
            className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6 sm:p-7 shadow-[0_12px_32px_-22px_rgba(5,150,105,0.2)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-4">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{vCopy.validBadge}</span>
              </div>
              <span
                className="font-mono text-xs font-bold text-emerald-800 tabular-nums"
                dir="ltr"
              >
                {result.verification_seal_code}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="border-b border-[#EFF5FA] pb-3 sm:border-b-0 sm:pb-0">
                <div className="text-[11px] font-medium text-slate-500">{vCopy.caseNumber}</div>
                <div className="mt-1 font-mono text-sm font-bold text-[#041E4A] tabular-nums" dir="ltr">
                  {result.case_number}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{vCopy.platform}</div>
                <div className="mt-1 text-sm font-bold text-[#041E4A]">{result.platform}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{vCopy.status}</div>
                <div className="mt-1 text-sm font-bold text-emerald-700">
                  {translateStatus(result.status, lang)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{vCopy.submittedAt}</div>
                <div className="mt-1 font-mono text-xs font-semibold text-slate-700 tabular-nums" dir="ltr">
                  {formatTimelineTimestampUtc(result.submitted_at)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{vCopy.latestCheck}</div>
                <div className="mt-1 text-xs font-semibold text-[#041E4A]">
                  {result.latest_verification
                    ? translateStatus(result.latest_verification.result, lang)
                    : portalCopy.common.none}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{vCopy.mirrorsLabel}</div>
                <div className="mt-1 text-xs font-semibold text-slate-700 tabular-nums">
                  {vCopy.mirrorsCount(
                    result.mirror_summary?.removed || 0,
                    result.mirror_summary?.total || 0
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {notFound && (
          <section
            data-testid="public-verify-not-found"
            className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-rose-800">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{vCopy.notFoundTitle}</span>
            </div>
            <p className="mt-2 text-xs text-rose-700">{vCopy.notFoundBody}</p>
          </section>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="rounded-xl border border-[#DCE7F2] bg-white px-4 py-2 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
          >
            {vCopy.openLogin}
          </button>
        </div>
      </main>
    </div>
  );
}
