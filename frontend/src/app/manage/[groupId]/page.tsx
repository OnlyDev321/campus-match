"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { use, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, Card, RoleQuota, type BadgeVariant } from "@/design-system";
import ManageGroupEditor from "@/components/group/ManageGroupEditor";
import ApplicationCard from "@/components/application/ApplicationCard";
import DeleteGroupModal from "@/components/group/DeleteGroupModal";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { getMyGroups, deleteGroup, MANAGE_MUTATIONS_AVAILABLE, MANAGE_USES_SAMPLE_DATA } from "@/services/groupService";
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
  ManageApplicationConfirmation,
  ManageGroupContentProps,
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
  return <ManageGroupContent key={groupIdParam} groupIdParam={groupIdParam} />;
}

function ManageGroupContent({ groupIdParam }: ManageGroupContentProps) {
  const groupId = Number(groupIdParam);
  const { t } = useLanguageStore();
  const isReady = useRequireLogin(`/manage/${groupIdParam}`);

  const loadGroupData = useCallback(async (): Promise<ManageGroupData> => {
    if (!/^[1-9]\d*$/.test(groupIdParam) || !Number.isSafeInteger(groupId)) return { group: null, applications: [] };
    const groups = await getMyGroups();
    const group = groups.find((g) => g.id === groupId && g.myRole === "LEADER") ?? null;
    if (!group) return { group: null, applications: [] };
    try {
      const applications = await getGroupApplications(groupId);
      return { group, applications };
    } catch (error) {
      return { group, applications: [], applicationsErrorCode: toApiErrorCode(error) };
    }
  }, [groupId, groupIdParam]);

  const { status, data, errorCode, reload, setData } = useServiceData(loadGroupData, isReady);
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingActions, setPendingActions] = useState<Record<number, ApplicationAction>>({});
  const [actionErrors, setActionErrors] = useState<Record<number, ApiErrorCode>>({});
  const [confirmation, setConfirmation] = useState<ManageApplicationConfirmation | null>(null);

  const handleDeleteConfirm = async () => {
    if (!group) return;
    await deleteGroup(group.id);
    router.push("/manage");
  };

  const handleAction = async (applicationId: number, action: ApplicationAction) => {
    if (!MANAGE_MUTATIONS_AVAILABLE || MANAGE_USES_SAMPLE_DATA || data?.group?.myRole !== "LEADER" || Object.keys(pendingActions).length > 0) return;
    if (action === "accept" && (data.group.status !== "RECRUITING" || data.group.memberCount >= data.group.maxMembers)) return;
    setConfirmation(null);
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
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/manage" className={backLinkClass}>
        <ArrowLeft className="w-3.5 h-3.5" />
        <ScrambleText text={t.manage.backToManage} />
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        <ScrambleText text={t.manage.title} />
      </h1>

      {status === "loading" ? (
        <CardSkeletonList count={2} />
      ) : isUnavailable ? (
        <EmptyState
          text={`${t.manage.notAvailableTitle}. ${t.manage.notAvailableDesc}`}
          action={
            <Link
              href="/manage"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
            >
              <ScrambleText text={t.manage.backToManage} />
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
                <ScrambleText text={t.groupStatus[group.status]} />
              </Badge>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              {group.title}
            </h2>
            <p className="text-sm whitespace-pre-wrap break-words text-[var(--text-secondary)]">{group.description}</p>
            <p className="text-sm text-[var(--text-secondary)]">{group.college} · {group.department}</p>
            <RoleQuota
              current={group.memberCount}
              max={group.maxMembers}
              label={t.myGroupCard.membersLabel}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold"><ScrambleText text={t.manageDetails.members} /></h2>
            {group.members.length === 0 ? <EmptyState text={t.manageDetails.membersEmpty} /> : (
              <ul className="divide-y divide-[var(--border)]">
                {group.members.map((member) => (
                  <li key={member.userId} className="flex items-center gap-3 py-3 min-w-0">
                    <Avatar name={member.name} size="sm" />
                    <span className="flex-1 min-w-0 break-words">{member.name}</span>
                    <Badge variant={member.role === "LEADER" ? "primary" : "neutral"}>
                      <ScrambleText text={member.role === "LEADER" ? t.myGroupCard.leader : t.myGroupCard.member} />
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <ManageGroupEditor key={group.id} group={group} />

          {/* Pending applications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                <ScrambleText text={t.manage.applicationsTitle} />
              </h2>
              <Badge variant="neutral" size="sm" mono>
                {pendingApplications.length}
              </Badge>
            </div>

            {data?.applicationsErrorCode ? (
              <ErrorState title={t.manage.applicationsError} message={t.apiErrors[data.applicationsErrorCode]} retryLabel={t.manage.retry} onRetry={reload} />
            ) : pendingApplications.length === 0 ? (
              <EmptyState text={t.manage.pendingEmpty} />
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    pendingAction={pendingActions[application.id] ?? null}
                    errorCode={actionErrors[application.id] ?? null}
                    onAccept={(id) => setConfirmation({ applicationId: id, action: "accept" })}
                    onReject={(id) => setConfirmation({ applicationId: id, action: "reject" })}
                  />
                ))}
              </div>
            )}
          </section>
          {confirmation && (
            <Card role="region" aria-labelledby="confirm-action-title" className="space-y-3">
              <h2 id="confirm-action-title" className="font-semibold"><ScrambleText text={confirmation.action === "accept" ? t.manageDetails.confirmAccept : t.manageDetails.confirmReject} /></h2>
              <p className="break-words">{data?.applications.find((a) => a.id === confirmation.applicationId)?.applicant.name}</p>
              <p id="action-blocked" className="text-sm text-[var(--text-secondary)]"><ScrambleText text={t.manageDetails.blocked} /></p>
              <div className="flex flex-wrap gap-3">
                <Button autoFocus variant="outline" onClick={() => setConfirmation(null)}><ScrambleText text={t.manageDetails.cancel} /></Button>
                <Button disabled={!MANAGE_MUTATIONS_AVAILABLE || MANAGE_USES_SAMPLE_DATA || Object.keys(pendingActions).length > 0 || (confirmation.action === "accept" && (group.status !== "RECRUITING" || group.memberCount >= group.maxMembers))}
                  aria-describedby="action-blocked" onClick={() => handleAction(confirmation.applicationId, confirmation.action)}><ScrambleText text={t.manageDetails.confirm} /></Button>
              </div>
            </Card>
          )}

          {/* Danger Zone: Giải tán / Xóa nhóm học tập */}
          <section className="pt-4 border-t border-[var(--border)]">
            <Card className="border border-[var(--error-border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[var(--error)]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h3 className="text-sm font-bold tracking-tight">
                      <ScrambleText text={t.manageDetails.dangerZoneTitle} />
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                    <ScrambleText text={t.manageDetails.dangerZoneDesc} />
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="border-[var(--error-border)] text-[var(--error)] hover:bg-[var(--error-bg)] hover:border-[var(--error)] font-medium shrink-0"
                >
                  <ScrambleText text={t.manageDetails.deleteGroupBtn} />
                </Button>
              </div>
            </Card>

            <DeleteGroupModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              groupId={group.id}
              groupTitle={group.title}
              onDeleteConfirm={handleDeleteConfirm}
            />
          </section>
        </>
      )}
    </div>
  );
}
