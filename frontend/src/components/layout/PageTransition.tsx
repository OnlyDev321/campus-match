"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Chỉ chạy lại khi đổi đường dẫn, không chạy lại khi nhập liệu hay lọc dữ liệu.
  return <div key={pathname} className="page-enter min-h-full">{children}</div>;
}
