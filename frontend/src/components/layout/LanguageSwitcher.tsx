"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, SupportedLanguage } from "@/context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";

const languages: { code: SupportedLanguage; label: string; flag: string; native: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸", native: "English" },
  { code: "ko", label: "Korean", flag: "🇰🇷", native: "한국어" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳", native: "Tiếng Việt" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-button)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] border border-[var(--border)] transition-colors cursor-pointer"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="hidden sm:inline">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-faint)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-38 rounded-xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-level-3)] py-1 z-50 animate-in fade-in-0 zoom-in-95">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                language === item.code
                  ? "bg-[var(--surface-container)] text-[var(--primary)] font-semibold"
                  : "text-[var(--text-primary)] hover:bg-[var(--surface-container-low)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span>{item.native}</span>
              </span>
              {language === item.code && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
