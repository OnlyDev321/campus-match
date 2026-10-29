"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { PlusCircle, Users, Send, ArrowRight } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  RoleQuota,
  type BadgeVariant,
} from "@/design-system";
import ProfileCard from "./ProfileCard";
import {
  mockUser,
  mockStats,
  mockGroups,
  mockApplications,
  mockApplicants,
} from "@/lib/mockData";
import type {
  GroupStatus,
  ApplicationStatus,
  MyPageTabKey,
  MyGroupCardProps,
  MyGroupColumnProps,
} from "@/lib/types";

// Trang My Page. Toàn bộ phần hiển thị nằm trong file này.
// Khi có API thật, chỉ cần đổi 4 biến mock... thành fetch(), phần dưới giữ nguyên.
// Các số thống kê (active groups, applications sent...) được tính từ danh sách,
// không lưu riêng, để số liệu luôn khớp với những gì hiển thị bên dưới.

type TabKey = MyPageTabKey;

const groupStatusBadge: Record<GroupStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: "active", label: "ACTIVE" },
  recruiting: { variant: "recruiting", label: "RECRUITING" },
  closed: { variant: "closed", label: "CLOSED" },
};

const applicationStatusBadge: Record<
  ApplicationStatus,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "pending", label: "IN REVIEW" },
  accepted: { variant: "active", label: "ACCEPTED" },
  rejected: { variant: "closed", label: "REJECTED" },
};

// "2026-09-27" -> "Sep 27, 2026". Giữ nguyên chuỗi nếu không parse được.
const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Thẻ nhóm dùng chung cho cả 2 cột. Cột "Groups I lead" không cần badge Leader
// (đã rõ qua tiêu đề cột) nên chỉ hiện vai trò; bấm thẻ sẽ mở trang duyệt đơn.
const MyGroupCard = ({ group, href, actionLabel, pendingCount }: MyGroupCardProps) => {
  const status = groupStatusBadge[group.status];

  return (
    <Link href={href} className="block">
      <Card isInteractive className="h-full flex flex-col">
        <CardHeader>
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
        </CardHeader>

        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.description}</CardDescription>

        <CardContent className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            <Badge variant="neutral" size="sm">
              {group.myRole}
            </Badge>
          </div>

          <div className="pt-2">
            <RoleQuota
              current={group.memberCount}
              max={group.maxMembers}
              label="members"
            />
          </div>
        </CardContent>

        <CardFooter>
          <AvatarGroup max={3} total={group.memberCount} size="sm">
            {group.members.map((member) => (
              <Avatar key={member.id} name={member.name} size="sm" />
            ))}
          </AvatarGroup>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            {actionLabel}
            {pendingCount !== undefined && pendingCount > 0 && (
              <Badge variant="pending" size="sm" mono>
                {pendingCount}
              </Badge>
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

const GroupColumn = ({
  title,
  count,
  emptyMessage,
  emptyAction,
  children,
}: MyGroupColumnProps) => (
  <div className="space-y-4 min-w-0">
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
      <span className="font-mono text-[11px] text-[var(--text-faint)]">{count}</span>
    </div>

    {count === 0 ? (
      <div className="p-8 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-center space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {emptyAction}
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-5">{children}</div>
    )}
  </div>
);

const MyPage = () => {
  // Thông tin sinh viên đọc trực tiếp từ hồ sơ SSO u-SAINT của trường
  const user = mockUser;
  const stats = mockStats;
  const groups = mockGroups;
  const applications = mockApplications;

  const [activeTab, setActiveTab] = useState<TabKey>("groups");
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    groups: null,
    applications: null,
  });

  const activeGroups = groups.filter((g) => g.status !== "closed").length;
  const ledGroups = groups.filter((g) => g.isLeader);
  const memberGroups = groups.filter((g) => !g.isLeader);
  // Khi có API thật: lấy số đơn chờ duyệt từ GET /api/groups/{id}/applications.
  const pendingCountFor = (groupId: string) =>
    mockApplicants.filter((a) => a.groupId === groupId).length;
  const inReviewCount = applications.filter((a) => a.status === "pending").length;

  const statCards: { label: string; value: number | string; sublabel: string }[] = [
    {
      label: "Active Groups",
      value: activeGroups,
      sublabel: `${ledGroups.length} Led`,
    },
    {
      label: "Applications Sent",
      value: applications.length,
      sublabel: `${inReviewCount} in review`,
    },
    {
      label: "Group Led",
      value: ledGroups.length,
      sublabel: ledGroups.map((g) => g.name).join(", ") || "None",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      sublabel: "Past Semesters",
    },
  ];

  const tabs: {
    key: TabKey;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "groups", label: "My Groups", count: groups.length, icon: Users },
    {
      key: "applications",
      label: "Applications",
      count: applications.length,
      icon: Send,
    },
  ];

  // Điều hướng tab bằng phím mũi tên / Home / End (WAI-ARIA tablist).
  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextKey = tabs[next].key;
    setActiveTab(nextKey);
    tabRefs.current[nextKey]?.focus();
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile (Read-only u-SAINT verified) */}
      <ProfileCard user={user} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((stat) => (
          <Card key={stat.label} className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono truncate">
              {stat.label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
              {stat.value}
            </p>
            <p
              className="text-xs text-[var(--text-secondary)] truncate"
              title={stat.sublabel}
            >
              {stat.sublabel}
            </p>
          </Card>
        ))}
      </div>

      {/* Tabs: My Groups / Applications */}
      <section className="space-y-5">
        <div
          role="tablist"
          aria-label="My Page sections"
          className="inline-flex items-center p-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-secondary)]"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[tab.key] = el;
                }}
                type="button"
                role="tab"
                id={`mypage-tab-${tab.key}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                aria-controls="mypage-tabpanel"
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isActive
                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
                    : "hover:text-[var(--text-primary)] hover:bg-[var(--surface-container)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] text-[var(--text-faint)]">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="mypage-tabpanel"
          aria-labelledby={`mypage-tab-${activeTab}`}
        >
          {activeTab === "groups" ? (
            // 2 cột: nhóm tôi làm Leader / nhóm tôi là thành viên. Mỗi nhóm chỉ nằm ở 1 cột.
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-start">
              <GroupColumn
                title="Groups I lead"
                count={ledGroups.length}
                emptyMessage="You aren't leading any groups yet."
                emptyAction={
                  <Button
                    href="/create-group"
                    size="sm"
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                  >
                    Create a group
                  </Button>
                }
              >
                {ledGroups.map((group) => (
                  <MyGroupCard
                    key={group.id}
                    group={group}
                    href={`/manage/${group.id}`}
                    actionLabel="Review applications"
                    pendingCount={pendingCountFor(group.id)}
                  />
                ))}
              </GroupColumn>

              <GroupColumn
                title="Groups I'm a member of"
                count={memberGroups.length}
                emptyMessage="You haven't joined any groups yet."
                emptyAction={
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    Browse groups
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              >
                {memberGroups.map((group) => (
                  <MyGroupCard
                    key={group.id}
                    group={group}
                    href={`/groups/${group.id}`}
                    actionLabel="Open"
                  />
                ))}
              </GroupColumn>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-10 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-center space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">
                You haven&apos;t applied to any groups yet.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link
                  href="/groups"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Browse groups
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {applications.map((application) => {
                  const status = applicationStatusBadge[application.status];

                  return (
                    <Card key={application.id} className="h-full flex flex-col">
                      <CardHeader>
                        <span className="font-mono text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
                          {application.courseCode} • {application.courseName}
                        </span>
                        <Badge variant={status.variant} size="sm" dot mono>
                          {status.label}
                        </Badge>
                      </CardHeader>

                      <CardTitle>{application.groupName}</CardTitle>
                      <CardDescription>{application.message}</CardDescription>

                      <CardContent className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 py-1">
                          <Badge variant="neutral" size="sm">
                            {application.appliedRole}
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          Applied {formatDate(application.appliedAt)}
                        </span>
                        <Link
                          href={`/groups/${application.groupId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                        >
                          View group
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyPage;
