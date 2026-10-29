"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge, Button, RoleQuota, type BadgeVariant } from "@/design-system";
import ApplicationCard from "@/components/application/ApplicationCard";
import { mockApplicants, mockGroups } from "@/lib/mockData";
import type { GroupStatus, ManageGroupPageProps } from "@/lib/types";

// Trang Leader duyệt đơn ứng tuyển của MỘT nhóm (mở từ cột "Groups I lead" ở My Page).
// Khi có API thật:
// - Nhóm: GET /api/groups/{groupId} (quyền Leader kiểm tra ở server).
// - Danh sách đơn: GET /api/groups/{groupId}/applications.
// - Duyệt / từ chối: PUT /api/applications/{id}/accept | /reject, xong mới cập nhật danh sách.

const groupStatusBadge: Record<GroupStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: "active", label: "ACTIVE" },
  recruiting: { variant: "recruiting", label: "RECRUITING" },
  closed: { variant: "closed", label: "CLOSED" },
};

const ManageGroupPage = ({ params }: ManageGroupPageProps) => {
  const { groupId } = use(params);
  const group = mockGroups.find((g) => g.id === groupId);

  const [applicants, setApplicants] = useState(() =>
    mockApplicants.filter((a) => a.groupId === groupId),
  );

  const removeApplicant = (id: string) =>
    setApplicants((prev) => prev.filter((a) => a.id !== id));

  // Không tìm thấy nhóm, hoặc tôi không phải Leader của nhóm này.
  if (!group || !group.isLeader) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {group ? "Not Your Group" : "Group Not Found"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {group
              ? "Only the group leader can review applications for this group."
              : "This group could not be found or may have been deleted."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            href="/mypage"
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to My Page
          </Button>
          {group && (
            <Button
              href={`/groups/${group.id}`}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View group
            </Button>
          )}
        </div>
      </div>
    );
  }

  const status = groupStatusBadge[group.status];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/mypage"
        className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        My Page
      </Link>

      {/* Group header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-[var(--primary)] tracking-wide uppercase">
              {group.courseCode} • {group.courseName}
            </span>
            <Badge
              variant={status.variant}
              size="sm"
              dot
              pulse={group.status === "recruiting"}
              mono
            >
              {status.label}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {group.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Applications{" "}
            <span className="font-mono text-[var(--text-muted)]">{applicants.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-40">
            <RoleQuota
              current={group.memberCount}
              max={group.maxMembers}
              label="members"
            />
          </div>
          <Button
            href={`/groups/${group.id}`}
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View group
          </Button>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="p-10 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            No pending applications for this group.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAccept={removeApplicant}
              onReject={removeApplicant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageGroupPage;
