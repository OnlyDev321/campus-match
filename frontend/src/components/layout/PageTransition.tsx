"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useLanguageStore } from "@/stores/languageStore";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Chỉ đổi key khi chuyển trang; đổi ngôn ngữ không reset form hoặc vị trí cuộn.
  return <div key={pathname} className="page-enter min-h-full">{children}</div>;
}
