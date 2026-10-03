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
    tags,
    leaderName,
    leaderAvatarUrl,
    leaderMajor,
    memberCount,
    maxMembers,
  } = group;

  const spotsLeft = Math.max(maxMembers - memberCount, 0);
  const isFull = spotsLeft === 0;

  return (
    <Card className="h-full flex flex-col gap-4 p-6 transition-all duration-200 hover:shadow-(--shadow-level-2) hover:border-(--border-strong)">
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

      <div className="flex flex-wrap gap-1.5 flex-1 content-start">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[var(--surface-container-low)] text-[var(--text-secondary)] border border-[var(--border)] transition-colors hover:border-[var(--border-strong)]"
          >
            #{tag}
          </span>
        ))}
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
