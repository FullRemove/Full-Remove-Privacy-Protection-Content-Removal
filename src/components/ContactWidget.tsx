import { useState } from 'react';
import { Mail, MessageSquare, PhoneCall, Send, X } from 'lucide-react';
import { SITE_TRANSLATIONS, type LangCode } from '../data/translations';

interface ContactWidgetProps {
  lang: LangCode;
  onJumpToInquiry: () => void;
}

export function ContactWidget({ lang, onJumpToInquiry }: ContactWidgetProps) {
  const [open, setOpen] = useState(false);
  const copy = SITE_TRANSLATIONS[lang];

  return (
    <div className="fixed bottom-5 end-5 z-40 no-print">
      {open && (
        <div
          className="mb-3 w-[320px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[#DCE7F2] bg-white p-5 text-[#041E4A] shadow-[0_24px_48px_-16px_rgba(4,30,74,0.22)] animate-[frFadeUp_160ms_cubic-bezier(0.16,1,0.3,1)]"
          role="dialog"
          aria-label={copy.widget.title}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="font-display text-sm font-bold text-[#041E4A]">{copy.widget.title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{copy.widget.intro}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
              aria-label="Close contact menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            <a
              href="https://wa.me/9647805586584"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F7FAFC] px-3.5 py-2.5 text-[#041E4A] transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">{copy.widget.waTitle}</div>
                <div className="truncate text-[11px] text-slate-500">{copy.widget.waSub}</div>
              </div>
            </a>

            <a
              href="tel:+9647805586584"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F7FAFC] px-3.5 py-2.5 text-[#041E4A] transition-colors duration-150 hover:border-[#00758A]/40 hover:bg-[#EFF7FC]"
            >
              <PhoneCall className="h-4 w-4 shrink-0 text-[#00758A]" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">{copy.widget.callTitle}</div>
                <div className="truncate text-[11px] text-slate-500">{copy.widget.callSub}</div>
              </div>
            </a>

            <a
              href="mailto:contact@fremove.com"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F7FAFC] px-3.5 py-2.5 text-[#041E4A] transition-colors duration-150 hover:border-[#0057B8]/35 hover:bg-[#EFF5FA]"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#0057B8]" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">{copy.widget.emailTitle}</div>
                <div className="truncate text-[11px] text-slate-500">{copy.widget.emailSub}</div>
              </div>
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onJumpToInquiry();
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-[#0057B8] px-3.5 py-2.5 text-start text-white transition-colors duration-150 hover:bg-[#004494] cursor-pointer"
            >
              <Send className="h-4 w-4 shrink-0 text-[#99ECFA]" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">{copy.widget.inquiryTitle}</div>
                <div className="truncate text-[11px] text-sky-100/90">{copy.widget.inquirySub}</div>
              </div>
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{copy.widget.foot}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#072B66] bg-[#041E4A] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_28px_-10px_rgba(4,30,74,0.45)] transition-colors duration-150 hover:bg-[#072963] cursor-pointer"
      >
        <MessageSquare className="h-4 w-4 text-[#00B8D4]" />
        <span>{copy.widget.launch}</span>
      </button>
    </div>
  );
}
