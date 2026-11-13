"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import React from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Card } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage } from "@/lib/format";
import type { ProfileCardProps } from "@/lib/types";

// Khung hồ sơ trên My Page (Chế độ chỉ đọc từ tài khoản trường u-SAINT SSO).
// Thiết kế đồng bộ hệ thống Design System Card và các badge/pill tương tự GroupCard.

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { t } = useLanguageStore();

  return (
    <Card className="relative p-6 sm:p-8 overflow-hidden hover:border-(--border-strong) transition-all">
      {/* Hiệu ứng hào quang trang trí góc phải */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-(--primary)/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-6">
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="xl"
          className="ring-2 ring-(--primary-soft-border) shadow-xs shrink-0"
        />

        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Tên sinh viên và các huy hiệu xác thực */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary)">
              {user.name}
            </h2>
            {user.academicYear && (
              <Badge variant="primary" size="sm" mono>
                <ScrambleText text={formatMessage(t.profile.yearBadge, { year: user.academicYear })} protectedValues={[...Object.values({ year: user.academicYear })]} />
              </Badge>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--success-text) bg-(--success-bg) px-2.5 py-1 rounded-md border border-(--success-border)">
              <ShieldCheck className="w-3.5 h-3.5 text-(--success)" />
              <ScrambleText text={t.profile.verified} />
            </span>
          </div>

          {/* Các thẻ thông tin học vụ (Đồng bộ thị giác với GroupCard) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-(--surface-container-low) text-(--text-secondary) border border-(--border)">
              {user.studentId}
            </span>
            {user.faculty && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-(--primary-soft) text-(--primary) border border-(--primary-soft-border)">
                {user.faculty}
              </span>
            )}
            {user.department && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-(--surface-container-low) text-(--text-secondary) border border-(--border)">
                {user.department}
              </span>
            )}
          </div>

          {/* Thông tin liên hệ sinh viên */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-(--text-muted) hover:text-(--primary) hover:border-(--primary-soft-border) bg-(--surface-container-low) px-3 py-1.5 rounded-md border border-(--border) transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-(--text-faint)" />
                {user.email}
              </a>
            )}
            {user.phone && (
              <a
                href={`tel:${user.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-(--text-muted) hover:text-(--primary) hover:border-(--primary-soft-border) bg-(--surface-container-low) px-3 py-1.5 rounded-md border border-(--border) transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-(--text-faint)" />
                {user.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
