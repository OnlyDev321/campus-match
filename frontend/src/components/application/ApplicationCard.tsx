"use client";

import { Check, Clock, Eye, Link2, X } from "lucide-react";
import { Avatar, Badge, Button, Card, CompatibilityTag } from "@/design-system";
import type { ApplicationCardProps } from "@/lib/types";

// Card đơn ứng tuyển dành cho leader duyệt (Accept / Reject).

const linkClass =
  "inline-flex items-center gap-1.5 text-sm font-mono text-[var(--primary)] hover:underline";

const ApplicationCard = ({ application, onAccept, onReject }: ApplicationCardProps) => {
  const {
    id,
    name,
    avatarUrl,
    department,
    badge,
    appliedAgo,
    skills,
    scheduleMatch,
    message,
    githubUrl,
    portfolioUrl,
  } = application;

  return (
    <Card className="flex flex-col md:flex-row md:items-start gap-5">
      <Avatar src={avatarUrl} name={name} size="xl" />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            {name}
          </h3>
          <Badge variant="neutral" size="sm" mono>
            {department}
          </Badge>
          {badge && (
            <Badge variant="primary" size="sm">
              {badge}
            </Badge>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            Applied {appliedAgo}
          </span>
        </div>

        {(skills.length > 0 || scheduleMatch !== undefined) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {skills.map((skill) => (
              <Badge key={skill} variant="primary" size="sm" mono>
                {skill}
              </Badge>
            ))}
            {scheduleMatch !== undefined && (
              <CompatibilityTag score={scheduleMatch} label="Schedule Match" />
            )}
          </div>
        )}

        <blockquote
          style={{ borderRadius: "var(--radius-card)" }}
          className="px-4 py-3 border border-[var(--border)] bg-[var(--surface-container-low)] text-sm text-[var(--text-secondary)] leading-relaxed"
        >
          “{message}”
        </blockquote>

        {(githubUrl || portfolioUrl) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {githubUrl && (
              <a
                href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <Link2 className="w-4 h-4" />
                {githubUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <Eye className="w-4 h-4" />
                Portfolio Link
              </a>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 md:w-[170px] shrink-0">
        <Button
          fullWidth
          leftIcon={<Check className="w-4 h-4" />}
          onClick={() => onAccept?.(id)}
        >
          Accept Application
        </Button>
        <Button
          fullWidth
          variant="outline"
          leftIcon={<X className="w-4 h-4" />}
          onClick={() => onReject?.(id)}
        >
          Reject
        </Button>
      </div>
    </Card>
  );
};

export default ApplicationCard;
