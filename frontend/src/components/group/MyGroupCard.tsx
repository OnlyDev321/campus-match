"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage } from "@/lib/format";
import type { GroupStatusCode, MyGroupCardProps } from "@/lib/types";

// Thẻ nhóm của tôi (tab "My groups" trên trang /groups).
// - variant "lead": mở /manage/[groupId] để duyệt đơn ứng tuyển của nhóm.
// - variant "member": mở trang chi tiết nhóm /groups/[id].

const statusVariant: Record<GroupStatusCode, BadgeVariant> = {
  RECRUITING: "recruiting",
  COMPLETED: "active",
  CLOSED: "closed",
};

const MyGroupCard = ({ group, variant }: MyGroupCardProps) => {
  const { t } = useLanguageStore();
  const isLead = variant === "lead";
  const href = isLead ? `/manage/${group.id}` : `/groups/${group.id}`;
  const courseLabel = [group.courseCode, group.courseName].filter(Boolean).join(" • ");

  return (
    <Link href={href} className="block">
      <Card isInteractive className="h-full flex flex-col">
        <CardHeader>
          <span className="font-mono text-xs font-semibold text-[var(--primary)] tracking-wide uppercase truncate">
            {courseLabel || group.department}
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
        </CardHeader>

        <CardTitle>{group.title}</CardTitle>
        <CardDescription>{group.description}</CardDescription>

        <CardContent className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            <Badge variant={group.myRole === "LEADER" ? "primary" : "neutral"} size="sm">
              {group.myRole === "LEADER" ? t.myGroupCard.leader : t.myGroupCard.member}
            </Badge>
            {isLead && group.pendingApplicationCount > 0 && (
              <Badge variant="pending" size="sm" mono>
                {formatMessage(t.myGroupCard.pendingCount, {
                  count: group.pendingApplicationCount,
                })}
              </Badge>
            )}
          </div>

          <div className="pt-2">
            <RoleQuota
              current={group.memberCount}
              max={group.maxMembers}
              label={t.myGroupCard.membersLabel}
            />
          </div>
        </CardContent>

        <CardFooter>
          <AvatarGroup max={3} total={group.memberCount} size="sm">
            {group.members.map((member) => (
              <Avatar key={member.userId} name={member.name} size="sm" />
            ))}
          </AvatarGroup>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
            {isLead ? t.myGroupCard.reviewApplications : t.myGroupCard.open}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default MyGroupCard;
