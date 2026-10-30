"use client";

import React from "react";
import ProfileCard from "./ProfileCard";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

// Trang My Page: chỉ hiển thị hồ sơ cá nhân lấy từ phiên đăng nhập u-SAINT (authStore).
// Nhóm của tôi (Leader / thành viên) nằm ở tab "My groups" của trang /groups.

const MyPage = () => {
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const isReady = useRequireLogin("/mypage");

  if (!isReady || !user) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb / Directory path (cùng kiểu với trang /groups) */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="text-[var(--primary)] uppercase">{t.profile.breadcrumb}</span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-muted)] font-normal">SoongSil Campus</span>
      </div>

      {/* Page Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t.profile.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          {t.profile.pageSubtitle}
        </p>
      </div>

      {/* Profile (Read-only u-SAINT verified) */}
      <ProfileCard user={user} />
    </div>
  );
};

export default MyPage;
