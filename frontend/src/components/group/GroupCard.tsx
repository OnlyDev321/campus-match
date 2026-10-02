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

export interface GroupCardData {
  id: string;
  course: string;
  title: string;
  description: string;
  tags: string[];
  leaderName: string;
  leaderAvatarUrl?: string;
  leaderMajor: string;
  memberCount: number;
  maxMembers: number;
}

export interface GroupCardProps {
  group: GroupCardData;
  onJoin?: (id: string) => void;
}

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
    <Card className="h-full flex flex-col gap-4 p-6">
      <CardHeader className="mb-0 flex-wrap items-center">
        <Badge variant="primary" mono>
          {course}
        </Badge>
        <Badge variant={isFull ? "closed" : "recruiting"} dot>
          {isFull
            ? "Full"
            : `Recruiting (${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"})`}
        </Badge>
      </CardHeader>

      <div className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>

      <div className="flex flex-wrap gap-2 flex-1 content-start">
        {tags.map((tag) => (
          <Badge key={tag} variant="neutral" size="sm" mono>
            #{tag}
          </Badge>
        ))}
      </div>

      <CardFooter className="pt-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar src={leaderAvatarUrl} name={leaderName} size="lg" />
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {leaderName}
          </span>
          <span className="text-sm font-medium text-[var(--text-muted)] truncate">
            · {leaderMajor}
          </span>
        </div>
        <span className="shrink-0 text-sm font-mono text-[var(--text-secondary)]">
          {memberCount} / {maxMembers} members
        </span>
      </CardFooter>

      <div className="grid grid-cols-2 gap-3">
        <Button href={`/groups/${id}`} variant="outline" className="h-11">
          View Details
        </Button>
        <Button className="h-11" disabled={isFull} onClick={() => onJoin?.(id)}>
          Join
        </Button>
      </div>
    </Card>
  );
};

export default GroupCard;
