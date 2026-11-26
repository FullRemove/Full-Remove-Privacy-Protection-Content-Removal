import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PORTAL_TRANSLATIONS, translateStatus } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import {
  classifyPreviewFileKind,
  decodeBase64ToUtf8Preview,
  formatFileSizeLabel,
  type EvidenceCategory,
} from '../lib/caseLogic';

export interface StagedEvidencePreviewFile {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  base64Content: string;
  title?: string;
  category?: string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  file: StagedEvidencePreviewFile | null;
  onClose: () => void;
  onRemoveFile?: () => void;
  onConfirmSubmit?: () => void;
  canSubmitDirectly?: boolean;
  lang?: LangCode;
}

export function FilePreviewModal({
  isOpen,
  file,
  onClose,
  onRemoveFile,
  onConfirmSubmit,
  canSubmitDirectly = false,
  lang = 'en',
}: FilePreviewModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const t = PORTAL_TRANSLATIONS[lang];

  const kind = useMemo(
    () => (file ? classifyPreviewFileKind(file.mimeType, file.fileName) : 'unsupported'),
    [file]
  );

  const pdfBlobUrl = useMemo(() => {
    if (!isOpen || !file || kind !== 'pdf' || !file.base64Content) return null;
    try {
      const binary = atob(file.base64Content);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, [isOpen, file, kind]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    setZoomed(false);
  }, [file?.fileName, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const textPreview = useMemo(() => {
    if (!isOpen || !file || kind !== 'text') return null;
    const raw = decodeBase64ToUtf8Preview(file.base64Content);
    if (
      (file.mimeType === 'application/json' || file.fileName.toLowerCase().endsWith('.json')) &&
      !raw.truncated
    ) {
      try {
        const parsed = JSON.parse(raw.text);
        return { text: JSON.stringify(parsed, null, 2), truncated: false };
      } catch {
        return raw;
      }
    }
    return raw;
  }, [isOpen, file, kind]);

  if (!isOpen || !file) return null;

  const imageDataUrl =
    kind === 'image'
      ? `data:${file.mimeType || 'image/png'};base64,${file.base64Content}`
      : '';

  const categoryLabel = file.category
    ? t.workspace.caseModal.evCategories[file.category as EvidenceCategory] ||
      translateStatus(file.category, lang)
    : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041E4A]/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t.workspace.previewModal.eyebrow}
      data-testid="evidence-file-preview-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-[#DCE7F2] bg-white shadow-2xl shadow-[#041E4A]/20">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#DCE7F2] px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#00758A]">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>{t.workspace.previewModal.eyebrow}</span>
              {categoryLabel && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{categoryLabel}</span>
                </>
              )}
            </div>
            <h3 className="mt-1 truncate font-display text-base font-bold text-[#041E4A]">
              {file.title?.trim() || file.fileName}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
              <span className="truncate" dir="ltr">
                {file.fileName}
              </span>
              <span className="text-slate-300">·</span>
              <span dir="ltr">{file.mimeType || 'application/octet-stream'}</span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums font-medium text-emerald-700" dir="ltr">
                {formatFileSizeLabel(file.fileSizeBytes)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {kind === 'image' && (
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-medium text-[#041E4A] hover:border-[#00869E]/45 hover:bg-[#EFF5FA] cursor-pointer"
              >
                {zoomed ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
                <span>
                  {zoomed ? t.workspace.previewModal.fitView : t.workspace.previewModal.fullSize}
                </span>
              </button>
            )}
            <button
              type="button"
              aria-label={t.workspace.previewModal.closePreview}
              onClick={onClose}
              className="rounded-lg border border-[#DCE7F2] p-1.5 text-slate-500 hover:bg-[#EFF5FA] hover:text-[#041E4A] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport Body */}
        <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-5">
          {kind === 'image' && (
            <div className="flex min-h-[260px] max-h-[58vh] items-center justify-center overflow-auto rounded-xl border border-[#DCE7F2] bg-[#031738] p-4">
              <img
                src={imageDataUrl}
                alt={file.fileName}
                className={
                  zoomed
                    ? 'max-w-none rounded-lg'
                    : 'max-h-[52vh] max-w-full rounded-lg object-contain'
                }
              />
            </div>
          )}

          {kind === 'pdf' && (
            <div className="space-y-3">
              {pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  title={file.fileName}
                  className="h-[56vh] w-full rounded-xl border border-[#DCE7F2] bg-white"
                />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  {t.workspace.previewModal.unsupportedBody(file.fileName, file.mimeType || 'PDF')}
                </div>
              )}
            </div>
          )}

          {kind === 'text' && textPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-[#0057B8]" />
                  <span>{t.workspace.previewModal.textContentLabel}</span>
                </span>
                {textPreview.truncated && (
                  <span className="font-medium text-amber-700">{t.workspace.previewModal.truncatedNotice}</span>
                )}
              </div>
              <pre
                data-testid="file-preview-text-content"
                dir="ltr"
                className="max-h-[54vh] overflow-auto rounded-xl border border-[#DCE7F2] bg-white p-4 font-mono text-xs leading-relaxed text-[#041E4A] whitespace-pre-wrap break-words text-start"
              >
                {textPreview.text || t.workspace.previewModal.emptyText}
              </pre>
            </div>
          )}

          {kind === 'unsupported' && (
            <div
              data-testid="file-preview-unsupported"
              className="flex flex-col items-center justify-center rounded-xl border border-[#DCE7F2] bg-white p-8 text-center"
            >
              <ImageIcon className="h-8 w-8 text-slate-400" />
              <div className="mt-3 text-sm font-semibold text-[#041E4A]">
                {t.workspace.previewModal.unsupportedTitle}
              </div>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                {t.workspace.previewModal.unsupportedBody(
                  file.fileName,
                  file.mimeType || 'binary'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7F2] bg-white px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{t.workspace.previewModal.securityNote}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRemoveFile && (
              <button
                type="button"
                onClick={onRemoveFile}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.workspace.previewModal.removeFile}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#DCE7F2] px-3.5 py-1.5 text-xs font-semibold text-[#041E4A] hover:bg-[#EFF5FA] cursor-pointer"
            >
              {t.workspace.previewModal.closePreview}
            </button>

            {canSubmitDirectly && onConfirmSubmit && (
              <button
                type="button"
                onClick={onConfirmSubmit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0057B8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#004494] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{t.workspace.previewModal.confirmSave}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
