import { useRef, useState, type DragEvent } from 'react';
import { Eye, FileImage, FileText, UploadCloud, X } from 'lucide-react';
import { PORTAL_TRANSLATIONS } from '../data/portalTranslations';
import type { LangCode } from '../data/translations';
import { formatFileSizeLabel, validateEvidenceUploadFile } from '../lib/caseLogic';

export interface StagedEvidenceUploadFile {
  name: string;
  size: number;
  base64: string;
  mimeType: string;
  kind: 'pdf' | 'image';
}

interface EvidenceDropZoneProps {
  lang: LangCode;
  testId: string;
  stagedFile: StagedEvidenceUploadFile | null;
  errorText?: string | null;
  disabled?: boolean;
  onFileAccepted: (file: StagedEvidenceUploadFile) => void;
  onError: (message: string) => void;
  onClear: () => void;
  onPreview?: () => void;
}

export function EvidenceDropZone({
  lang,
  testId,
  stagedFile,
  errorText,
  disabled = false,
  onFileAccepted,
  onError,
  onClear,
  onPreview,
}: EvidenceDropZoneProps) {
  const t = PORTAL_TRANSLATIONS[lang];
  const copy = t.enhancements.evidenceDropZone;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const processSelectedFile = (file: File | null | undefined) => {
    if (!file || disabled) return;
    const validation = validateEvidenceUploadFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.ok) {
      if (inputRef.current) inputRef.current.value = '';
      onError(
        validation.reason === 'file_too_large'
          ? copy.fileTooLargeError
          : copy.unsupportedTypeError
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      onFileAccepted({
        name: file.name,
        size: file.size,
        base64,
        mimeType: validation.normalizedMime,
        kind: validation.kind,
      });
    };
    reader.onerror = () => {
      onError(copy.unsupportedTypeError);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer?.files?.[0] || null;
    processSelectedFile(droppedFile);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  };

  return (
    <div className="space-y-2">
      <div
        data-testid={testId}
        data-dragging={isDragging ? 'true' : 'false'}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
          disabled
            ? 'border-[#DCE7F2] bg-slate-50 opacity-60'
            : isDragging
              ? 'border-[#0057B8] bg-[#EFF7FC]'
              : errorText
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-[#C7D7E8] bg-white hover:border-[#0057B8]/60 hover:bg-[#F7FAFC]'
        }`}
      >
        <input
          ref={inputRef}
          data-testid={`${testId}-input`}
          type="file"
          disabled={disabled}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => processSelectedFile(e.target.files?.[0])}
          className="sr-only"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center py-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              isDragging
                ? 'border-[#0057B8]/30 bg-white text-[#0057B8]'
                : 'border-[#DCE7F2] bg-[#F7FAFC] text-[#0057B8]'
            }`}
          >
            <UploadCloud className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#041E4A]">
              {isDragging ? copy.draggingHint : copy.dropPrompt}
            </p>
            <p className="text-[11px] text-slate-500">{copy.acceptedFormatsHint}</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            data-testid={`${testId}-browse-btn`}
            onClick={() => inputRef.current?.click()}
            className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F2] bg-[#F7FAFC] px-3 py-1.5 text-xs font-semibold text-[#0057B8] hover:border-[#0057B8]/35 hover:bg-[#EFF7FC] disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{copy.browseBtn}</span>
          </button>
        </div>
      </div>

      {errorText && (
        <div
          role="alert"
          data-testid={`${testId}-error`}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800"
        >
          {errorText}
        </div>
      )}

      {stagedFile && (
        <div
          data-testid={`${testId}-staged`}
          className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700">
              {stagedFile.kind === 'pdf' ? (
                <FileText className="h-3.5 w-3.5" />
              ) : (
                <FileImage className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-emerald-950" dir="ltr">
                {stagedFile.name}
              </div>
              <div className="text-[11px] text-emerald-800">
                {copy.stagedReady} ·{' '}
                <span className="font-mono tabular-nums" dir="ltr">
                  {formatFileSizeLabel(stagedFile.size)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onPreview && (
              <button
                type="button"
                data-testid={`${testId}-preview-btn`}
                onClick={onPreview}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0057B8]/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0057B8] hover:bg-[#EFF7FC] cursor-pointer"
              >
                <Eye className="h-3 w-3" />
                <span>{t.workspace.caseModal.previewFile}</span>
              </button>
            )}
            <button
              type="button"
              data-testid={`${testId}-clear-btn`}
              onClick={handleClear}
              aria-label={t.common.clear}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>{t.common.clear}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
