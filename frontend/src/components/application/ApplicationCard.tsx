"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { AlertCircle, Check, Clock, Mail, X } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage, formatRelativeTime, visibleStudentId, visibleStudentEmail } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
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
  const viewerStudentId = useAuthStore((state) => state.user?.studentId);
  const applicantEmail = visibleStudentEmail(applicant.email, applicant.studentId, viewerStudentId);
  const affiliation = [applicant.faculty, applicant.department].filter(Boolean).join(" · ");
  const isBusy = pendingAction !== null;

  return (
    <Card className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 sm:gap-x-4 @min-[800px]:grid-cols-[auto_minmax(0,1fr)_auto]">
      <Avatar name={applicant.name} size="lg" />

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="break-words text-base font-semibold tracking-tight text-[var(--text-primary)]">
            {applicant.name}
          </h3>
          {applicant.department && (
            <Badge variant="neutral" size="sm" mono>
              {applicant.department}
            </Badge>
          )}
          {applicant.academicYear && (
            <Badge variant="primary" size="sm" mono>
              <ScrambleText text={formatMessage(t.profile.yearBadge, { year: applicant.academicYear })} protectedValues={[...Object.values({ year: applicant.academicYear })]} />
            </Badge>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Clock aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
            <ScrambleText text={formatMessage(t.applicationCard.applied, {
              time: formatRelativeTime(createdAt, language),
            })} protectedValues={[...Object.values({
              time: formatRelativeTime(createdAt, language),
            })]} />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          <span className="break-words">
            {visibleStudentId(applicant.studentId, viewerStudentId)}
            {affiliation && ` • ${affiliation}`}
          </span>
          {applicantEmail && (
            <a
              href={`mailto:${applicantEmail}`}
              className="inline-flex min-w-0 max-w-full items-start gap-1.5 rounded-sm hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) transition-colors"
            >
              <Mail aria-hidden="true" className="mt-0.5 w-3.5 h-3.5 shrink-0" />
              <span className="break-all">{applicantEmail}</span>
            </a>
          )}
        </div>

        <blockquote
          style={{ borderRadius: "var(--radius-card)" }}
          className="break-words px-3 py-3 sm:px-4 border border-[var(--border)] bg-[var(--surface-container-low)] text-sm text-[var(--text-secondary)] leading-relaxed"
        >
          “{statement}”
        </blockquote>

        {errorCode && (
          <p
            role="alert"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--error-text)]"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <ScrambleText text={t.apiErrors[errorCode]} />
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 grid grid-cols-2 gap-2 border-t border-(--border-muted) pt-4 @min-[800px]:col-span-1 @min-[800px]:w-36 @min-[800px]:grid-cols-1 @min-[800px]:border-t-0 @min-[800px]:pt-0">
        <Button
          fullWidth
          className="h-11 sm:h-9"
          leftIcon={<Check className="w-4 h-4" />}
          isLoading={pendingAction === "accept"}
          disabled={isBusy}
          onClick={() => onAccept?.(id)}
        >
          <ScrambleText text={t.applicationCard.accept} />
        </Button>
        <Button
          fullWidth
          className="h-11 sm:h-9"
          variant="outline"
          leftIcon={<X className="w-4 h-4" />}
          isLoading={pendingAction === "reject"}
          disabled={isBusy}
          onClick={() => onReject?.(id)}
        >
          <ScrambleText text={t.applicationCard.reject} />
        </Button>
      </div>
    </Card>
  );
};

export default ApplicationCard;
