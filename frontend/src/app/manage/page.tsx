"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/design-system";
import MyGroupCard from "@/components/group/MyGroupCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups } from "@/services/groupService";
import { useRequireLogin, useServiceData } from "@/lib/hooks";
import { useLanguageStore } from "@/stores/languageStore";

// Trang Manage: danh sách các nhóm tôi làm Leader, bấm vào để duyệt đơn tại /manage/[groupId].

const ManagePage = () => {
  const { t } = useLanguageStore();
  const isReady = useRequireLogin("/manage");
  const { status, data: groups, errorCode, reload } = useServiceData(getMyGroups, isReady);

  if (!isReady) return null;

  const ledGroups = (groups ?? []).filter((g) => g.myRole === "LEADER");

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {t.manage.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{t.manage.subtitle}</p>
      </div>

      {status === "loading" ? (
        <CardSkeletonList count={2} />
      ) : status === "error" ? (
        <ErrorState
          title={t.myPage.groupsError}
          message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
          retryLabel={t.manage.retry}
          onRetry={reload}
        />
      ) : ledGroups.length === 0 ? (
        <EmptyState
          text={t.manage.empty}
          action={
            <Button
              href="/create-group"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              {t.myPage.createGroup}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ledGroups.map((group) => (
            <MyGroupCard key={group.id} group={group} variant="lead" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePage;
