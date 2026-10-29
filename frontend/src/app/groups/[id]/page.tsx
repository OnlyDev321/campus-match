"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Sparkles,
  Share2,
  Check,
  CheckCircle2,
  Building2,
  Laptop,
  Mail,
  UserPlus,
  Compass,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, Badge, Button, Avatar, RoleQuota } from "@/design-system";
import ApplyModal from "@/components/application/ApplyModal";
import TranslateButton from "@/components/common/TranslateButton";
import { getGroupDetail } from "@/lib/mockData";
import { useAuthStore } from "@/stores/authStore";
import type { GroupDetailPageProps } from "@/lib/types";

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoggedIn, openLoginModal } = useAuthStore();

  const group = useMemo(() => getGroupDetail(id), [id]);

  // Modal and Interactive States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Translation States
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Group Not Found
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            The group with ID <code className="font-mono text-xs">{id}</code>{" "}
            could not be found or may have been deleted.
          </p>
        </div>
        <Button
          href="/groups"
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Groups
        </Button>
      </div>
    );
  }

  const spotsLeft = Math.max(group.maxMembers - group.memberCount, 0);
  const isFull = spotsLeft === 0;
  const isLeader = Boolean(user && user.name === group.leaderName);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleOpenApply = () => {
    if (!isLoggedIn) {
      openLoginModal(`/groups/${id}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    setHasApplied(true);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-24">
      {/* 1. Sticky / Top Bar with Breadcrumbs & Actions */}
      <div className="group-detail-sticky-bar">
        <div className="max-w-[1360px] mx-auto px-3.5 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium min-w-0">
            <Link
              href="/groups"
              className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Groups</span>
            </Link>
            <span className="text-[var(--border-strong)] shrink-0">/</span>
            <span className="text-[var(--text-muted)] truncate min-w-0 max-w-[110px] sm:max-w-none">
              {group.college}
            </span>
            <span className="text-[var(--border-strong)] hidden md:inline shrink-0">
              /
            </span>
            <span className="text-[var(--text-primary)] font-semibold truncate hidden md:inline min-w-0">
              {group.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              leftIcon={
                copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                )
              }
              className="text-xs px-2.5 sm:px-3 h-8 sm:h-9"
            >
              <span className="hidden sm:inline">
                {copiedLink ? "Link Copied!" : "Share"}
              </span>
              <span className="sm:hidden">
                {copiedLink ? "Copied" : "Share"}
              </span>
            </Button>

            {!isLeader && !isFull && !hasApplied && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenApply}
                leftIcon={<UserPlus className="w-3.5 h-3.5 shrink-0" />}
                className="text-xs font-semibold px-2.5 sm:px-3 h-8 sm:h-9 sm:hidden shrink-0"
              >
                Join
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10 lg:pt-12 min-w-0">
        {/* 2. Hero Header Section */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-5">
          {/* Badges row with comfortable top spacing */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1.5 sm:pt-2">
            <Badge variant="primary" size="sm" className="sm:text-xs font-semibold">
              {group.courseCode
                ? `${group.courseCode} • ${group.course}`
                : group.course}
            </Badge>

            <Badge
              variant={isFull ? "closed" : "recruiting"}
              size="sm"
              dot
              pulse={!isFull}
              className="sm:text-xs font-medium"
            >
              {isFull
                ? "Full • Recruitment Closed"
                : `Recruiting (${spotsLeft} ${spotsLeft === 1 ? "spot left" : "spots left"})`}
            </Badge>

            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-medium bg-[var(--surface-container-low)] text-[var(--text-secondary)] border border-[var(--border)]">
              <Laptop className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              <span>{group.meetingFormat || "Hybrid Meeting"}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-container-low)] border border-[var(--border)]">
              {group.postYear} Academic Year
            </span>
          </div>

          {/* Title & Translate button */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-4 pt-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-snug sm:leading-tight break-words min-w-0">
              {translatedTitle || group.title}
            </h1>
            <div className="shrink-0 self-start sm:pt-1">
              <TranslateButton
                originalText={`${group.title}\n${group.longDescription || group.description}`}
                onTranslated={(translated) => {
                  if (translated) {
                    const parts = translated.split("\n");
                    setTranslatedTitle(parts[0]);
                    setTranslatedDesc(parts.slice(1).join("\n"));
                  } else {
                    setTranslatedTitle(null);
                    setTranslatedDesc(null);
                  }
                }}
              />
            </div>
          </div>

          {/* Department tags & created date */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-[var(--text-muted)] pt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span className="truncate">{group.college}</span>
              <span className="shrink-0">•</span>
              <span className="font-medium text-[var(--text-secondary)] truncate">
                {group.department}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              <span>
                Semester: {group.semester || `${group.postYear} Spring`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              <span>
                Posted on {group.createdAt || `${group.postYear}-03-01`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Two-Column Layout (Main Content 65% + Sticky Sidebar 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start min-w-0">
          {/* LEFT COLUMN: Project Details, Objectives, Roles, Tech Stack */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 min-w-0">
            {/* Section 1: About This Project */}
            <Card className="p-4 sm:p-6 lg:p-7 space-y-4 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 pb-2 border-b border-[var(--border-muted)]">
                <Compass className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  About This Project
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-3 whitespace-pre-line break-words">
                {translatedDesc || group.longDescription || group.description}
              </div>

              {/* Target Objectives */}
              {group.objectives && group.objectives.length > 0 && (
                <div className="pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Target Objectives & Team Goals
                  </h3>
                  <div className="space-y-2 sm:space-y-2.5">
                    {group.objectives.map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] min-w-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                        <span className="break-words min-w-0">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Schedule Box */}
              <div className="mt-4 p-3 sm:p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--border)] flex items-start gap-2.5 sm:gap-3 min-w-0">
                <Clock className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <div className="space-y-0.5 sm:space-y-1 text-xs min-w-0 flex-1">
                  <span className="font-semibold text-[var(--text-primary)] block">
                    Weekly Meeting & Sync-up Schedule
                  </span>
                  <span className="text-[var(--text-secondary)] block break-words">
                    {group.meetingSchedule ||
                      "Weekly on Wednesdays 18:30 (Hybrid Zoom / IT Hall)"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Section 2: Open Roles & Team Composition */}
            <Card className="p-4 sm:p-6 lg:p-7 space-y-4 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-muted)] gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <Users className="w-5 h-5 text-[var(--primary)] shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                    Team Composition & Role Quotas
                  </h2>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  {group.memberCount}/{group.maxMembers} Members
                </span>
              </div>

              {group.rolesQuota && group.rolesQuota.length > 0 ? (
                <div className="space-y-4 pt-1 min-w-0">
                  <RoleQuota
                    variant="detailed"
                    roles={group.rolesQuota}
                    className="space-y-3"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 min-w-0">
                    {group.rolesQuota.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] space-y-1.5 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {r.role}
                          </span>
                          <Badge
                            variant={
                              r.current >= r.max ? "neutral" : "recruiting"
                            }
                            size="sm"
                            className="shrink-0"
                          >
                            {r.current >= r.max ? "Filled" : "Open"}
                          </Badge>
                        </div>
                        {r.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed break-words">
                            {r.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  Standard team slots: {group.memberCount} of {group.maxMembers}{" "}
                  filled.
                </p>
              )}
            </Card>

            {/* Section 3: Tech Stack & Required Skills */}
            <Card className="p-4 sm:p-6 lg:p-7 space-y-4 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 pb-2 border-b border-[var(--border-muted)]">
                <Sparkles className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Tech Stack & Required Skills
                </h2>
              </div>

              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {group.requiredSkills && group.requiredSkills.length > 0 ? (
                    group.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium bg-[var(--surface-container-low)] text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary-soft-border)] transition-colors"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">
                      General development tools (Git, GitHub, VS Code)
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary-soft-border)] text-xs text-[var(--primary)] leading-relaxed min-w-0 break-words">
                  💡 <strong>Notice:</strong> Don&apos;t worry if you don&apos;t
                  meet 100% of the tech stack! Our team values enthusiasm,
                  consistent weekly participation, and the eagerness to learn.
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (CTA Card, Leader Card, Members List) */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 min-w-0 lg:sticky lg:top-20">
            {/* Recruitment Status & Apply CTA Card */}
            <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5 border-2 border-[var(--border-interactive)]/40 shadow-sm min-w-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                  <span>Recruitment Progress</span>
                  <span className="font-mono text-[var(--primary)]">
                    {Math.round((group.memberCount / group.maxMembers) * 100)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((group.memberCount / group.maxMembers) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-0.5">
                  <span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {group.memberCount}
                    </strong>{" "}
                    / {group.maxMembers} Members
                  </span>
                  <span>
                    {isFull ? (
                      <span className="text-[var(--error)] font-medium">
                        No open spots
                      </span>
                    ) : (
                      <span className="text-[var(--success-text)] font-medium">
                        {spotsLeft}{" "}
                        {spotsLeft === 1 ? "spot remaining" : "spots remaining"}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Main Action Button */}
              <div>
                {isLeader ? (
                  <Button
                    href={`/manage/${group.id}`}
                    variant="outline"
                    fullWidth
                    className="h-11 font-semibold"
                    leftIcon={<Users className="w-4 h-4" />}
                  >
                    Manage Applications
                  </Button>
                ) : hasApplied ? (
                  <Button
                    disabled
                    fullWidth
                    className="h-11 font-semibold bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]"
                    leftIcon={
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    }
                  >
                    Application Submitted
                  </Button>
                ) : isFull ? (
                  <Button disabled fullWidth className="h-11 font-semibold">
                    Group Is Full
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleOpenApply}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    className="h-11 font-semibold shadow-sm hover:shadow-md transition-all text-sm"
                  >
                    Apply to Join Group
                  </Button>
                )}
              </div>

              <div className="pt-1 text-center">
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Verified with Soongsil u-SAINT SSO. Applications are reviewed
                  directly by the group leader.
                </p>
              </div>
            </Card>

            {/* Team Leader Profile Card */}
            <Card className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-muted)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Group Leader
                </span>
                <Badge variant="primary" size="sm">
                  Organizer
                </Badge>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <Avatar
                  src={group.leaderAvatarUrl}
                  name={group.leaderName}
                  size="lg"
                  className="ring-2 ring-[var(--border)] shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {group.leaderName}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {group.leaderMajor}
                  </p>
                  {group.leaderStudentId && (
                    <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                      ID: {group.leaderStudentId}
                    </p>
                  )}
                </div>
              </div>

              {group.leaderEmail && (
                <a
                  href={`mailto:${group.leaderEmail}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-container-low)] border border-[var(--border)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)] transition-colors min-w-0 overflow-hidden"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                  <span className="truncate">{group.leaderEmail}</span>
                </a>
              )}
            </Card>

            {/* Current Members List Card */}
            <Card className="p-4 sm:p-5 space-y-3 min-w-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-muted)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Roster ({group.memberCount}/{group.maxMembers})
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {spotsLeft} open
                </span>
              </div>

              <div className="space-y-2">
                {group.membersList?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar
                        src={member.avatarUrl}
                        name={member.name}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                            {member.name}
                          </span>
                          {member.isLeader && (
                            <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary-soft)] px-1.5 py-0.2 rounded border border-[var(--primary-soft-border)] shrink-0">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] truncate block">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Academic Classification Metadata */}
            <Card className="p-4 space-y-2.5 bg-[var(--surface-container-low)] border border-[var(--border)] min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] pb-1 border-b border-[var(--border)]">
                <GraduationCap className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>u-SAINT Academic Classification</span>
              </div>
              <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex justify-between items-center gap-2 min-w-0">
                  <span className="text-[var(--text-muted)] shrink-0">College:</span>
                  <span className="font-medium text-[var(--text-primary)] truncate text-right">
                    {group.college}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 min-w-0">
                  <span className="text-[var(--text-muted)] shrink-0">Department:</span>
                  <span className="font-medium text-[var(--text-primary)] truncate text-right">
                    {group.department}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 min-w-0">
                  <span className="text-[var(--text-muted)] shrink-0">Post Year:</span>
                  <span className="font-mono text-[var(--text-primary)] shrink-0">
                    {group.postYear}
                  </span>
                </div>
                {group.courseCode && (
                  <div className="flex justify-between items-center gap-2 min-w-0">
                    <span className="text-[var(--text-muted)] shrink-0">
                      Course Code:
                    </span>
                    <span className="font-mono text-[var(--primary)] shrink-0">
                      {group.courseCode}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 4. Quick Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        group={group}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
}
