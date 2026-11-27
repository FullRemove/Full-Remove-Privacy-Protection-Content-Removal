import { useEffect, useState } from 'react';
import { Check, Copy, Download, FileCheck2, Printer, ShieldCheck, X } from 'lucide-react';
import type { LangCode } from '../data/translations';
import { PORTAL_TRANSLATIONS, translateRole, translateStatus } from '../data/portalTranslations';
import {
  buildCaseEvidencePrintReport,
  formatTimelineTimestampUtc,
  type EvidenceCategory,
  type ProtectionCase,
} from '../lib/caseLogic';
import { BrandLogoMark } from './BrandLogoMark';

interface PrintableCertificateModalProps {
  caseItem?: ProtectionCase;
  cases?: ProtectionCase[];
  user?: { name?: string; email?: string };
  lang: LangCode;
  onClose: () => void;
  onDownloadPdf?: (caseItem: ProtectionCase) => void;
}

export function triggerCertificatePrint(): () => void {
  document.body.classList.add('printing-certificate');
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove('printing-certificate');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  const fallbackTimer = window.setTimeout(cleanup, 1200);
  window.print();
  return () => {
    window.clearTimeout(fallbackTimer);
    cleanup();
  };
}

export function PrintableCertificateModal({
  caseItem,
  cases,
  user,
  lang,
  onClose,
  onDownloadPdf,
}: PrintableCertificateModalProps) {
  const t = PORTAL_TRANSLATIONS[lang];
  const certCopy = t.enhancements.certificate;
  const targetCases = cases && cases.length > 0 ? cases : caseItem ? [caseItem] : [];
  const report = buildCaseEvidencePrintReport(targetCases, user);
  const primarySection = report.sections[0];
  const primaryCert = primarySection?.certificate;
  const [copiedSeal, setCopiedSeal] = useState(false);

  useEffect(() => {
    return () => {
      document.body.classList.remove('printing-certificate');
    };
  }, []);

  if (!primaryCert) return null;

  const handleCopySeal = async () => {
    try {
      await navigator.clipboard.writeText(primaryCert.verificationSealCode);
      setCopiedSeal(true);
      setTimeout(() => setCopiedSeal(false), 1800);
    } catch {
      // clipboard blocked fallback ignored cleanly
    }
  };

  const handlePrint = () => {
    triggerCertificatePrint();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#041E4A]/55 p-4 backdrop-blur-xs print:static print:block print:bg-transparent print:p-0 print:backdrop-blur-none"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      role="dialog"
      aria-modal="true"
      aria-label={report.isMultiCase ? certCopy.workspaceReportTitle : certCopy.evidenceReportTitle}
      data-testid="printable-certificate-modal"
    >
      <div className="max-h-[92vh] w-full max-w-[840px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-[#F7FAFC] shadow-2xl shadow-[#041E4A]/20 print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-none print:bg-transparent print:shadow-none">
        {/* Top Control Bar (hidden on print via .no-print) */}
        <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F2] bg-white/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00758A]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              {report.isMultiCase ? certCopy.workspaceReportTitle : certCopy.evidenceReportTitle}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!report.isMultiCase && (
              <button
                type="button"
                onClick={handleCopySeal}
                data-testid="cert-copy-seal-btn"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
              >
                {copiedSeal ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedSeal ? certCopy.sealCopied : certCopy.copySealBtn}</span>
              </button>
            )}
            {onDownloadPdf && !report.isMultiCase && targetCases[0] && (
              <button
                type="button"
                onClick={() => onDownloadPdf(targetCases[0])}
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
              <span>{certCopy.downloadReportBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              data-testid="cert-close-btn"
              className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div
          id="printable-certificate-sheet"
          className="m-4 rounded-xl border border-[#DCE7F2] bg-white p-6 text-[#041E4A] shadow-xs sm:m-6 sm:p-8 print:m-0 print:rounded-none print:border-none print:p-0 print:shadow-none"
        >
          {/* Document Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#041E4A] pb-5">
            <div>
              <BrandLogoMark size="lg" tone="light" />
              <h2 className="mt-3 font-display text-xl font-bold text-[#041E4A]">
                {report.isMultiCase ? certCopy.workspaceReportTitle : certCopy.evidenceReportTitle}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {certCopy.subtitle} · {certCopy.generatedAt}:{' '}
                <span className="font-mono tabular-nums" dir="ltr">
                  {formatTimelineTimestampUtc(report.generatedAt)}
                </span>
              </p>
            </div>

            {!report.isMultiCase ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-start">
                <div className="text-[11px] font-semibold text-emerald-800">
                  {certCopy.sealCodeLabel}
                </div>
                <div className="mt-0.5 font-mono text-sm font-bold text-emerald-950 tabular-nums" dir="ltr">
                  {primaryCert.verificationSealCode}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] px-4 py-2.5 text-start">
                <div className="text-[11px] font-semibold text-[#00758A]">
                  {report.accountName}
                </div>
                <div className="mt-0.5 font-mono text-xs font-bold text-[#041E4A] tabular-nums">
                  {certCopy.casesCountLabel(report.totalCases)} ·{' '}
                  {certCopy.evidenceCountLabel(report.totalEvidenceItems)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-8">
            {report.sections.map((section, sectionIdx) => {
              const cert = section.certificate;
              return (
                <article
                  key={cert.caseNumber}
                  className={sectionIdx > 0 ? 'border-t-2 border-[#DCE7F2] pt-6' : ''}
                >
                  {report.isMultiCase && (
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#041E4A]">
                        <span className="font-mono text-[#0057B8] me-2" dir="ltr">
                          {cert.caseNumber}
                        </span>
                        {cert.title}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-emerald-800" dir="ltr">
                        {cert.verificationSealCode}
                      </span>
                    </div>
                  )}

                  {/* Case Metadata Grid */}
                  <div className="print-avoid-break grid gap-3 rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-4 text-xs sm:grid-cols-2">
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
                    {section.description && (
                      <div className="sm:col-span-2 border-t border-[#DCE7F2] pt-2.5 text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-500">{certCopy.caseDescription}: </span>
                        <span dir="auto">{section.description}</span>
                      </div>
                    )}
                  </div>

                  {/* Filing & Verification */}
                  <div className="print-avoid-break mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="text-xs font-bold text-slate-900">{certCopy.filingHeader}</h4>
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
                      <h4 className="text-xs font-bold text-slate-900">{certCopy.verificationHeader}</h4>
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

                  {/* Detailed Forensic Evidence Table */}
                  <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#F7FAFC] px-4 py-2.5">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#041E4A]">
                        <FileCheck2 className="h-3.5 w-3.5 text-[#0057B8] shrink-0" />
                        <span>{certCopy.evidenceHeader}</span>
                      </h4>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
                        {certCopy.evidenceCountLabel(section.evidenceItems.length)}
                      </span>
                    </div>

                    {section.evidenceItems.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500">{certCopy.noEvidence}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                              <th className="px-4 py-2.5 text-start">{certCopy.evidenceColItem}</th>
                              <th className="px-4 py-2.5 text-start">{certCopy.evidenceColCategory}</th>
                              <th className="px-4 py-2.5 text-start">{certCopy.evidenceColIntegrity}</th>
                              <th className="px-4 py-2.5 text-end">{certCopy.evidenceColRecorded}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {section.evidenceItems.map((ev, idx) => (
                              <tr key={ev.id} className="print-avoid-break align-top">
                                <td className="px-4 py-3 space-y-1">
                                  <div className="font-semibold text-[#041E4A]" dir="auto">
                                    <span className="font-mono text-[11px] text-slate-400 me-1.5" dir="ltr">
                                      {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                    {ev.title}
                                  </div>
                                  {ev.fileName && (
                                    <div className="font-mono text-[11px] text-slate-600" dir="ltr">
                                      {ev.fileName}
                                    </div>
                                  )}
                                  {ev.referenceUrl && (
                                    <div className="break-all font-mono text-[11px] text-[#0057B8]" dir="ltr">
                                      {ev.referenceUrl}
                                    </div>
                                  )}
                                  {ev.notes && (
                                    <p className="text-[11px] leading-relaxed text-slate-600" dir="auto">
                                      {ev.notes}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                  {t.workspace.caseModal.evCategories[ev.category as EvidenceCategory] ||
                                    translateStatus(ev.category, lang)}
                                </td>
                                <td className="px-4 py-3 space-y-0.5">
                                  <div className="font-mono text-[11px] font-semibold text-emerald-700" dir="ltr">
                                    SHA256:{ev.sha256}
                                  </div>
                                  <div className="font-mono text-[11px] text-[#0057B8]">
                                    {ev.encryptedVault
                                      ? certCopy.encryptedVaultLabel
                                      : certCopy.metadataOnlyLabel}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-end space-y-0.5 whitespace-nowrap">
                                  <div className="font-mono text-[11px] text-slate-700 tabular-nums" dir="ltr">
                                    {formatTimelineTimestampUtc(ev.createdAt)}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {translateRole(ev.uploadedByRole, lang)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            <span>{certCopy.verifyOnlineHint}</span>
            <span className="font-mono" dir="ltr">
              {primaryCert.verificationSealCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
