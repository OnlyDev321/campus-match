"use client";

import { use, useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, Card, RoleQuota, type BadgeVariant } from "@/design-system";
import ApplicationCard from "@/components/application/ApplicationCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups } from "@/services/groupService";
import {
  acceptApplication,
  getGroupApplications,
  rejectApplication,
} from "@/services/applicationService";
import { toApiErrorCode } from "@/lib/api";
import { useRequireLogin, useServiceData } from "@/lib/hooks";
import { useLanguageStore } from "@/stores/languageStore";
import type {
  ApiErrorCode,
  ApplicationAction,
  GroupStatusCode,
  ManageGroupData,
  ManageGroupPageProps,
} from "@/lib/types";

// Trang duyệt đơn xin gia nhập của một nhóm tôi làm Leader (/manage/[groupId]).
// Quyền Leader xác định bằng myRole từ Backend (getMyGroups), không so sánh theo tên.

const statusVariant: Record<GroupStatusCode, BadgeVariant> = {
  RECRUITING: "recruiting",
  COMPLETED: "active",
  CLOSED: "closed",
};

const omitKey = <V,>(record: Record<number, V>, key: number): Record<number, V> => {
  const next = { ...record };
  delete next[key];
  return next;
};

const backLinkClass =
  "inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors";

export default function ManageGroupPage({ params }: ManageGroupPageProps) {
  const { groupId: groupIdParam } = use(params);
  const groupId = Number(groupIdParam);
  const { t } = useLanguageStore();
  const isReady = useRequireLogin(`/manage/${groupIdParam}`);

  const loadGroupData = useCallback(async (): Promise<ManageGroupData> => {
    const groups = await getMyGroups();
    const group = groups.find((g) => g.id === groupId && g.myRole === "LEADER") ?? null;
    if (!group) return { group: null, applications: [] };
    const applications = await getGroupApplications(groupId);
    return { group, applications };
  }, [groupId]);

  const { status, data, errorCode, reload, setData } = useServiceData(loadGroupData, isReady);
  const [pendingActions, setPendingActions] = useState<Record<number, ApplicationAction>>({});
  const [actionErrors, setActionErrors] = useState<Record<number, ApiErrorCode>>({});

  const handleAction = async (applicationId: number, action: ApplicationAction) => {
    setPendingActions((prev) => ({ ...prev, [applicationId]: action }));
    setActionErrors((prev) => omitKey(prev, applicationId));
    try {
      const updated =
        action === "accept"
          ? await acceptApplication(applicationId)
          : await rejectApplication(applicationId);

      // Làm mới thông tin nhóm (số thành viên, trạng thái) sau khi duyệt; lỗi làm mới không chặn kết quả duyệt.
      const freshGroup = await getMyGroups()
        .then((groups) => groups.find((g) => g.id === groupId) ?? null)
        .catch(() => null);

      setData((prev) =>
        prev && {
          group: freshGroup ?? prev.group,
          applications: prev.applications.map((a) => (a.id === updated.id ? updated : a)),
        },
      );
    } catch (error) {
      setActionErrors((prev) => ({ ...prev, [applicationId]: toApiErrorCode(error) }));
    } finally {
      setPendingActions((prev) => omitKey(prev, applicationId));
    }
  };

  if (!isReady) return null;

  // Không tồn tại / không phải Leader: getMyGroups không trả về nhóm, hoặc Backend trả 403/404.
  const isUnavailable =
    (status === "ready" && !data?.group) ||
    (status === "error" && (errorCode === "FORBIDDEN" || errorCode === "NOT_FOUND"));

  const group = data?.group ?? null;
  const pendingApplications = (data?.applications ?? []).filter((a) => a.status === "PENDING");
  const courseLabel = group
    ? [group.courseCode, group.courseName].filter(Boolean).join(" • ") || group.department
    : "";

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link href="/groups?tab=mine" className={backLinkClass}>
        <ArrowLeft className="w-3.5 h-3.5" />
        {t.groupsPage.backToMyGroups}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {t.manage.title}
      </h1>

      {status === "loading" ? (
        <CardSkeletonList count={2} />
      ) : isUnavailable ? (
        <EmptyState
          text={`${t.manage.notAvailableTitle}. ${t.manage.notAvailableDesc}`}
          action={
            <Link
              href="/groups?tab=mine"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
            >
              {t.groupsPage.backToMyGroups}
            </Link>
          }
        />
      ) : status === "error" || !group ? (
        <ErrorState
          title={t.manage.applicationsError}
          message={t.apiErrors[errorCode ?? "SERVER_ERROR"]}
          retryLabel={t.manage.retry}
          onRetry={reload}
        />
      ) : (
        <>
          {/* Group summary */}
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-[var(--primary)] tracking-wide uppercase">
                {courseLabel}
              </span>
              <Badge
                variant={statusVariant[group.status]}
                size="sm"
                dot
                pulse={group.status === "RECRUITING"}
                mono
              >
                {t.groupStatus[group.status]}
              </Badge>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {group.title}
            </h2>
            <RoleQuota
              current={group.memberCount}
              max={group.maxMembers}
              label={t.myGroupCard.membersLabel}
            />
          </Card>

          {/* Pending applications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                {t.manage.applicationsTitle}
              </h2>
              <Badge variant="neutral" size="sm" mono>
                {pendingApplications.length}
              </Badge>
            </div>

            {pendingApplications.length === 0 ? (
              <EmptyState text={t.manage.pendingEmpty} />
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    pendingAction={pendingActions[application.id] ?? null}
                    errorCode={actionErrors[application.id] ?? null}
                    onAccept={(id) => handleAction(id, "accept")}
                    onReject={(id) => handleAction(id, "reject")}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
