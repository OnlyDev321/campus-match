"use client";

import React from "react";
import ProfileCard from "./ProfileCard";
import TimetableCard from "./TimetableCard";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

// Trang My Page.
// - Page header (breadcrumb, tiêu đề, mô tả) theo cùng kiểu với trang Find Your Group (/groups).
// - Hồ sơ sinh viên lấy từ phiên đăng nhập u-SAINT (authStore), không dùng dữ liệu giả.
// - Thời khóa biểu u-SAINT (ZCMW2102) lấy cùng lúc đăng nhập, hiển thị bên dưới hồ sơ (TimetableCard).
// - Danh sách nhóm của tôi (Leader / Member) nằm ở trang Manage (/manage), truy cập từ Sidebar.

const MyPage = () => {
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const isReady = useRequireLogin("/mypage");

  if (!isReady || !user) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="space-y-6">
        {/* Breadcrumb / Directory path */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-wider">
          <span className="text-[var(--primary)] uppercase">
            {t.myPage.breadcrumbRoot}
          </span>
          <span className="text-[var(--text-faint)]">/</span>
          <span className="text-[var(--text-muted)] font-normal">
            {t.myPage.breadcrumbCampus}
          </span>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t.nav.myPage}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] break-keep">
            {t.myPage.subtitle}
          </p>
        </div>
      </header>

      {/* Profile (Read-only u-SAINT verified) */}
      <ProfileCard user={user} />

      {/* My Timetable (u-SAINT) */}
      <TimetableCard />
    </div>
  );
};

export default MyPage;
