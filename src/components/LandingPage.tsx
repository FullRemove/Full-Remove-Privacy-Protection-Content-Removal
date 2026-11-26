import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Lock,
  MessageSquare,
  Quote,
  Scale,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SITE_TRANSLATIONS, type LangCode } from '../data/translations';
import {
  evaluateCaseReadiness,
  formatCurrencyUsd,
  SERVICE_PACKAGES,
  type TriageIssueCategory,
} from '../lib/caseLogic';
import { LandingHeader } from './LandingHeader';
import { ContactWidget } from './ContactWidget';
import { BrandLogoMark } from './BrandLogoMark';

interface LandingPageProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigate: (path: string) => void;
}

const HERO_STUDIO_IMG = '/src/assets/images/hero_atelier_studio_1795724000105.jpg';
const PRIVACY_VAULT_IMG = '/src/assets/images/privacy_vault_glass_1795724000311.jpg';
const VERIFICATION_DESK_IMG = '/src/assets/images/verification_atelier_desk_1795724000495.jpg';

const TRIAGE_PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Website / Domain', 'Google'];

function getOrCreateSessionKey(): string {
  try {
    let sKey = sessionStorage.getItem('fr_visit_session');
    if (!sKey) {
      sKey = 's-' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('fr_visit_session', sKey);
    }
    return sKey;
  } catch {
    return 's-direct';
  }
}

export function LandingPage({ lang, onChangeLang, onNavigate }: LandingPageProps) {
  const copy = SITE_TRANSLATIONS[lang];
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [visibleStories, setVisibleStories] = useState(3);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [vaultImgFailed, setVaultImgFailed] = useState(false);
  const [deskImgFailed, setDeskImgFailed] = useState(false);

  useEffect(() => {
    const syncVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleStories(1);
      } else if (window.innerWidth < 1024) {
        setVisibleStories(2);
      } else {
        setVisibleStories(3);
      }
    };
    syncVisibleCount();
    window.addEventListener('resize', syncVisibleCount);
    return () => window.removeEventListener('resize', syncVisibleCount);
  }, []);

  const totalStories = copy.successStoriesSection.items.length;
  const maxStoryStart = Math.max(0, totalStories - visibleStories);
  const safeStoryIndex = Math.min(storyIndex, maxStoryStart);
  const activeStorySlice = useMemo(
    () =>
      copy.successStoriesSection.items
        .slice(safeStoryIndex, safeStoryIndex + visibleStories)
        .map((item, offset) => ({
          ...item,
          orderNumber: safeStoryIndex + offset + 1,
        })),
    [copy.successStoriesSection.items, safeStoryIndex, visibleStories]
  );

  const handlePrevStory = () => {
    const count = maxStoryStart + 1;
    setStoryIndex((prev) => (Math.min(prev, maxStoryStart) - 1 + count) % count);
  };

  const handleNextStory = () => {
    const count = maxStoryStart + 1;
    setStoryIndex((prev) => (Math.min(prev, maxStoryStart) + 1) % count);
  };

  const [issueCategory, setIssueCategory] = useState<TriageIssueCategory>('impostor_account');
  const [estPlatform, setEstPlatform] = useState<string>('Instagram');
  const [hasDirectUrl, setHasDirectUrl] = useState<boolean>(true);
  const [hasOwnershipOrId, setHasOwnershipOrId] = useState<boolean>(true);
  const [activeExtortionThreat, setActiveExtortionThreat] = useState<boolean>(false);

  const readiness = useMemo(
    () =>
      evaluateCaseReadiness({
        issueCategory,
        platform: estPlatform,
        hasDirectUrl,
        hasOwnershipOrId,
        activeExtortionThreat,
      }),
    [issueCategory, estPlatform, hasDirectUrl, hasOwnershipOrId, activeExtortionThreat]
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<{
    kind: 'info' | 'success' | 'error';
    text: string;
    trackingCode?: string;
  } | null>(null);

  const [publicMetrics, setPublicMetrics] = useState<{
    totalCases: number;
    resolvedCases: number;
    verifiedRemovals: number;
  } | null>(null);
  const [trackCode, setTrackCode] = useState('');
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackResult, setTrackResult] = useState<{
    tracking_code: string;
    status: string;
    interest: string;
    created_at: string;
    case_number?: string | null;
    linked_case_status?: string | null;
  } | null>(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    try {
      let vKey = localStorage.getItem('fr_visitor_key');
      if (!vKey) {
        vKey = 'v-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('fr_visitor_key', vKey);
      }
      const sKey = getOrCreateSessionKey();
      const ua = navigator.userAgent;
      const isMobile = /Mobi|Android/i.test(ua);
      const browser = ua.includes('Firefox')
        ? 'Firefox'
        : ua.includes('Edg')
          ? 'Edge'
          : ua.includes('Chrome')
            ? 'Chrome'
            : ua.includes('Safari')
              ? 'Safari'
              : 'Web Browser';
      const os = ua.includes('Mac')
        ? 'macOS'
        : ua.includes('Win')
          ? 'Windows'
          : ua.includes('Android')
            ? 'Android'
            : ua.includes('iPhone') || ua.includes('iPad')
              ? 'iOS'
              : 'Linux';

      fetch('/api/public-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_key: vKey,
          session_key: sKey,
          page: '/',
          referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
          device_type: isMobile ? 'mobile' : 'desktop',
          browser,
          operating_system: os,
        }),
      }).catch(() => {});

      fetch('/api/public-metrics')
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => {
          if (m && typeof m.totalCases === 'number') {
            setPublicMetrics({
              totalCases: m.totalCases,
              resolvedCases: m.resolvedCases,
              verifiedRemovals: m.verifiedRemovals,
            });
          }
        })
        .catch(() => {});
    } catch {
      // ignore storage errors
    }
  }, []);

  const prefillInquiry = (serviceName: string, prefillMsg?: string) => {
    setInterest(serviceName);
    if (prefillMsg && !message.trim()) {
      setMessage(prefillMsg);
    }
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitInquiry = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setInquiryStatus({ kind: 'info', text: copy.contactSection.form.sendingNote });

    try {
      const res = await fetch('/api/public-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          interest: interest || copy.contactSection.form.otherOption,
          message,
          website,
          language: lang,
          session_key: getOrCreateSessionKey(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setInquiryStatus({
          kind: 'error',
          text: data.error || copy.contactSection.form.errorNote,
        });
      } else {
        setInquiryStatus({
          kind: 'success',
          text: copy.contactSection.form.successNote,
          trackingCode: data.tracking_code,
        });
        if (data.tracking_code) {
          setTrackCode(String(data.tracking_code));
        }
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setInquiryStatus({ kind: 'error', text: copy.contactSection.form.errorNote });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackInquiry = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = trackCode.trim();
    if (!cleaned) return;
    setTrackingBusy(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await fetch(`/api/public-inquiry/track?code=${encodeURIComponent(cleaned)}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setTrackError(json.error || copy.contactSection.tracker.notFound);
      } else {
        setTrackResult({
          tracking_code: json.tracking_code,
          status: json.status,
          interest: json.interest,
          created_at: json.created_at,
          case_number: json.linked_case_number || null,
          linked_case_status: json.linked_case_status || null,
        });
      }
    } catch {
      setTrackError(copy.contactSection.tracker.notFound);
    } finally {
      setTrackingBusy(false);
    }
  };

  return (
    <div dir={copy.dir} className="min-h-screen bg-[#F7FAFC] text-[#041E4A]">
      <LandingHeader lang={lang} onChangeLang={onChangeLang} onNavigate={onNavigate} />

      <main>
        {/* 1. PROPOSITION — Official Brand Porcelain Studio Hero */}
        <section className="border-b border-[#DCE7F2] bg-[#F7FAFC]">
          <div className="mx-auto max-w-[1240px] px-5 pb-16 pt-12 sm:px-8 lg:pb-24 lg:pt-18">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch">
              <div className="flex flex-col justify-between lg:col-span-6">
                <div>
                  <p className="text-sm font-semibold text-[#00758A]">{copy.hero.eyebrow}</p>
                  <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-[#041E4A] sm:text-5xl lg:text-[3.5rem] [text-wrap:balance]">
                    {copy.hero.titlePrefix}
                    <span className="text-[#0057B8]">{copy.hero.titleHighlight}</span>
                  </h1>
                  <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-slate-600 sm:text-lg">
                    {copy.hero.lead}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        document.querySelector('#estimator')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0057B8] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(0,87,184,0.45)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#004494] cursor-pointer whitespace-nowrap"
                    >
                      <span>{copy.hero.primaryCta}</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#C7D7E8] bg-white px-5 py-3.5 text-sm font-semibold text-[#041E4A] transition-colors duration-150 hover:border-[#0057B8]/40 hover:bg-[#EFF5FA] cursor-pointer whitespace-nowrap"
                    >
                      <span>{copy.hero.secondaryCta}</span>
                    </button>
                  </div>
                </div>

                <p className="mt-8 border-t border-[#DCE7F2] pt-5 text-xs font-medium text-slate-500">
                  {copy.hero.note}
                </p>
              </div>

              {/* Hero Right Column — Editorial Studio Image + Clean 4-Step Case Rail */}
              <div className="lg:col-span-6 flex">
                <div className="flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#DCE7F2] bg-white shadow-[0_24px_48px_-24px_rgba(4,30,74,0.16)]">
                  <div className="relative flex-1 min-h-[260px] w-full overflow-hidden bg-[#EFF5FA]">
                    {!heroImgFailed ? (
                      <img
                        src={HERO_STUDIO_IMG}
                        alt="Full Remove private operations consulting studio"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EFF5FA]">
                        <ShieldCheck className="h-14 w-14 text-[#0057B8]/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#031738]/80 via-[#031738]/20 to-transparent" />
                    <div className="absolute bottom-4 start-5 end-5 flex items-end justify-between gap-4 text-white">
                      <div>
                        <div className="text-xs font-medium text-slate-200">
                          {copy.hero.cardLabel}
                        </div>
                        <div className="font-display text-base font-bold">{copy.hero.cardTitle}</div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300 whitespace-nowrap">
                        {copy.hero.cardStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid divide-y divide-[#DCE7F2] border-t border-[#DCE7F2] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                    {copy.hero.steps.map((step, idx) => (
                      <div key={step.title} className="p-4 bg-white">
                        <div
                          className={`mb-2.5 h-1 w-full rounded-full ${
                            step.done
                              ? 'bg-emerald-600'
                              : step.active
                                ? 'bg-[#0057B8]'
                                : 'bg-[#DCE7F2]'
                          }`}
                        />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono tabular-nums text-slate-400">0{idx + 1}</span>
                          <span
                            className={
                              step.done
                                ? 'text-emerald-700 font-semibold'
                                : step.active
                                  ? 'text-[#0057B8] font-semibold'
                                  : 'text-slate-400'
                            }
                          >
                            {step.state}
                          </span>
                        </div>
                        <div className="mt-1.5 text-xs font-bold text-[#041E4A]">{step.title}</div>
                        <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                          {step.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Unboxed Trust Line */}
            <div className="mt-14 flex flex-col gap-3 border-t border-[#DCE7F2] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold text-slate-500">{copy.trust.label}</span>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-xs font-medium text-slate-700">
                {copy.trust.items.map((item, idx) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#00758A] tabular-nums">
                      0{idx + 1}
                    </span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. CAPABILITIES — Pure White Editorial Bento */}
        <section id="services" className="border-b border-[#DCE7F2] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-sm font-semibold text-[#00758A]">
                  {copy.servicesSection.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A] sm:text-4xl [text-wrap:balance]">
                  {copy.servicesSection.heading}
                </h2>
                <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-slate-600">
                  {copy.servicesSection.intro}
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-[#DCE7F2] bg-[#EFF5FA]">
                  <div className="aspect-[16/9] w-full overflow-hidden">
                    {!vaultImgFailed ? (
                      <img
                        src={PRIVACY_VAULT_IMG}
                        alt="Encrypted privacy governance and evidence protection"
                        referrerPolicy="no-referrer"
                        onError={() => setVaultImgFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#EFF5FA]">
                        <Scale className="h-10 w-10 text-[#0057B8]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {copy.servicesSection.items.map((item, idx) => (
                <article
                  key={item.title}
                  className={`flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-[#F7FAFC] p-6 sm:p-7 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#00869E]/45 hover:bg-white hover:shadow-[0_12px_28px_-18px_rgba(4,30,74,0.16)] ${
                    idx < 2 || idx >= 6 ? 'lg:col-span-2' : 'lg:col-span-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-3 text-xs">
                      <span className="font-mono font-semibold tabular-nums text-[#0057B8]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-slate-500">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold leading-snug text-[#041E4A]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE CASE READINESS WORKBENCH */}
        <section id="estimator" className="border-b border-[#DCE7F2] bg-[#EFF5FA] py-20 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="max-w-[680px]">
              <p className="text-sm font-semibold text-[#00758A]">
                {copy.estimatorSection.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A] sm:text-4xl [text-wrap:balance]">
                {copy.estimatorSection.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {copy.estimatorSection.intro}
              </p>
            </div>

            <div className="mt-10 grid gap-8 rounded-2xl border border-[#DCE7F2] bg-white p-6 sm:p-8 shadow-[0_16px_40px_-24px_rgba(4,30,74,0.12)] lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-6">
                <div>
                  <label className="block text-sm font-bold text-[#041E4A]">
                    {copy.estimatorSection.issueLabel}
                  </label>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {SERVICE_PACKAGES.map((pkg) => {
                      const planMatch = copy.pricingSection.plans.find((p) => p.code === pkg.code);
                      const displayLabel = planMatch?.name || pkg.name;
                      const isSelected = issueCategory === pkg.code;
                      return (
                        <button
                          key={pkg.code}
                          type="button"
                          onClick={() => setIssueCategory(pkg.code as TriageIssueCategory)}
                          className={`flex flex-col justify-between rounded-xl border px-3.5 py-3 text-start transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'border-[#0057B8] bg-[#0057B8] text-white shadow-sm'
                              : 'border-[#DCE7F2] bg-[#F7FAFC] text-[#041E4A] hover:border-[#00869E]/45 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-semibold leading-snug">{displayLabel}</div>
                          <div
                            className={`mt-1 font-mono text-[11px] tabular-nums ${
                              isSelected ? 'text-[#BAE6FD]' : 'text-slate-500'
                            }`}
                          >
                            {formatCurrencyUsd(pkg.priceUsd)} {planMatch?.unit || pkg.unitLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#041E4A]">
                    {copy.estimatorSection.platformLabel}
                  </label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {TRIAGE_PLATFORMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEstPlatform(p)}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                          estPlatform === p
                            ? 'border-[#041E4A] bg-[#041E4A] text-white'
                            : 'border-[#DCE7F2] bg-[#F7FAFC] text-slate-700 hover:border-[#00869E]/45 hover:bg-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#DCE7F2] pt-5">
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDirectUrl}
                      onChange={(e) => setHasDirectUrl(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0057B8]"
                    />
                    <span>{copy.estimatorSection.urlToggle}</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOwnershipOrId}
                      onChange={(e) => setHasOwnershipOrId(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0057B8]"
                    />
                    <span>{copy.estimatorSection.proofToggle}</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-rose-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeExtortionThreat}
                      onChange={(e) => setActiveExtortionThreat(e.target.checked)}
                      className="h-4 w-4 rounded border-rose-300 text-rose-600"
                    />
                    <span>{copy.estimatorSection.extortionToggle}</span>
                  </label>
                </div>
              </div>

              {/* High-contrast Official Deep Navy Case Readiness Card */}
              <div className="flex flex-col justify-between rounded-2xl bg-[#031738] p-6 sm:p-7 text-white lg:col-span-6">
                <div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="text-xs font-medium text-[#7CE7F5]">
                        {copy.estimatorSection.readinessLabel}
                      </div>
                      <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">
                        {readiness.readinessScore}%
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-xs font-medium text-slate-400">
                        {copy.estimatorSection.slaLabel}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-emerald-400">
                        {readiness.recommendedPackage.slaHours <= 12 || activeExtortionThreat
                          ? copy.estimatorSection.urgentSlaText
                          : copy.estimatorSection.standardSlaText(
                              readiness.recommendedPackage.slaHours
                            )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#00B8D4] transition-all duration-300"
                      style={{ width: `${readiness.readinessScore}%` }}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 border-b border-white/10 pb-5 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-medium text-slate-400">
                        {copy.estimatorSection.suggestedLabel}
                      </div>
                      {(() => {
                        const recPlan = copy.pricingSection.plans.find(
                          (p) => p.code === readiness.recommendedPackage.code
                        );
                        return (
                          <>
                            <div className="mt-1 text-sm font-bold text-white">
                              {recPlan?.name || readiness.recommendedPackage.name}
                            </div>
                            <div className="mt-0.5 font-mono text-base font-bold text-[#7CE7F5] tabular-nums">
                              {formatCurrencyUsd(readiness.recommendedPackage.priceUsd)}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                {recPlan?.unit || readiness.recommendedPackage.unitLabel}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400">
                        {copy.estimatorSection.channelLabel}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-200">
                        {readiness.escalationChannel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-semibold text-slate-300">
                      {copy.estimatorSection.checklistTitle}
                    </div>
                    <ul className="mt-2.5 space-y-2 text-xs text-slate-300">
                      {readiness.checklist.map((line) => (
                        <li key={line} className="flex items-start gap-2.5">
                          <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00C8D7]" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      const recPlanName =
                        copy.pricingSection.plans.find(
                          (p) => p.code === readiness.recommendedPackage.code
                        )?.name || readiness.recommendedPackage.name;
                      prefillInquiry(
                        recPlanName,
                        `Platform: ${estPlatform} · Readiness: ${readiness.readinessScore}% · Direct link: ${hasDirectUrl ? 'Yes' : 'No'}${activeExtortionThreat ? ' · URGENT: Threats or blackmail involved' : ''}.`
                      );
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0066CC] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0057B8] cursor-pointer whitespace-nowrap"
                  >
                    <span>{copy.estimatorSection.useInInquiryCta}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 cursor-pointer whitespace-nowrap"
                  >
                    {copy.estimatorSection.openWorkspaceCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PROCESS & VERIFIED OUTCOMES — Official Deep Brand Navy Contrast Band */}
        <section id="process" className="border-b border-[#0C2D5E] bg-[#031738] py-20 lg:py-24 text-white">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6">
                <p className="text-sm font-semibold text-[#00C8D7]">{copy.processSection.eyebrow}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
                  {copy.processSection.heading}
                </h2>
                <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-slate-300">
                  {copy.processSection.intro}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-xs font-medium text-slate-400">
                  {copy.processSection.platforms.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#07224D]">
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    {!deskImgFailed ? (
                      <img
                        src={VERIFICATION_DESK_IMG}
                        alt="Evidence documentation and verification desk"
                        referrerPolicy="no-referrer"
                        onError={() => setDeskImgFailed(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#07224D]">
                        <Lock className="h-10 w-10 text-[#00C8D7]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {copy.processSection.steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-white/10 bg-[#07224D] p-6"
                >
                  <div className="font-mono text-xs font-bold tabular-nums text-[#00C8D7]">
                    {step.number}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.body}</p>
                </div>
              ))}
            </div>

            {/* Proof Metrics + Platform Channels */}
            <div className="mt-18 border-t border-white/10 pt-16" id="approach">
              <div className="max-w-[660px]">
                <p className="text-sm font-semibold text-[#00C8D7]">
                  {copy.outcomesSection.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white [text-wrap:balance]">
                  {copy.outcomesSection.heading}
                </h2>
                <p className="mt-3 text-base text-slate-300">{copy.outcomesSection.intro}</p>
                {publicMetrics && (
                  <p className="mt-2 text-xs font-medium text-emerald-300 tabular-nums">
                    {copy.outcomesSection.liveActivity(
                      publicMetrics.verifiedRemovals,
                      publicMetrics.resolvedCases,
                      publicMetrics.totalCases
                    )}
                  </p>
                )}
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {copy.outcomesSection.metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-white/10 bg-[#07224D] p-6">
                    <div className="font-display text-2xl font-extrabold tabular-nums text-[#00C8D7]">
                      {m.value}
                    </div>
                    <div className="mt-1.5 text-sm font-bold text-white">{m.label}</div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-12">
                <div className="rounded-2xl border border-white/10 bg-[#07224D] p-6 sm:p-7 lg:col-span-6">
                  <div className="text-sm font-bold text-white">
                    {copy.outcomesSection.channelsTitle}
                  </div>
                  <div className="mt-4 divide-y divide-white/8">
                    {copy.outcomesSection.channels.map((ch) => (
                      <div key={ch.platform} className="py-3.5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{ch.platform}</span>
                          <span className="text-xs font-medium text-[#7CE7F5]">{ch.pathway}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{ch.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
                  {copy.approachSection.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-white/10 bg-[#07224D] p-6"
                    >
                      <h3 className="font-display text-base font-bold text-white">{card.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. TRANSPARENT PRICING — Porcelain Surface */}
        <section id="pricing" className="border-b border-[#DCE7F2] bg-[#F7FAFC] py-20 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="max-w-[700px]">
              <p className="text-sm font-semibold text-[#00758A]">{copy.pricingSection.eyebrow}</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A] sm:text-4xl [text-wrap:balance]">
                {copy.pricingSection.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {copy.pricingSection.intro}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {copy.pricingSection.plans.map((plan) => {
                const pkg = SERVICE_PACKAGES.find((p) => p.code === plan.code);
                const price = pkg ? pkg.priceUsd : 0;
                const featured = Boolean(pkg?.featured);
                return (
                  <article
                    key={plan.code}
                    className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-150 hover:-translate-y-0.5 ${
                      featured
                        ? 'border-[#0057B8] border-t-2 border-t-[#0057B8] bg-white ring-1 ring-[#0057B8]/15 shadow-[0_18px_40px_-20px_rgba(0,87,184,0.24)]'
                        : 'border-[#DCE7F2] bg-white shadow-[0_4px_20px_-14px_rgba(4,30,74,0.08)] hover:border-[#00869E]/45 hover:shadow-[0_14px_30px_-18px_rgba(4,30,74,0.14)]'
                    }`}
                  >
                    <div>
                      {plan.badge && (
                        <div className="mb-1.5 text-xs font-semibold text-[#00758A]">
                          {plan.badge}
                        </div>
                      )}
                      <h3 className="font-display text-lg font-bold leading-snug text-[#041E4A]">
                        {plan.name}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-1.5 border-b border-[#EFF5FA] pb-4">
                        <span className="font-display text-3xl font-extrabold tabular-nums text-[#041E4A]">
                          {formatCurrencyUsd(price)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{plan.unit}</span>
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-slate-600">{plan.desc}</p>
                      <ul className="mt-4 space-y-2.5 text-xs text-slate-700">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00758A]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => prefillInquiry(plan.name)}
                      className={`mt-6 w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                        featured
                          ? 'bg-[#0057B8] text-white hover:bg-[#004494]'
                          : 'border border-[#DCE7F2] bg-[#F7FAFC] text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA]'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="mt-7 max-w-[88ch] text-xs leading-relaxed text-slate-500">
              {copy.pricingSection.footnote}
            </p>
          </div>
        </section>

        {/* 6. SECURITY & TRUST — Pure White Confidence Band */}
        <section
          id="security-trust"
          data-testid="security-trust-section"
          className="border-b border-[#DCE7F2] bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[700px]">
                <p className="text-sm font-semibold text-[#00758A]">
                  {copy.securityTrustSection.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A] sm:text-4xl [text-wrap:balance]">
                  {copy.securityTrustSection.heading}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {copy.securityTrustSection.intro}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/privacy')}
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-2.5 text-xs font-semibold text-[#041E4A] transition-colors duration-150 hover:border-[#0057B8]/40 hover:bg-[#EFF7FC] hover:text-[#0057B8] cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="h-4 w-4 text-[#00758A]" />
                <span>{copy.securityTrustSection.privacyAction}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </button>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {copy.securityTrustSection.items.map((item) => {
                const Icon =
                  item.id === 'encryption'
                    ? Lock
                    : item.id === 'experts'
                      ? UserCheck
                      : ShieldCheck;
                const badgeClass =
                  item.id === 'encryption'
                    ? 'border-[#0057B8]/20 bg-[#EFF7FC] text-[#0057B8]'
                    : item.id === 'experts'
                      ? 'border-[#00869E]/25 bg-[#E6F6F8] text-[#00758A]'
                      : 'border-[#041E4A] bg-[#041E4A] text-[#00C8D7]';

                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-[#F7FAFC] p-6 sm:p-7 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#00869E]/45 hover:bg-white hover:shadow-[0_14px_30px_-18px_rgba(4,30,74,0.16)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${badgeClass}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="text-[11px] font-semibold ltr:font-mono ltr:tracking-wider text-slate-500">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold text-[#041E4A]">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                        {item.body}
                      </p>
                    </div>

                    <div className="mt-6 flex items-start gap-2.5 border-t border-[#DCE7F2] pt-4 text-xs font-medium text-[#041E4A]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00758A]" />
                      <span>{item.proof}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. SUCCESS STORIES CAROUSEL — Cool Mist Band */}
        <section
          id="success-stories"
          data-testid="success-stories-section"
          aria-roledescription="carousel"
          aria-label={copy.successStoriesSection.eyebrow}
          className="border-b border-[#DCE7F2] bg-[#EFF5FA] py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[700px]">
                <p className="text-sm font-semibold text-[#00758A]">
                  {copy.successStoriesSection.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A] sm:text-4xl [text-wrap:balance]">
                  {copy.successStoriesSection.heading}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {copy.successStoriesSection.intro}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  data-testid="stories-prev-btn"
                  onClick={handlePrevStory}
                  aria-label={copy.successStoriesSection.prevLabel}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#C7D7E8] bg-white text-[#041E4A] transition-colors duration-150 hover:border-[#0057B8] hover:bg-[#EFF7FC] hover:text-[#0057B8] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  data-testid="stories-next-btn"
                  onClick={handleNextStory}
                  aria-label={copy.successStoriesSection.nextLabel}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#C7D7E8] bg-white text-[#041E4A] transition-colors duration-150 hover:border-[#0057B8] hover:bg-[#EFF7FC] hover:text-[#0057B8] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeStorySlice.map((story) => (
                <article
                  key={`${story.id}-${safeStoryIndex}`}
                  className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-6 sm:p-7 shadow-[0_12px_28px_-20px_rgba(4,30,74,0.14)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#00869E]/45 hover:shadow-[0_16px_36px_-20px_rgba(4,30,74,0.2)] animate-[frFadeUp_180ms_cubic-bezier(0.16,1,0.3,1)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#EFF5FA] pb-4">
                      <div>
                        <div className="text-xs font-semibold text-[#00758A]">
                          {story.category}
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {story.platform}
                        </div>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0057B8]/20 bg-[#EFF7FC] text-[#0057B8]">
                        <Quote className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </div>

                    <figure className="mt-5">
                      <blockquote className="text-sm leading-relaxed text-[#041E4A] sm:text-[15px]">
                        “{story.quote}”
                      </blockquote>
                      <figcaption className="mt-4 text-xs font-bold text-slate-600">
                        {story.client}
                      </figcaption>
                    </figure>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#EFF5FA] pt-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>{story.outcome}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 ltr:font-mono tabular-nums">
                      {story.turnaround}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div
                data-testid="stories-counter"
                className="text-xs font-medium text-slate-600 tabular-nums"
              >
                {copy.successStoriesSection.showingLabel(
                  safeStoryIndex + 1,
                  Math.min(safeStoryIndex + visibleStories, totalStories),
                  totalStories
                )}
              </div>
              <div className="flex items-center gap-2" role="tablist" aria-label={copy.successStoriesSection.eyebrow}>
                {Array.from({ length: maxStoryStart + 1 }, (_, idx) => {
                  const active = idx === safeStoryIndex;
                  const targetItem = copy.successStoriesSection.items[idx];
                  return (
                    <button
                      key={targetItem.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`${targetItem.category} (${idx + 1}/${maxStoryStart + 1})`}
                      onClick={() => setStoryIndex(idx)}
                      className={`h-2 rounded-sm transition-all duration-150 cursor-pointer ${
                        active
                          ? 'w-8 bg-[#0057B8]'
                          : 'w-4 bg-[#C7D7E8] hover:bg-[#00869E]/60'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ ACCORDION — Crisp White Surface */}
        <section id="faq" className="border-b border-[#DCE7F2] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[920px] px-5 sm:px-8">
            <p className="text-sm font-semibold text-[#00758A]">{copy.faqSection.eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#041E4A]">
              {copy.faqSection.heading}
            </h2>
            <p className="mt-2 text-base text-slate-600">{copy.faqSection.intro}</p>

            <div className="mt-8 divide-y divide-[#DCE7F2] border-y border-[#DCE7F2]">
              {copy.faqSection.items.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-start font-display text-base font-bold text-[#041E4A] hover:text-[#0057B8] cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0057B8]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-5 text-sm leading-relaxed text-slate-600 animate-[frFadeUp_150ms_cubic-bezier(0.16,1,0.3,1)]">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CONVERSION — Confidential Inquiry & Tracker */}
        <section id="contact" className="bg-[#031738] py-20 lg:py-24 text-white">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <p className="text-sm font-semibold text-[#00C8D7]">
                  {copy.contactSection.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white [text-wrap:balance]">
                  {copy.contactSection.heading}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  {copy.contactSection.intro}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#041E4A] transition hover:bg-[#EFF5FA] cursor-pointer whitespace-nowrap"
                  >
                    <span>{copy.nav.getStarted}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>
                  <a
                    href="https://wa.me/9647805586584"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 whitespace-nowrap"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{copy.contactSection.whatsappCta}</span>
                  </a>
                </div>

                {/* Confidential Reference Tracker */}
                <form
                  onSubmit={handleTrackInquiry}
                  className="mt-8 rounded-2xl border border-white/10 bg-[#07224D] p-5 space-y-3"
                >
                  <label
                    htmlFor="inquiry-tracker-input"
                    className="block text-xs font-semibold text-[#7CE7F5]"
                  >
                    {copy.contactSection.tracker.heading}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="inquiry-tracker-input"
                      type="text"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      placeholder={copy.contactSection.tracker.placeholder}
                      dir="ltr"
                      className="flex-1 min-w-0 rounded-xl border border-white/15 bg-[#031738] px-3.5 py-2 font-mono text-xs text-white placeholder-slate-400 outline-none focus:border-[#00B8D4]"
                    />
                    <button
                      type="submit"
                      disabled={trackingBusy}
                      className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 cursor-pointer"
                    >
                      {trackingBusy
                        ? copy.contactSection.tracker.checking
                        : copy.contactSection.tracker.button}
                    </button>
                  </div>
                  {trackError && <p className="text-xs text-amber-300">{trackError}</p>}
                  {trackResult && (
                    <div className="border-t border-white/10 pt-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">
                          {copy.contactSection.tracker.statusLabel}:
                        </span>
                        <span className="font-bold uppercase text-emerald-300">
                          {trackResult.status}
                        </span>
                      </div>
                      <div className="text-slate-300">{trackResult.interest}</div>
                      {trackResult.case_number && (
                        <div className="flex items-center justify-between font-mono pt-1 border-t border-white/10">
                          <span className="text-slate-400">
                            {copy.contactSection.tracker.openedCaseLabel}:
                          </span>
                          <span className="font-bold text-[#7CE7F5]">
                            {trackResult.case_number}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              <form
                onSubmit={handleSubmitInquiry}
                className="rounded-2xl border border-white/10 bg-[#07224D] p-6 sm:p-8 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.45)] lg:col-span-7"
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="inq-name"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      {copy.contactSection.form.nameLabel}
                    </label>
                    <input
                      id="inq-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={copy.contactSection.form.namePlaceholder}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#031738] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#00B8D4] focus:ring-2 focus:ring-[#00B8D4]/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="inq-email"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      {copy.contactSection.form.emailLabel}
                    </label>
                    <input
                      id="inq-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.contactSection.form.emailPlaceholder}
                      dir="ltr"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#031738] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#00B8D4] focus:ring-2 focus:ring-[#00B8D4]/20"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="inq-service"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    {copy.contactSection.form.serviceLabel}
                  </label>
                  <select
                    id="inq-service"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#031738] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#00B8D4] focus:ring-2 focus:ring-[#00B8D4]/20"
                  >
                    <option value="">{copy.contactSection.form.otherOption}</option>
                    {copy.pricingSection.plans.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="inq-message"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    {copy.contactSection.form.messageLabel}
                  </label>
                  <textarea
                    id="inq-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={copy.contactSection.form.messagePlaceholder}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#031738] px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#00B8D4] focus:ring-2 focus:ring-[#00B8D4]/20"
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0066CC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0057B8] disabled:opacity-60 cursor-pointer"
                  >
                    <span>
                      {submitting
                        ? copy.contactSection.form.sendingBtn
                        : copy.contactSection.form.submitBtn}
                    </span>
                  </button>
                </div>

                {inquiryStatus && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
                      inquiryStatus.kind === 'error'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                        : inquiryStatus.kind === 'success'
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/15 bg-white/5 text-slate-200'
                    }`}
                  >
                    <p>{inquiryStatus.text}</p>
                    {inquiryStatus.trackingCode && (
                      <p className="mt-1 font-mono font-semibold text-emerald-300" dir="ltr">
                        {copy.contactSection.referencePrefix}: {inquiryStatus.trackingCode}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-[#0C2D5E] bg-[#02122B] py-14 text-slate-400">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <BrandLogoMark size="md" tone="dark" />
              <p className="mt-3 max-w-[44ch] text-xs leading-relaxed text-slate-400">
                {copy.footer.tagline}
              </p>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                {copy.footer.disclaimer}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">
                {copy.footer.resourcesTitle}
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/verify')}
                    className="hover:text-[#7CE7F5] cursor-pointer"
                  >
                    {copy.footer.verifyLink}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/privacy')}
                    className="hover:text-[#7CE7F5] cursor-pointer"
                  >
                    {copy.footer.privacyLink}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/terms')}
                    className="hover:text-[#7CE7F5] cursor-pointer"
                  >
                    {copy.footer.termsLink}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="hover:text-[#7CE7F5] cursor-pointer"
                  >
                    {copy.nav.getStarted}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300">
                {copy.footer.touchTitle}
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                <li>{copy.footer.whatsappLabel}</li>
                <li>{copy.footer.emailLabel}</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{copy.footer.copyright}</span>
            <span>{copy.footer.motto}</span>
          </div>
        </div>
      </footer>

      <ContactWidget
        lang={lang}
        onJumpToInquiry={() =>
          document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
        }
      />
    </div>
  );
}
