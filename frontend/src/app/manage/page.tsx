"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import Link from "next/link";
import { PlusCircle, ArrowRight, Users, ShieldCheck } from "lucide-react";
import { Badge, Button } from "@/design-system";
import MyGroupCard from "@/components/group/MyGroupCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups } from "@/services/groupService";
import { useRequireLogin, useServiceData } from "@/lib/hooks";
import { useLanguageStore } from "@/stores/languageStore";
import type { MyGroupColumnProps } from "@/lib/types";

// Trang Manage (My Groups): danh sách nhóm của tôi, truy cập từ mục Manage trên Sidebar.
// - Lấy qua services/groupService (getMyGroups), chia 2 cột theo myRole do Backend trả về.
// - Nhóm tôi làm Leader: bấm vào để duyệt đơn tại /manage/[groupId].
// - Nhóm tôi là thành viên: bấm vào để mở trang chi tiết /groups/[id].

const MyGroupColumn = ({ title, groups, variant, emptyText, emptyAction }: MyGroupColumnProps) => (
  <section className="space-y-5 min-w-0">
    <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-container-low)] text-[var(--primary)]">
        {variant === "lead" ? <ShieldCheck aria-hidden="true" className="h-4 w-4" /> : <Users aria-hidden="true" className="h-4 w-4" />}
      </span>
      <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
        <ScrambleText text={title} />
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
      <div className="grid gap-4">
        {groups.map((group) => (
          <MyGroupCard key={group.id} group={group} variant={variant} />
        ))}
      </div>
    )}
  </section>
);

const ManagePage = () => {
  const { t } = useLanguageStore();
  const isReady = useRequireLogin("/manage");
  const { status, data: groups, errorCode, reload } = useServiceData(getMyGroups, isReady);

  if (!isReady) return null;

  const loadedGroups = status === "ready" ? (groups ?? []) : null;
  const ledGroups = loadedGroups?.filter((g) => g.myRole === "LEADER") ?? null;
  const memberGroups = loadedGroups?.filter((g) => g.myRole !== "LEADER") ?? null;

  const browseLink = (
    <Link
      href="/groups"
      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
    >
      <ScrambleText text={t.manage.browseGroups} />
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );

  return (
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="text-[var(--primary)] uppercase"><ScrambleText text={t.myPage.breadcrumbRoot} /></span>
        <span aria-hidden="true" className="text-[var(--text-faint)]">/</span>
        <span className="text-[var(--text-muted)] font-normal"><ScrambleText text={t.myPage.breadcrumbCampus} /></span>
      </div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5 min-w-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          <ScrambleText text={t.manage.listTitle} />
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]"><ScrambleText text={t.manage.subtitle} /></p>
      </div>
      <Button href="/create-group" leftIcon={<PlusCircle aria-hidden="true" className="h-4 w-4" />} className="shrink-0 self-start"><ScrambleText text={t.manage.createGroup} /></Button>
      </header>

      {/* My Groups: Groups I lead / Groups I'm a member of */}
      {status === "error" ? (
        <ErrorState
          title={t.manage.groupsError}
          message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
          retryLabel={t.manage.retry}
          onRetry={reload}
        />
      ) : (
        <div className="grid min-w-0 grid-cols-1 @5xl:grid-cols-[repeat(2,minmax(0,1fr))] gap-8 xl:gap-10 items-start">
          <MyGroupColumn
            title={t.manage.ledColumnTitle}
            groups={ledGroups}
            variant="lead"
            emptyText={t.manage.ledEmpty}
            emptyAction={
              <Button
                href="/create-group"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                <ScrambleText text={t.manage.createGroup} />
              </Button>
            }
          />
          <MyGroupColumn
            title={t.manage.memberColumnTitle}
            groups={memberGroups}
            variant="member"
            emptyText={t.manage.memberEmpty}
            emptyAction={browseLink}
          />
        </div>
      )}
    </div>
  );
};

export default ManagePage;
