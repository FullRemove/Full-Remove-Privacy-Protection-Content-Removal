import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, FileText, Send, X } from 'lucide-react';
import { PORTAL_TRANSLATIONS } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { generateTakedownNoticePacket, type ProtectionCase } from '../lib/caseLogic';

interface TakedownNoticeModalProps {
  caseItem: ProtectionCase;
  organizationName?: string;
  onClose: () => void;
  onRecordSubmission?: (payload: {
    platform: string;
    submission_channel: 'platform_portal' | 'web_form' | 'email';
    external_reference: string;
    response_summary: string;
  }) => Promise<void>;
  lang?: LangCode;
}

type TargetChannel = 'platform_rights' | 'registrar_whois' | 'search_deindex' | 'publisher_legal';

export function TakedownNoticeModal({
  caseItem,
  organizationName,
  onClose,
  onRecordSubmission,
  lang = 'en',
}: TakedownNoticeModalProps) {
  const [channel, setChannel] = useState<TargetChannel>('platform_rights');
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [externalRef, setExternalRef] = useState(`LEGAL-${caseItem.case_number.replace('FR-', '')}`);

  const t = PORTAL_TRANSLATIONS[lang];

  const packet = useMemo(
    () =>
      generateTakedownNoticePacket({
        caseItem,
        customerName: caseItem.customer_name,
        customerEmail: caseItem.customer_email,
        organizationName: organizationName || caseItem.customer_name,
        targetChannel: channel,
      }),
    [caseItem, organizationName, channel]
  );

  const [draftBody, setDraftBody] = useState(packet.body);

  useEffect(() => {
    setDraftBody(packet.body);
  }, [packet.body]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${packet.subject}\n\n${draftBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleDownloadTxt = () => {
    const content = `SUBJECT: ${packet.subject}\nCHANNEL: ${packet.channelHint}\n\n${draftBody}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseItem.case_number}-takedown-notice.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRecordSubmission = async () => {
    if (!onRecordSubmission) return;
    setRecording(true);
    try {
      const submissionChannel =
        channel === 'registrar_whois' || channel === 'publisher_legal' ? 'email' : 'platform_portal';
      await onRecordSubmission({
        platform: caseItem.platform,
        submission_channel: submissionChannel,
        external_reference: externalRef.trim() || `LEGAL-${caseItem.case_number}`,
        response_summary: `Prepared and dispatched formal notice (${packet.channelHint}).`,
      });
      onClose();
    } finally {
      setRecording(false);
    }
  };

  const channelTabs: { id: TargetChannel; label: string }[] = [
    { id: 'platform_rights', label: t.staff.noticeModal.channels.platform_rights },
    { id: 'registrar_whois', label: t.staff.noticeModal.channels.registrar_whois },
    { id: 'search_deindex', label: t.staff.noticeModal.channels.search_deindex },
    { id: 'publisher_legal', label: t.staff.noticeModal.channels.publisher_legal },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041E4A]/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t.staff.noticeModal.eyebrow}
    >
      <div className="max-h-[92vh] w-full max-w-[780px] overflow-y-auto rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-2xl shadow-[#041E4A]/20 space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-[#DCE7F2] pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#00758A]">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>{t.staff.noticeModal.eyebrow}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[#0057B8]" dir="ltr">
                {caseItem.case_number}
              </span>
            </div>
            <h2 className="mt-1 font-display text-lg font-bold text-[#041E4A]" dir="ltr">
              {packet.subject}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.staff.noticeModal.recipientDesk}{' '}
              <span className="font-medium text-[#041E4A]" dir="ltr">
                {packet.channelHint}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {channelTabs.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setChannel(ch.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                channel === ch.id
                  ? 'border-[#0057B8] bg-[#EFF7FC] text-[#0057B8]'
                  : 'border-[#DCE7F2] bg-[#F7FAFC] text-slate-600 hover:border-[#00869E]/45 hover:text-[#041E4A]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="takedown-notice-body"
            className="block text-xs font-semibold text-slate-700"
          >
            {t.staff.noticeModal.packetLabel}
          </label>
          <textarea
            id="takedown-notice-body"
            rows={14}
            dir="ltr"
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#DCE7F2] bg-[#F7FAFC] p-3.5 font-mono text-xs leading-relaxed text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white text-start"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7F2] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {copied ? t.staff.noticeModal.copiedBtn : t.staff.noticeModal.copyBtn}
              </span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3.5 py-2 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.staff.noticeModal.downloadTxt}</span>
            </button>
          </div>

          {onRecordSubmission && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                dir="ltr"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                aria-label={t.staff.noticeModal.refPlaceholder}
                placeholder={t.staff.noticeModal.refPlaceholder}
                className="w-40 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-2 font-mono text-xs text-[#041E4A] outline-none focus:border-[#0057B8] focus:bg-white"
              />
              <button
                type="button"
                disabled={recording}
                onClick={handleRecordSubmission}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {recording
                    ? t.staff.noticeModal.recordingBtn
                    : t.staff.noticeModal.recordBtn}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
