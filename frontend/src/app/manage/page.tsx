"use client";

import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";
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
      {t.manage.browseGroups}
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {t.manage.listTitle}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{t.manage.subtitle}</p>
      </div>

      {/* My Groups: Groups I lead / Groups I'm a member of */}
      {status === "error" ? (
        <ErrorState
          title={t.manage.groupsError}
          message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
          retryLabel={t.manage.retry}
          onRetry={reload}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                {t.manage.createGroup}
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
