"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Globe, RefreshCw, Undo2, Sparkles } from "lucide-react";
import type { TranslateButtonProps, TranslationErrorCode } from "@/lib/types";

import { translateGroupContent, TranslationError } from "@/services/translationService";

export default function TranslateButton({
  originalContent,
  isTranslated,
  onTranslated,
  className = "",
}: TranslateButtonProps) {
  const { language, t } = useLanguageStore();
  const [errorCode, setErrorCode] = useState<TranslationErrorCode | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  const errorMessages: Record<TranslationErrorCode, string> = {
    TRANSLATION_NOT_CONFIGURED: t.translate.notConfigured,
    TRANSLATION_CREDITS_EXHAUSTED: t.translate.creditsExhausted,
    TRANSLATION_ACCESS_DENIED: t.translate.accessDenied,
    TRANSLATION_BUSY: t.translate.busy,
    TRANSLATION_RATE_LIMITED: t.translate.rateLimited,
    TRANSLATION_FAILED: t.translate.failed,
  };

  const handleTranslate = async () => {
    setErrorCode(null);
    // Nếu đã dịch rồi, bấm lần nữa để quay lại bản gốc
    if (isTranslated) {
      onTranslated(null);
      return;
    }

    setIsTranslating(true);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const translated = await translateGroupContent(originalContent, language, controller.signal);
      if (controller.signal.aborted) return;
      onTranslated(translated);
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorCode(error instanceof TranslationError ? error.code : "TRANSLATION_FAILED");
    } finally {
      if (!controller.signal.aborted) setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={isTranslating}
        className={`inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium cursor-pointer transition-opacity disabled:opacity-50 ${className}`}
      >
        {isTranslating ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin text-[var(--primary)]" />
            <span><ScrambleText text={t.translate.translating} /></span>
          </>
        ) : isTranslated ? (
          <>
            <Undo2 className="w-3 h-3" />
            <span><ScrambleText text={t.translate.showOriginal} /></span>
            <span className="text-[10px] text-[var(--text-faint)] flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-[var(--primary)]" /> {t.translate.provider}
            </span>
          </>
        ) : (
          <>
            <Globe className="w-3 h-3" />
            <span><ScrambleText text={t.translate.btn} /></span>
          </>
        )}
      </button>
      {errorCode && (
        <p role="alert" className="max-w-xs text-xs text-[var(--error-text)]">
          {errorMessages[errorCode]}
        </p>
      )}
    </div>
  );
}
