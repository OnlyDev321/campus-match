"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Badge, Button, Card } from "@/design-system";
import ProfileCard from "./ProfileCard";
import MyGroupCard from "@/components/group/MyGroupCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups } from "@/services/groupService";
import { useRequireLogin, useServiceData } from "@/lib/hooks";
import { formatMessage } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type { MyGroupColumnProps } from "@/lib/types";

// Trang My Page.
// - Hồ sơ sinh viên lấy từ phiên đăng nhập u-SAINT (authStore), không dùng dữ liệu giả.
// - Danh sách nhóm lấy qua services/groupService (getMyGroups), chia 2 cột theo myRole do Backend trả về.
// - Các số thống kê được tính từ danh sách nhóm để luôn khớp với những gì hiển thị bên dưới.

const MyGroupColumn = ({ title, groups, variant, emptyText, emptyAction }: MyGroupColumnProps) => (
  <section className="space-y-4 min-w-0">
    <div className="flex items-center gap-2">
      <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h3>
      {groups && (
        <Badge variant="neutral" size="sm" mono>
          {groups.length}
        </Badge>
      )}
    </div>

    {groups === null ? (
      <CardSkeletonList count={2} />
    ) : groups.length === 0 ? (
      <EmptyState text={emptyText} action={emptyAction} />
    ) : (
      <div className="space-y-5">
        {groups.map((group) => (
          <MyGroupCard key={group.id} group={group} variant={variant} />
        ))}
      </div>
    )}
  </section>
);

const MyPage = () => {
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const isReady = useRequireLogin("/mypage");
  const { status, data: groups, errorCode, reload } = useServiceData(getMyGroups, isReady);

  if (!isReady || !user) return null;

  const loadedGroups = status === "ready" ? (groups ?? []) : null;
  const ledGroups = loadedGroups?.filter((g) => g.myRole === "LEADER") ?? null;
  const memberGroups = loadedGroups?.filter((g) => g.myRole !== "LEADER") ?? null;
  const activeGroups = loadedGroups?.filter((g) => g.status !== "CLOSED") ?? null;
  const recruitingCount = loadedGroups?.filter((g) => g.status === "RECRUITING").length ?? 0;

  const titlesOrNone = (list: { title: string }[]) =>
    list.map((g) => g.title).join(", ") || t.myPage.statsNone;

  const statCards: { label: string; value: number | string; sublabel: string }[] = [
    {
      label: t.myPage.statsActive,
      value: activeGroups?.length ?? "—",
      sublabel: activeGroups
        ? formatMessage(t.myPage.statsActiveSub, { count: recruitingCount })
        : "",
    },
    {
      label: t.myPage.statsLed,
      value: ledGroups?.length ?? "—",
      sublabel: ledGroups ? titlesOrNone(ledGroups) : "",
    },
    {
      label: t.myPage.statsMemberOf,
      value: memberGroups?.length ?? "—",
      sublabel: memberGroups ? titlesOrNone(memberGroups) : "",
    },
  ];

  const browseLink = (
    <Link
      href="/groups"
      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
    >
      {t.myPage.browseGroups}
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile (Read-only u-SAINT verified) */}
      <ProfileCard user={user} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {statCards.map((stat) => (
          <Card key={stat.label} className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono truncate">
              {stat.label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
              {stat.value}
            </p>
            <p
              className="text-xs text-[var(--text-secondary)] truncate min-h-4"
              title={stat.sublabel}
            >
              {stat.sublabel}
            </p>
          </Card>
        ))}
      </div>

      {/* My Groups: Groups I lead / Groups I'm a member of */}
      <section className="space-y-5">
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {t.myPage.groupsSectionTitle}
        </h2>

        {status === "error" ? (
          <ErrorState
            title={t.myPage.groupsError}
            message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
            retryLabel={t.myPage.retry}
            onRetry={reload}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MyGroupColumn
              title={t.myPage.ledColumnTitle}
              groups={ledGroups}
              variant="lead"
              emptyText={t.myPage.ledEmpty}
              emptyAction={
                <Button
                  href="/create-group"
                  size="sm"
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  {t.myPage.createGroup}
                </Button>
              }
            />
            <MyGroupColumn
              title={t.myPage.memberColumnTitle}
              groups={memberGroups}
              variant="member"
              emptyText={t.myPage.memberEmpty}
              emptyAction={browseLink}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default MyPage;
