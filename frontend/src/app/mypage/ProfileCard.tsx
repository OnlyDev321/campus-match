"use client";

import React from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, Badge } from "@/design-system";
import type { ProfileCardProps, User } from "@/lib/types";

// Khung hồ sơ trên My Page (Chế độ chỉ đọc từ tài khoản trường u-SAINT SSO).
// Thông tin sinh viên (Tên, MSSV, Khoa, Khóa, Email, SĐT, Kỹ năng) được đồng bộ từ trường.

const ProfileHeading = ({ user }: { user: User }) => (
  <div className="space-y-1">
    <div className="flex flex-wrap items-center gap-2.5">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {user.name}
      </h1>
      <Badge variant="primary" size="sm" mono>
        {user.cohort}
      </Badge>
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--success-text)] bg-[var(--success-bg)] px-2 py-0.5 rounded border border-[var(--success-border)]">
        <ShieldCheck className="w-3.5 h-3.5" />
        u-SAINT Verified
      </span>
    </div>
    <p className="text-xs font-mono text-[var(--text-muted)]">
      {user.studentId} • {user.major}
    </p>
  </div>
);

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <section className="relative rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-1)] overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-(--primary-container)/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
        <Avatar src={user.avatarUrl} name={user.name} size="xl" />

        <div className="flex-1 min-w-0 space-y-3">
          <ProfileHeading user={user} />

          {user.bio && (
            <p className="max-w-2xl text-sm text-[var(--text-secondary)] leading-relaxed">
              {user.bio}
            </p>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1">
            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </a>
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
