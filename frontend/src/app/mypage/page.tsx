"use client";

import React from "react";
import ProfileCard from "./ProfileCard";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";

// Trang My Page.
// - Hồ sơ sinh viên lấy từ phiên đăng nhập u-SAINT (authStore), không dùng dữ liệu giả.
// - Danh sách nhóm của tôi (Leader / Member) nằm ở trang Manage (/manage), truy cập từ Sidebar.

const MyPage = () => {
  const { user } = useAuthStore();
  const isReady = useRequireLogin("/mypage");

  if (!isReady || !user) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile (Read-only u-SAINT verified) */}
      <ProfileCard user={user} />
    </div>
  );
};

export default MyPage;
