import React from "react";
import Image from "next/image";
import type { BrandLogoProps } from "@/lib/types";

/**
 * Logo thương hiệu CampusMatch dùng chung cho Header, màn đăng nhập/đăng ký.
 * Khung vuông cố định kích thước; ảnh được co giãn theo object-contain nên không bị méo.
 */
export function BrandLogo({ size = 32, priority = false, className = "" }: BrandLogoProps) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/campus-match-logo.png"
        alt="CampusMatch"
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
