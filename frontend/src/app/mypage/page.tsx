"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, PlusCircle, Users, Send, ArrowRight } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  RoleQuota,
  type BadgeVariant,
} from "@/design-system";
import {
  mockUser,
  mockStats,
  mockGroups,
  mockApplications,
  type GroupStatus,
  type ApplicationStatus,
} from "@/lib/mockData";

// Trang My Page. Toàn bộ phần hiển thị nằm trong file này.
// Khi có API thật, chỉ cần đổi 4 biến mock... thành fetch(), phần dưới giữ nguyên.

type TabKey = "groups" | "applications";

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

const MyPage = () => {
  const user = mockUser;
  const stats = mockStats;
  const groups = mockGroups;
  const applications = mockApplications;

  const [activeTab, setActiveTab] = useState<TabKey>("groups");

  const statCards: { label: string; value: number | string; sublabel: string }[] = [
    {
      label: "Active Groups",
      value: stats.activeGroups,
      sublabel: `${stats.groupsLed} Led`,
    },
    {
      label: "Applications Sent",
      value: stats.applicationsSent,
      sublabel: `${stats.applicationsInReview} in review`,
    },
    {
      label: "Group Led",
      value: stats.groupsLed,
      sublabel: stats.groupsLedName,
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

  const isEmpty =
    activeTab === "groups" ? groups.length === 0 : applications.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile */}
      <section className="relative rounded-2xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-1)] overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar src={user.avatarUrl} name={user.name} size="xl" />

          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {user.name}
                </h1>
                <Badge variant="primary" size="sm" mono>
                  {user.cohort}
                </Badge>
              </div>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {user.studentId} • {user.major}
              </p>
            </div>

            <p className="max-w-2xl text-sm text-[var(--text-secondary)] leading-relaxed">
              {user.bio}
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>

            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </a>
          </div>

          <Link
            href="/create-group"
            style={{ borderRadius: "var(--radius-button)" }}
            className="inline-flex items-center justify-center shrink-0 h-8 px-3 gap-1.5 text-xs font-medium bg-(--primary-container) text-white hover:bg-(--primary-hover) active:scale-[0.98] shadow-sm transition-all duration-150"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Group
          </Link>
        </div>
      </section>

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
          className="inline-flex items-center p-1 rounded-lg border border-[var(--border)] bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-secondary)]"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`mypage-tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls="mypage-tabpanel"
                onClick={() => setActiveTab(tab.key)}
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
          {isEmpty ? (
            <div className="p-10 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-center space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">
                {activeTab === "groups"
                  ? "You haven't joined any groups yet."
                  : "You haven't applied to any groups yet."}
              </p>
              <Link
                href="/groups"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Browse groups
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTab === "groups" &&
                groups.map((group) => {
                  const status = groupStatusBadge[group.status];

                  return (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="block"
                    >
                      <Card isInteractive className="h-full flex flex-col">
                        <CardHeader>
                          <span className="font-mono text-xs font-semibold text-(--primary) tracking-wide uppercase">
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
                            {group.isLeader && (
                              <Badge variant="primary" size="sm">
                                Leader
                              </Badge>
                            )}
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
                              <Avatar key={member} name={member} size="sm" />
                            ))}
                          </AvatarGroup>

                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                            Open
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}

              {activeTab === "applications" &&
                applications.map((application) => {
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
                          Applied {application.appliedAt}
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
