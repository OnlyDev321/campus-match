"use client";

import { useLayoutEffect, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { scrambleText } from "@/lib/textScramble";
import type { ScrambleTextProps } from "@/lib/types";

export function ScrambleText({ text, protectedValues = [] }: ScrambleTextProps) {
  const language = useLanguageStore((state) => state.language);
  const visualRef = useRef<HTMLSpanElement>(null);
  const previous = useRef({ language, text });
  // Chuẩn hóa dependency để việc render lại của cha không khởi động lại hiệu ứng.
  const protectedKey = JSON.stringify(protectedValues);

  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { language, text };
    const visual = visualRef.current;
    if (!visual) return;
    visual.setAttribute("data-text", text);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (before.language === language || before.text === text || reducedMotion.matches) return;
    const bounds = visual.getBoundingClientRect();
    if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

    const tokens = getComputedStyle(visual);
    const duration = parseFloat(tokens.getPropertyValue("--motion-language-duration")) || 450;
    const interval = parseFloat(tokens.getPropertyValue("--motion-language-interval")) || 45;
    const values = JSON.parse(protectedKey);
    let frame = 0;
    let started: number | null = null;
    let lastUpdate = -Infinity;

    // Nội dung thật luôn sẵn cho trình đọc màn hình; chỉ lớp hiển thị chạy ký tự.
    visual.setAttribute("data-text", scrambleText(text, values));
    const finish = () => {
      cancelAnimationFrame(frame);
      visual.setAttribute("data-text", text);
    };
    const tick = (now: number) => {
      started ??= now;
      if (now - started >= duration || !visual.isConnected) {
        finish();
        return;
      }
      if (now - lastUpdate >= interval) {
        visual.setAttribute("data-text", scrambleText(text, values));
        lastUpdate = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) finish();
    };
    reducedMotion.addEventListener("change", onMotionChange);
    frame = requestAnimationFrame(tick);
    return () => {
      finish();
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [language, text, protectedKey]);

  return (
    <span>
      <span className="sr-only">{text}</span>
      <span ref={visualRef} className="scramble-text-visual" data-text={text} aria-hidden="true" />
    </span>
  );
}
