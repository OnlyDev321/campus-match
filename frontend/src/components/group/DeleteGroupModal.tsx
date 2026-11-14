"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, Copy, Check } from "lucide-react";
import { Modal, Button, Input } from "@/design-system";
import { ScrambleText } from "@/design-system/components/ScrambleText";
import { useLanguageStore } from "@/stores/languageStore";
import { toApiErrorCode } from "@/lib/api";
import type { ApiErrorCode, DeleteGroupModalProps } from "@/lib/types";

export default function DeleteGroupModal({
  isOpen,
  onClose,
  groupTitle,
  onDeleteConfirm,
}: DeleteGroupModalProps) {
  const { t } = useLanguageStore();
  const copy = t.manageDetails;

  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const isMatch = confirmInput.trim() === groupTitle.trim();

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(groupTitle.trim());
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDelete = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    setErrorCode(null);
    try {
      await onDeleteConfirm();
      onClose();
    } catch (err: unknown) {
      setErrorCode(toApiErrorCode(err));
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      maxWidth="md"
      className="border border-[var(--error-border)]"
    >
      <div className="space-y-5">
        {/* Modal Header */}
        <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-full bg-[var(--error-bg)] text-[var(--error)] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              <ScrambleText text={copy.deleteModalTitle} />
            </h3>
            <p className="text-xs font-semibold text-[var(--error-text)] mt-0.5">
              <ScrambleText text={copy.deleteModalWarning} />
            </p>
          </div>
        </div>

        {/* Warning Description Callout */}
        <div
          style={{ borderRadius: "var(--radius-input)" }}
          className="p-3.5 bg-[var(--error-bg)] border border-[var(--error-border)] text-xs text-[var(--error-text)] leading-relaxed space-y-1.5"
        >
          <p className="font-medium">
            <ScrambleText text={copy.deleteModalDescription} />
          </p>
        </div>

        {/* Title Verification Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              {copy.deleteModalPrompt.replace("{title}", "")}
            </span>
            <button
              type="button"
              onClick={handleCopyTitle}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3 h-3 text-[var(--success)]" />
                  <span>{copy.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{copy.copy}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-2.5 rounded-[var(--radius-xs)] bg-[var(--surface-container-low)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text-primary)] break-all select-all">
            {groupTitle}
          </div>

          <Input
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={copy.deleteModalInputPlaceholder}
            disabled={isDeleting}
            autoFocus
            aria-label={copy.confirmGroupTitle}
            className="font-mono text-xs"
          />
        </div>

        {errorCode && (
          <p className="text-xs font-medium text-[var(--error-text)] bg-[var(--error-bg)] p-2.5 rounded-[var(--radius-xs)] border border-[var(--error-border)]">
            {t.apiErrors[errorCode]}
          </p>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <ScrambleText text={copy.deleteModalCancelBtn} />
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!isMatch || isDeleting}
            onClick={handleDelete}
            leftIcon={
              isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )
            }
            className={`w-full sm:w-auto font-semibold transition-all ${
              isMatch && !isDeleting
                ? "bg-[var(--error)] text-white hover:bg-[var(--error)]/90 border-transparent shadow-xs cursor-pointer"
                : "opacity-40 cursor-not-allowed bg-[var(--surface-container-high)] text-[var(--text-muted)] border-transparent"
            }`}
          >
            <ScrambleText
              text={isDeleting ? copy.deleting : copy.deleteModalConfirmBtn}
            />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

