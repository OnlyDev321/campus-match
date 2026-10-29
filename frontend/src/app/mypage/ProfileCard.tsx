"use client";

import React from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, Badge } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage } from "@/lib/format";
import type { ProfileCardProps } from "@/lib/types";

// Khung hồ sơ trên My Page (Chế độ chỉ đọc từ tài khoản trường u-SAINT SSO).
// Thông tin sinh viên (Tên, MSSV, Trường/Viện, Khoa, Năm học, Email, SĐT) lấy từ hồ sơ đăng nhập trong authStore.

const ProfileHeading = ({ user }: ProfileCardProps) => {
  const { t } = useLanguageStore();
  const affiliation = [user.faculty, user.department].filter(Boolean).join(" · ");

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {user.name}
        </h1>
        {user.academicYear && (
          <Badge variant="primary" size="sm" mono>
            {formatMessage(t.profile.yearBadge, { year: user.academicYear })}
          </Badge>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--success-text)] bg-[var(--success-bg)] px-2 py-0.5 rounded border border-[var(--success-border)]">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t.profile.verified}
        </span>
      </div>
      <p className="text-xs font-mono text-[var(--text-muted)]">
        {user.studentId}
        {affiliation && ` • ${affiliation}`}
      </p>
    </div>
  );
};

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <section className="relative rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-1)] overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-(--primary-container)/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
        <Avatar src={user.avatarUrl} name={user.name} size="xl" />

        <div className="flex-1 min-w-0 space-y-3">
          <ProfileHeading user={user} />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </a>
            )}
            {user.phone && (
              <a
                href={`tel:${user.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {user.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
