import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Briefcase, Compass, Search, X } from 'lucide-react';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';

export interface QuickJumpSectionItem {
  id: string;
  label: string;
  onSelect: () => void;
}

export interface QuickJumpCaseItem {
  id: string;
  case_number: string;
  title: string;
  platform: string;
  status: string;
  onSelect: () => void;
}

interface QuickJumpModalProps {
  open: boolean;
  onClose: () => void;
  lang: LangCode;
  sections: QuickJumpSectionItem[];
  cases: QuickJumpCaseItem[];
}

export function QuickJumpModal({ open, onClose, lang, sections, cases }: QuickJumpModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = PORTAL_TRANSLATIONS[lang];
  const q = t.enhancements.quickJump;

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matchedSections = sections.filter(
      (s) => !needle || s.label.toLowerCase().includes(needle)
    );
    const matchedCases = cases
      .filter(
        (c) =>
          !needle ||
          c.case_number.toLowerCase().includes(needle) ||
          c.title.toLowerCase().includes(needle) ||
          c.platform.toLowerCase().includes(needle) ||
          c.status.toLowerCase().includes(needle)
      )
      .slice(0, 8);
    return { matchedSections, matchedCases };
  }, [query, sections, cases]);

  const flatItems = useMemo(
    () => [
      ...filtered.matchedSections.map((s) => ({ kind: 'section' as const, item: s })),
      ...filtered.matchedCases.map((c) => ({ kind: 'case' as const, item: c })),
    ],
    [filtered]
  );

  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, flatItems.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' && flatItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp' && flatItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault();
        flatItems[activeIndex].item.onSelect();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, flatItems, activeIndex, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#041E4A]/45 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={q.title}
      data-testid="quick-jump-modal"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-[#DCE7F2] bg-white shadow-2xl shadow-[#041E4A]/18"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#DCE7F2] px-4 py-3.5">
          <Search className="h-4 w-4 text-[#0057B8] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={q.placeholder}
            data-testid="quick-jump-input"
            className="w-full bg-transparent text-sm text-[#041E4A] placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-lg border border-[#DCE7F2] p-1 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-3 space-y-4">
          {flatItems.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">{q.empty}</p>
          ) : (
            <>
              {filtered.matchedSections.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-500">
                    {q.sectionsLabel}
                  </div>
                  <div className="space-y-1">
                    {filtered.matchedSections.map((sec, idx) => {
                      const isActive = activeIndex === idx;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            sec.onSelect();
                            onClose();
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                            isActive
                              ? 'bg-[#EFF7FC] text-[#041E4A] border border-[#0057B8]/25'
                              : 'text-slate-700 hover:bg-[#F7FAFC] border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Compass className="h-3.5 w-3.5 text-[#0057B8] shrink-0" />
                            <span className="truncate font-medium">{sec.label}</span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filtered.matchedCases.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-500">
                    {q.casesLabel}
                  </div>
                  <div className="space-y-1">
                    {filtered.matchedCases.map((c, idx) => {
                      const globalIdx = filtered.matchedSections.length + idx;
                      const isActive = activeIndex === globalIdx;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          onClick={() => {
                            c.onSelect();
                            onClose();
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition cursor-pointer ${
                            isActive
                              ? 'bg-[#EFF7FC] text-[#041E4A] border border-[#0057B8]/25'
                              : 'text-slate-700 hover:bg-[#F7FAFC] border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Briefcase className="h-3.5 w-3.5 text-[#00758A] shrink-0" />
                            <span className="font-mono font-semibold text-[#0057B8] shrink-0" dir="ltr">
                              {c.case_number}
                            </span>
                            <span className="text-slate-300 shrink-0">·</span>
                            <span className="truncate font-medium text-[#041E4A]" dir="auto">
                              {c.title}
                            </span>
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-500">
                            {translateStatus(c.status, lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-[#EFF5FA] bg-[#F7FAFC] px-4 py-2 text-[11px] text-slate-500">
          {q.hint}
        </div>
      </div>
    </div>
  );
}
