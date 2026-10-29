"use client";

import { AlertCircle, Check, Clock, Mail, X } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage, formatRelativeTime } from "@/lib/format";
import type { ApplicationCardProps } from "@/lib/types";

// Card đơn ứng tuyển dành cho leader duyệt (Accept / Reject).

const ApplicationCard = ({
  application,
  onAccept,
  onReject,
  pendingAction = null,
  errorCode = null,
}: ApplicationCardProps) => {
  const { t, language } = useLanguageStore();
  const { id, applicant, statement, createdAt } = application;
  const affiliation = [applicant.faculty, applicant.department].filter(Boolean).join(" · ");
  const isBusy = pendingAction !== null;

  return (
    <Card className="flex flex-col md:flex-row md:items-start gap-5">
      <Avatar name={applicant.name} size="xl" />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            {applicant.name}
          </h3>
          {applicant.department && (
            <Badge variant="neutral" size="sm" mono>
              {applicant.department}
            </Badge>
          )}
          {applicant.academicYear && (
            <Badge variant="primary" size="sm" mono>
              {formatMessage(t.profile.yearBadge, { year: applicant.academicYear })}
            </Badge>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            {formatMessage(t.applicationCard.applied, {
              time: formatRelativeTime(createdAt, language),
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-mono text-[var(--text-muted)]">
          <span>
            {applicant.studentId}
            {affiliation && ` • ${affiliation}`}
          </span>
          {applicant.email && (
            <a
              href={`mailto:${applicant.email}`}
              className="inline-flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {applicant.email}
            </a>
          )}
        </div>

        <blockquote
          style={{ borderRadius: "var(--radius-card)" }}
          className="px-4 py-3 border border-[var(--border)] bg-[var(--surface-container-low)] text-sm text-[var(--text-secondary)] leading-relaxed"
        >
          “{statement}”
        </blockquote>

        {errorCode && (
          <p
            role="alert"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--error-text)]"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {t.apiErrors[errorCode]}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 md:w-[170px] shrink-0">
        <Button
          fullWidth
          leftIcon={<Check className="w-4 h-4" />}
          isLoading={pendingAction === "accept"}
          disabled={isBusy}
          onClick={() => onAccept?.(id)}
        >
          {t.applicationCard.accept}
        </Button>
        <Button
          fullWidth
          variant="outline"
          leftIcon={<X className="w-4 h-4" />}
          isLoading={pendingAction === "reject"}
          disabled={isBusy}
          onClick={() => onReject?.(id)}
        >
          {t.applicationCard.reject}
        </Button>
      </div>
    </Card>
  );
};

export default ApplicationCard;
