"use client";

import { ArrowRight, PlusCircle } from "lucide-react";
import { Badge, Button } from "@/design-system";
import MyGroupCard from "@/components/group/MyGroupCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups } from "@/services/groupService";
import { useServiceData } from "@/lib/hooks";
import { useAuthHydrated, useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type { MyGroupSectionProps, MyGroupsTabProps } from "@/lib/types";

// Tab "My groups" trên trang /groups.
// - Danh sách nhóm lấy qua services/groupService (getMyGroups), chỉ tải khi tab đang mở (component chỉ được render lúc đó).
// - Chia 2 khu vực theo myRole do Backend trả về: LEADER → "Groups I lead", còn lại → "Groups I'm a member of",
//   mỗi nhóm chỉ xuất hiện ở đúng một khu vực.

const MyGroupSection = ({ title, groups, variant, emptyText, emptyAction }: MyGroupSectionProps) => (
  <section className="space-y-4 min-w-0">
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      <Badge variant="neutral" size="sm" mono>
        {groups.length}
      </Badge>
    </div>

    {groups.length === 0 ? (
      <EmptyState text={emptyText} action={emptyAction} />
    ) : (
      <div className="responsive-card-grid">
        {groups.map((group) => (
          <MyGroupCard key={group.id} group={group} variant={variant} />
        ))}
      </div>
    )}
  </section>
);

const MyGroupsTab = ({ onBrowseAll }: MyGroupsTabProps) => {
  const { t } = useLanguageStore();
  const hydrated = useAuthHydrated();
  const { isLoggedIn } = useAuthStore();
  const { status, data: groups, errorCode, reload } = useServiceData(
    getMyGroups,
    hydrated && isLoggedIn,
  );

  if (status === "loading") return <CardSkeletonList count={2} />;

  if (status === "error") {
    return (
      <ErrorState
        title={t.groupsPage.error}
        message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
        retryLabel={t.groupsPage.retry}
        onRetry={reload}
      />
    );
  }

  const loadedGroups = groups ?? [];
  const ledGroups = loadedGroups.filter((g) => g.myRole === "LEADER");
  const memberGroups = loadedGroups.filter((g) => g.myRole !== "LEADER");

  return (
    <div className="space-y-10">
      <MyGroupSection
        title={t.groupsPage.ledTitle}
        groups={ledGroups}
        variant="lead"
        emptyText={t.groupsPage.ledEmpty}
        emptyAction={
          <Button href="/create-group" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            {t.groupsPage.createGroup}
          </Button>
        }
      />
      <MyGroupSection
        title={t.groupsPage.memberTitle}
        groups={memberGroups}
        variant="member"
        emptyText={t.groupsPage.memberEmpty}
        emptyAction={
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onBrowseAll}
          >
            {t.groupsPage.browseAll}
          </Button>
        }
      />
    </div>
  );
};

export default MyGroupsTab;
