"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { GroupCardProps } from "@/lib/types";

const GroupCard = ({ group, onJoin }: GroupCardProps) => {
  const {
    id,
    course,
    title,
    description,
    college,
    department,
    postYear,
    leaderName,
    leaderAvatarUrl,
    leaderMajor,
    memberCount,
    maxMembers,
  } = group;

  const spotsLeft = Math.max(maxMembers - memberCount, 0);
  const isFull = spotsLeft === 0;

  return (
    <Card className="h-full flex flex-col gap-4 p-6 hover:shadow-(--shadow-level-2) hover:border-(--border-strong)">
      <CardHeader className="mb-0 flex-wrap items-center">
        <Badge variant="primary" className="font-medium">
          {course}
        </Badge>
        <Badge variant={isFull ? "closed" : "recruiting"} dot>
          {isFull
            ? "Full"
            : `Recruiting (${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"})`}
        </Badge>
      </CardHeader>

      <div className="space-y-1.5">
        <CardTitle className="text-base font-semibold leading-snug">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {description}
        </CardDescription>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 flex-1 content-start">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-soft-border)]">
          {college}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--surface-container-low)] text-[var(--text-secondary)] border border-[var(--border)]">
          {department}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-container-low)] border border-[var(--border)]">
          {postYear}년
        </span>
      </div>

      <CardFooter className="pt-3 border-t border-[var(--border-muted)]">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar
            src={leaderAvatarUrl}
            name={leaderName}
            size="md"
            className="ring-1 ring-[var(--border)] shrink-0"
          />
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {leaderName}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] truncate">
              {leaderMajor}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right pl-2">
          <span className="text-xs font-semibold text-[var(--text-primary)] font-mono">
            {memberCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            /{maxMembers} members
          </span>
        </div>
      </CardFooter>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button
          href={`/groups/${id}`}
          variant="outline"
          className="h-10 text-xs font-semibold"
        >
          View Details
        </Button>
        <Button
          className="h-10 text-xs font-semibold"
          disabled={isFull}
          onClick={() => onJoin?.(id)}
        >
          Join
        </Button>
      </div>
    </Card>
  );
};

export default GroupCard;
