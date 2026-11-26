import { useState } from 'react';
import { Check, Copy, Download, Printer, ShieldCheck, X } from 'lucide-react';
import type { LangCode } from '../data/translations';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import {
  buildSingleCaseCertificateData,
  formatTimelineTimestampUtc,
  type ProtectionCase,
} from '../lib/caseLogic';
import { BrandLogoMark } from './BrandLogoMark';

interface PrintableCertificateModalProps {
  caseItem: ProtectionCase;
  lang: LangCode;
  onClose: () => void;
  onDownloadPdf?: (caseItem: ProtectionCase) => void;
}

export function PrintableCertificateModal({
  caseItem,
  lang,
  onClose,
  onDownloadPdf,
}: PrintableCertificateModalProps) {
  const t = PORTAL_TRANSLATIONS[lang];
  const certCopy = t.enhancements.certificate;
  const cert = buildSingleCaseCertificateData(caseItem);
  const [copiedSeal, setCopiedSeal] = useState(false);

  const handleCopySeal = async () => {
    try {
      await navigator.clipboard.writeText(cert.verificationSealCode);
      setCopiedSeal(true);
      setTimeout(() => setCopiedSeal(false), 1800);
    } catch {
      // clipboard blocked fallback ignored cleanly
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-certificate');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-certificate');
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/55 p-4 backdrop-blur-xs"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      data-testid="printable-certificate-modal"
    >
      <div className="max-h-[92vh] w-full max-w-[780px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-[#F7FAFC] shadow-2xl shadow-[#041E4A]/20">
        {/* Top Control Bar */}
        <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F2] bg-white/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00758A]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{certCopy.printableBtn}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySeal}
              data-testid="cert-copy-seal-btn"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
            >
              {copiedSeal ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSeal ? certCopy.sealCopied : certCopy.copySealBtn}</span>
            </button>
            {onDownloadPdf && (
              <button
                type="button"
                onClick={() => onDownloadPdf(caseItem)}
                data-testid="cert-download-pdf-btn"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.common.exportPdf}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              data-testid="cert-print-btn"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0057B8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{certCopy.printNowBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div
          id="printable-certificate-sheet"
          className="m-4 rounded-xl border border-[#DCE7F2] bg-white p-6 text-[#041E4A] shadow-xs sm:m-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#041E4A] pb-5">
            <div>
              <BrandLogoMark size="lg" tone="light" />
              <h2 className="mt-3 font-display text-xl font-bold text-[#041E4A]">
                {certCopy.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{certCopy.subtitle}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-start">
              <div className="text-[10px] font-bold uppercase text-emerald-800">
                {certCopy.sealCodeLabel}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-emerald-950 tabular-nums" dir="ltr">
                {cert.verificationSealCode}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 text-xs sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-500">{certCopy.caseNumber}: </span>
              <span className="font-mono font-bold text-[#041E4A] tabular-nums" dir="ltr">
                {cert.caseNumber}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{certCopy.status}: </span>
              <span className="font-bold text-[#041E4A]">
                {translateStatus(cert.status, lang)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{certCopy.client}: </span>
              <span className="font-semibold text-[#041E4A]" dir="auto">
                {cert.customerName}
              </span>{' '}
              <span className="font-mono text-[11px] text-slate-600" dir="ltr">
                ({cert.customerEmail})
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{certCopy.platform}: </span>
              <span className="font-semibold text-[#041E4A]">{cert.platform}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{certCopy.submitted}: </span>
              <span className="font-mono text-slate-800 tabular-nums" dir="ltr">
                {formatTimelineTimestampUtc(cert.submittedAt)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">{certCopy.updated}: </span>
              <span className="font-mono text-slate-800 tabular-nums" dir="ltr">
                {formatTimelineTimestampUtc(cert.updatedAt)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-slate-500">{certCopy.targetUrl}: </span>
              <span className="break-all font-mono text-[11px] text-[#0057B8]" dir="ltr">
                {cert.sourceUrl}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-slate-500">{certCopy.mirrorSummaryLabel}: </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {t.enhancements.verifyPage.mirrorsCount(
                  cert.mirrorSummary.removed,
                  cert.mirrorSummary.total
                )}
              </span>
            </div>
          </div>

          {/* Filing & Verification */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-900">{certCopy.filingHeader}</h3>
              {cert.latestSubmission ? (
                <div className="mt-2 space-y-1 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900">
                    {cert.latestSubmission.platform} ·{' '}
                    <span className="font-mono" dir="ltr">
                      {cert.latestSubmission.externalRef}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 tabular-nums" dir="ltr">
                    {formatTimelineTimestampUtc(cert.latestSubmission.submittedAt)}
                  </div>
                  <p dir="auto">{cert.latestSubmission.summary}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{certCopy.noFiling}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-900">{certCopy.verificationHeader}</h3>
              {cert.latestVerification ? (
                <div className="mt-2 space-y-1 text-xs text-slate-700">
                  <div className="font-bold text-emerald-700">
                    {translateStatus(cert.latestVerification.result, lang)}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 tabular-nums" dir="ltr">
                    {formatTimelineTimestampUtc(cert.latestVerification.checkedAt)}
                  </div>
                  {cert.latestVerification.notes && (
                    <p dir="auto" className="text-slate-600">
                      {cert.latestVerification.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{certCopy.noVerification}</p>
              )}
            </div>
          </div>

          {/* Evidence Inventory */}
          <div className="mt-5 rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-900">{certCopy.evidenceHeader}</h3>
            {cert.evidenceHashes.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">{certCopy.noEvidence}</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                {cert.evidenceHashes.map((ev, idx) => (
                  <li key={`${ev.sha256}-${idx}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1 last:border-b-0">
                    <span dir="auto" className="font-medium text-slate-900">
                      {ev.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums" dir="ltr">
                      SHA256:{ev.sha256}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            <span>{certCopy.verifyOnlineHint}</span>
            <span className="font-mono" dir="ltr">
              {cert.verificationSealCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
