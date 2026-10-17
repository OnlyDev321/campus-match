"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Globe, RefreshCw, Undo2, Sparkles } from "lucide-react";
import type { TranslateButtonProps } from "@/lib/types";

export default function TranslateButton({
  originalText,
  onTranslated,
  className = "",
}: TranslateButtonProps) {
  const { language, t } = useLanguageStore();
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [cachedTranslations, setCachedTranslations] = useState<Record<string, string>>({});

  const handleTranslate = async () => {
    // Nếu đã dịch rồi, bấm lần nữa để quay lại bản gốc
    if (isTranslated) {
      setIsTranslated(false);
      onTranslated(null);
      return;
    }

    // Nếu đã có trong cache bộ nhớ, dùng luôn không cần gọi API
    if (cachedTranslations[language]) {
      setIsTranslated(true);
      onTranslated(cachedTranslations[language]);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          targetLang: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translatedText || originalText;
        setCachedTranslations((prev) => ({ ...prev, [language]: translated }));
        setIsTranslated(true);
        onTranslated(translated);
      }
    } catch (e) {
      console.error("Translation request failed:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isTranslating}
      className={`inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium cursor-pointer transition-opacity disabled:opacity-50 ${className}`}
    >
      {isTranslating ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin text-[var(--primary)]" />
          <span>{t.translate.translating}</span>
        </>
      ) : isTranslated ? (
        <>
          <Undo2 className="w-3 h-3" />
          <span>{t.translate.showOriginal}</span>
          <span className="text-[10px] text-[var(--text-faint)] flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Gemini
          </span>
        </>
      ) : (
        <>
          <Globe className="w-3 h-3" />
          <span>{t.translate.btn}</span>
        </>
      )}
    </button>
  );
}
