"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMessage } from "@/lib/format";
import { CheckCircle2, ChevronDown, Download, Folder, LockKeyhole, Plus, Settings, Star } from "lucide-react";
import { Avatar, Badge, Button, Card, Input, Modal, type BadgeVariant } from "@/design-system";
import ApplicationCard from "@/components/application/ApplicationCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/common/AsyncState";
import { closeGroupRecruitment, getMyGroups, updateManagedGroup } from "@/services/groupService";
import {
  acceptApplication,
  getGroupApplications,
  rejectApplication,
} from "@/services/applicationService";
import { toApiErrorCode } from "@/lib/api";
import { useRequireLogin, useServiceData } from "@/lib/hooks";
import { useLanguageStore } from "@/stores/languageStore";
import styles from "./ManageWorkspace.module.css";
import type {
  ApiErrorCode,
  ApplicationAction,
  GroupStatusCode,
  ManageGroupData,
  ManageWorkspaceProps,
  ManageGroupDialog,
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

export default function ManageWorkspace({ groupId: requestedGroupId }: ManageWorkspaceProps) {
  const { t, language } = useLanguageStore();
  const router = useRouter();
  const [frontendOnly, setFrontendOnly] = useState(false);
  const [now] = useState(() => Date.now());
  const [dialog, setDialog] = useState<ManageGroupDialog | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [managementError, setManagementError] = useState<ApiErrorCode | null>(null);
  const isReady = useRequireLogin(requestedGroupId ? `/manage/${requestedGroupId}` : "/manage");

  const loadGroupData = useCallback(async (): Promise<ManageGroupData> => {
    const groups = await getMyGroups();
    const group = groups.find((g) => g.myRole === "LEADER" && (requestedGroupId === undefined || g.id === requestedGroupId)) ?? null;
    if (!group) return { group: null, applications: [], groups };
    const applications = await getGroupApplications(group.id);
    return { group, applications, groups };
  }, [requestedGroupId]);

  const { status, data, errorCode, reload, setData } = useServiceData(loadGroupData, isReady);
  const groupId = data?.group?.id;
  const [pendingActions, setPendingActions] = useState<Record<number, ApplicationAction>>({});
  const [actionErrors, setActionErrors] = useState<Record<number, ApiErrorCode>>({});

  const handleAction = async (applicationId: number, action: ApplicationAction) => {
    if (!groupId) return;
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
          ...prev,
          group: freshGroup ?? prev.group,
          applications: prev.applications.map((a) => (a.id === updated.id ? updated : a)),
        },
      );
      if (!freshGroup) reload();
    } catch (error) {
      setActionErrors((prev) => ({ ...prev, [applicationId]: toApiErrorCode(error) }));
    } finally {
      setPendingActions((prev) => omitKey(prev, applicationId));
    }
  };

  const saveManagement = async () => {
    if (!groupId) return;
    setSaving(true);
    setManagementError(null);
    try {
      if (dialog === "edit") await updateManagedGroup(groupId, { title, description, maxMembers: capacity });
      else if (dialog === "close") await closeGroupRecruitment(groupId);
      else return;
      // Ghi thành công rồi tải lại riêng: lỗi GET không được coi là lỗi mutation để tránh gửi lặp.
      setDialog(null);
      reload();
    } catch (error) {
      setManagementError(toApiErrorCode(error));
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) return null;

  // Không tồn tại / không phải Leader: getMyGroups không trả về nhóm, hoặc Backend trả 403/404.
  const isUnavailable =
    (status === "ready" && !data?.group) ||
    (status === "error" && (errorCode === "FORBIDDEN" || errorCode === "NOT_FOUND"));

  const group = data?.group ?? null;
  const pendingApplications = (data?.applications ?? []).filter((a) => a.status === "PENDING");

  const openSpots = group ? Math.max(0, group.maxMembers - group.memberCount) : 0;
  const isBusy = saving || Object.keys(pendingActions).length > 0;
  const filteredApplications = pendingApplications.filter((a) => !frontendOnly || a.skills?.some((skill) => /react|next|vue|angular|html|css|frontend/i.test(skill)));
  const recruitmentDays = group?.recruitmentEndsAt ? Math.max(0, Math.round((new Date(group.recruitmentEndsAt).getTime() - now) / 86400000)) : null;
  const dateFormatter = new Intl.DateTimeFormat(language, { month: "short", day: "numeric", year: "numeric" });
  const exportRoster = () => {
    if (!group) return;
    // Thoát ký tự CSV và ngăn dữ liệu bị diễn giải thành công thức bảng tính.
    const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const rows = [[t.manage.member, t.manage.major, t.manage.role, t.manage.dateJoined], ...group.members.map((m) => [m.name, m.department || "", m.projectRole || (m.role === "LEADER" ? t.manage.leader : t.manage.member), m.joinedAt])];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `group-${group.id}-roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.workspace}>
      {status === "loading" ? <CardSkeletonList count={3} /> : isUnavailable ? (
        <EmptyState text={requestedGroupId ? `${t.manage.notAvailableTitle}. ${t.manage.notAvailableDesc}` : t.manage.ledEmpty}
          action={<Button href={requestedGroupId ? "/manage" : "/create-group"}>{requestedGroupId ? t.manage.backToManage : t.manage.createGroup}</Button>} />
      ) : status === "error" || !group ? (
        <ErrorState title={t.manage.applicationsError} message={t.apiErrors[errorCode ?? "SERVER_ERROR"]} retryLabel={t.manage.retry} onRetry={reload} />
      ) : <>
        <header className={styles.toolbar}>
          <div className={styles.toolbarMain}>
            <div className={styles.titleRow}>
              <h1>{t.manage.workspaceTitle}</h1>
              <Badge variant={statusVariant[group.status]} dot className={styles.statusBadge}>
                {formatMessage(t.manage.statusLabel, { status: t.manage.statusNames[group.status] })}
                {group.status === "RECRUITING" && ` (${formatMessage(openSpots === 1 ? t.manage.oneOpenSpot : t.manage.openSpots, { count: openSpots })})`}
              </Badge>
            </div>
            <div className={styles.groupNavigation}>
              <div className={styles.groupSelect}>
                <Folder size={19} aria-hidden="true" />
                <select aria-label={t.manage.workspaceTitle} value={group.id} disabled={isBusy}
                  onChange={(e) => router.push(e.target.value === "groups" ? "/manage/groups" : `/manage/${e.target.value}`)}>
                  {data?.groups.filter((g) => g.myRole === "LEADER").map((g) => <option key={g.id} value={g.id}>{g.title} ({t.manage.active})</option>)}
                  <option value="groups">{t.manage.listTitle}</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
              <Button variant="ghost" href="/create-group" leftIcon={<Plus size={18} />} className={styles.createButton}>{t.manage.createNewGroup}</Button>
            </div>
          </div>
          <div className={styles.toolbarActions}>
            <Button variant="outline" disabled={isBusy} leftIcon={<Settings size={18} />} onClick={() => { setTitle(group.title); setDescription(group.description); setCapacity(group.maxMembers); setManagementError(null); setDialog("edit"); }}>{t.manage.editSettings}</Button>
            <Button variant="outline" className={styles.closeButton} disabled={isBusy || group.status !== "RECRUITING"} leftIcon={<LockKeyhole size={18} />} onClick={() => { setManagementError(null); setDialog("close"); }}>{t.manage.closeRecruitment}</Button>
          </div>
        </header>

        <Card className={styles.summary}>
          <div className={styles.summaryDescription}>
            <div className={styles.courseLine}>
              {group.courseCode && <Badge variant="primary" mono style={{ borderRadius: "var(--radius-xs)" }}>{group.courseCode}</Badge>}
              <span>{group.courseName || group.department}</span>
            </div>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
            <div className={styles.leaderLine}>
              <span>{t.manage.leader}: <strong>{group.leader.name}</strong></span>
              {!!group.skills?.length && <><span aria-hidden="true">•</span><div className={styles.skillTags}>{group.skills.map((skill) => <Badge key={skill} variant="primary" mono style={{ borderRadius: "var(--radius-xs)" }}>#{skill}</Badge>)}</div></>}
            </div>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <h3>{t.manage.activeMembers}</h3>
              <p className={styles.metricValue}>{group.memberCount}<span>/{group.maxMembers}</span></p>
              <div className={styles.fullness}><CheckCircle2 size={13} />{formatMessage(t.manage.percentFull, { count: Math.round(group.memberCount / Math.max(1, group.maxMembers) * 100) })}</div>
            </div>
            <div className={styles.metric}>
              <h3>{t.manage.totalCapacity}</h3>
              <p className={styles.metricValue}>{group.maxMembers}<span>{t.manage.seats}</span></p>
              <div className={styles.metricDetail}>{t.manage.departmentStandard}</div>
            </div>
            <div className={`${styles.metric} ${styles.pendingMetric}`}>
              <h3>{t.manage.pendingApps}</h3>
              <p className={styles.metricValue}>{pendingApplications.length}<span>{t.manage.reviews}</span></p>
              <div className={styles.metricDetail}>{pendingApplications.length > 0 ? t.manage.highActivity : t.manage.pendingEmpty}</div>
            </div>
            <div className={styles.metric}>
              <h3>{t.manage.recruitment}</h3>
              {recruitmentDays !== null ? <>
                <p className={styles.metricValue}>{recruitmentDays}<span>{t.manage.days}</span></p>
                <div className={styles.metricDetail}>{formatMessage(t.manage.closesOn, { date: new Intl.DateTimeFormat(language, { month: "short", day: "numeric" }).format(new Date(group.recruitmentEndsAt!)) })}</div>
              </> : <p className={styles.metricStatus}>{t.manage.statusNames[group.status]}</p>}
            </div>
          </div>
        </Card>

        <section className={styles.applications}>
          <div className={styles.sectionHeading}>
            <div>
              <div className={styles.sectionTitle}><h2>{t.manage.pendingApplications}</h2><Badge variant="primary" className={styles.countBadge}>{pendingApplications.length}</Badge></div>
              <p>{formatMessage(openSpots === 1 ? t.manage.reviewOneHint : t.manage.reviewHint, { count: openSpots })}</p>
            </div>
            <div className={styles.filters}>
              <span>{t.manage.filter}</span>
              <Button size="sm" variant={frontendOnly ? "outline" : "secondary"} aria-pressed={!frontendOnly} onClick={() => setFrontendOnly(false)}>{t.manage.all} ({pendingApplications.length})</Button>
              <Button size="sm" variant={frontendOnly ? "secondary" : "outline"} aria-pressed={frontendOnly} onClick={() => setFrontendOnly(true)}>{t.manage.frontendFocus}</Button>
            </div>
          </div>
          <div className={styles.applicationList}>
            {filteredApplications.length === 0 ? <EmptyState text={pendingApplications.length ? t.manage.noMatches : t.manage.pendingEmpty} /> : filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} disabled={isBusy}
                acceptDisabled={group.status !== "RECRUITING" || openSpots === 0}
                pendingAction={pendingActions[application.id] ?? null} errorCode={actionErrors[application.id] ?? null}
                onAccept={(id) => handleAction(id, "accept")} onReject={(id) => handleAction(id, "reject")} />
            ))}
          </div>
        </section>

        <Card className={styles.roster}>
          <div className={styles.rosterHeading}>
            <div><h2>{t.manage.roster} ({group.memberCount}/{group.maxMembers})</h2><p>{t.manage.rosterHint}</p></div>
            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={exportRoster}>{t.manage.exportRoster}</Button>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr>{[t.manage.member, t.manage.major, t.manage.role, t.manage.status, t.manage.dateJoined, t.manage.actions].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
              <tbody>{group.members.map((member) => <tr key={member.userId}>
                <td><div className={styles.memberIdentity}><Avatar src={member.avatarUrl} name={member.name} size="md" /><div><strong>{member.name}</strong>{member.email && <span>{member.email}</span>}</div></div></td>
                <td>{member.department || (member.role === "LEADER" ? group.leader.department : "—")}</td>
                <td><Badge variant="primary" mono={member.role !== "LEADER"} style={{ borderRadius: "var(--radius-xs)" }}>
                  <span className={styles.roleLabel}>{member.role === "LEADER" && <Star size={14} fill="currentColor" />}{member.projectRole || (member.role === "LEADER" ? t.manage.leader : t.manage.member)}</span>
                </Badge></td>
                <td><span className={styles.memberStatus}><span />{t.manage.active}</span></td>
                <td className={styles.joinedDate}>{dateFormatter.format(new Date(member.joinedAt))}</td>
                <td className={styles.memberActions}>{member.role === "LEADER" ? <Badge style={{ borderRadius: "var(--radius-xs)" }}>{t.manage.leaderFixed}</Badge> : <div>
                  <Button variant="outline" size="sm" disabled title={t.manage.memberActionsUnavailable}>{t.manage.changeRole}</Button>
                  <Button variant="outline" size="sm" disabled className={styles.closeButton} title={t.manage.memberActionsUnavailable}>{t.manage.remove}</Button>
                </div>}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </Card>
          <Modal isOpen={dialog !== null} onClose={() => { if (!saving) setDialog(null); }} title={dialog === "edit" ? t.manage.editSettings : t.manage.closeRecruitment}>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void saveManagement(); }}>
              {dialog === "edit" && <>
                <Input label={t.manage.groupName} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={150} disabled={saving} />
                <Input label={t.manage.description} value={description} onChange={(e) => setDescription(e.target.value)} required disabled={saving} />
                <Input label={t.manage.capacity} type="number" min={group.memberCount} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required disabled={saving} />
              </>}
              {dialog === "close" && <p>{t.manage.confirmClose}</p>}
              {managementError && <p role="alert" className="text-[var(--error-text)]">{t.apiErrors[managementError]}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setDialog(null)}>{t.manage.cancel}</Button>
                <Button type="submit" isLoading={saving} disabled={dialog === "edit" ? !title.trim() || !description.trim() || !Number.isInteger(capacity) || capacity < group.memberCount : false}>{dialog === "close" ? t.manage.closeRecruitment : t.manage.save}</Button>
              </div>
            </form>
          </Modal>
      </>}
    </div>
  );
}
