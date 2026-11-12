"use client";

import React from "react";
import ProfileCard from "./ProfileCard";
import TimetableCard from "./TimetableCard";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

// Trang My Page.
// - Bố cục, kích thước container và nhịp điệu typography đồng nhất 100% với trang Groups (/groups).
// - Hồ sơ sinh viên lấy từ phiên đăng nhập u-SAINT (authStore), không dùng dữ liệu giả.
// - Thời khóa biểu u-SAINT (ZCMW2102) lấy cùng lúc đăng nhập, hiển thị bên dưới hồ sơ (TimetableCard).
// - Danh sách nhóm của tôi (Leader / Member) nằm ở trang Manage (/manage), truy cập từ Sidebar.

const MyPage = () => {
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const isReady = useRequireLogin("/mypage");

  if (!isReady || !user) return null;

  return (
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Breadcrumb / Directory path - Đồng nhất với Groups page */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="text-[var(--primary)] uppercase">
          {t.myPage.breadcrumbRoot}
        </span>
        <span className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-muted)] font-normal">
          {t.myPage.breadcrumbCampus}
        </span>
      </div>

      {/* 2. Page Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t.nav.myPage}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          {t.myPage.subtitle}
        </p>
      </div>

      {/* 3. Profile Card (Chế độ chỉ đọc từ u-SAINT SSO) */}
      <ProfileCard user={user} />

      {/* 4. My Timetable (u-SAINT ZCMW2102) */}
      <TimetableCard />
    </div>
  );
};

export default MyPage;
