"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { AlertCircle, Check, Clock3, Code2, ExternalLink, Link2, Mail, X } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage, formatRelativeTime, visibleStudentId, visibleStudentEmail } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
import type { ApplicationCardProps } from "@/lib/types";

// Đơn cũ chỉ có lời nhắn; đơn mới có metadata ở các dòng cuối.
const parseStatement = (statement: string) => {
  const lines = statement.split(/\r?\n/);
  const details: Record<"role" | "skills" | "github" | "portfolio", string> = {
    role: "", skills: "", github: "", portfolio: "",
  };
  while (lines.length > 0) {
    const match = lines[lines.length - 1].match(/^(Role|Skills|GitHub|Portfolio):\s*(.+)$/);
    if (!match) break;
    const key = match[1].toLowerCase() as keyof typeof details;
    if (details[key]) break;
    details[key] = match[2].trim();
    lines.pop();
  }
  return { introduction: lines.join("\n").trim(), ...details };
};

const externalHref = (value: string): string | null => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
};

const ApplicationCard = ({
  application, onAccept, onReject, pendingAction = null, acceptDisabled = false, errorCode = null,
}: ApplicationCardProps) => {
  const { t, language } = useLanguageStore();
  const { id, applicant, statement, createdAt } = application;
  const viewerStudentId = useAuthStore((state) => state.user?.studentId);
  const applicantEmail = visibleStudentEmail(applicant.email, applicant.studentId, viewerStudentId);
  const affiliation = [applicant.faculty, applicant.department].filter(Boolean).join(" · ");
  const isBusy = pendingAction !== null;
  const { introduction, role, skills, github, portfolio } = parseStatement(statement);
  const githubHref = github ? externalHref(github) : null;
  const portfolioHref = portfolio ? externalHref(portfolio) : null;

  return (
    <Card className="min-w-0 space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar src={applicant.avatarUrl ?? undefined} name={applicant.name} size="lg" className="shrink-0" />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {applicant.name}
              </h3>
              {applicant.academicYear && (
                <Badge variant="primary" size="sm">
                  <ScrambleText text={formatMessage(t.profile.yearBadge, { year: applicant.academicYear })} protectedValues={[applicant.academicYear]} />
                </Badge>
              )}
            </div>
            <p className="break-words text-xs leading-relaxed text-[var(--text-secondary)]">
              {visibleStudentId(applicant.studentId, viewerStudentId)}
              {affiliation && ` · ${affiliation}`}
            </p>
            {applicantEmail && (
              <a href={`mailto:${applicantEmail}`} className="inline-flex max-w-full items-center gap-1.5 text-xs text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)">
                <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{applicantEmail}</span>
              </a>
            )}
          </div>
        </div>
        <Badge variant="pending" size="sm" dot className="shrink-0">
          <ScrambleText text={t.applicationCard.pending} />
        </Badge>
      </div>

      <div className="min-w-0 space-y-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-container-low)] p-4 sm:p-5">
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          <ScrambleText text={t.applicationCard.introduction} />
        </p>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-primary)]">
          {introduction || statement}
        </p>
      </div>

      {(role || skills || github || portfolio) && (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {role && (
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-[var(--text-muted)]"><ScrambleText text={t.applicationCard.role} /></p>
              <p className="break-words text-sm font-semibold text-[var(--text-primary)]">{role}</p>
            </div>
          )}
          {skills && (
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-[var(--text-muted)]"><ScrambleText text={t.applicationCard.skills} /></p>
              <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">{skills}</p>
            </div>
          )}
          {(github || portfolio) && (
            <div className="min-w-0 space-y-2 sm:col-span-2">
              <p className="text-xs font-medium text-[var(--text-muted)]"><ScrambleText text={t.applicationCard.links} /></p>
              <div className="flex flex-wrap gap-2">
                {github && (
                  <div className="flex min-w-0 max-w-full items-center gap-2 rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
                    <Code2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                    <span className="shrink-0 font-medium text-[var(--text-primary)]">{t.applicationCard.github}</span>
                    {githubHref ? <a href={githubHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)">
                      <span className="truncate">{github}</span><ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                    </a> : <span className="min-w-0 truncate text-[var(--text-secondary)]">{github}</span>}
                  </div>
                )}
                {portfolio && (
                  <div className="flex min-w-0 max-w-full items-center gap-2 rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
                    <Link2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                    <span className="shrink-0 font-medium text-[var(--text-primary)]">{t.applicationCard.portfolio}</span>
                    {portfolioHref ? <a href={portfolioHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)">
                      <span className="truncate">{portfolio}</span><ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                    </a> : <span className="min-w-0 truncate text-[var(--text-secondary)]">{portfolio}</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {errorCode && (
        <p role="alert" className="inline-flex items-center gap-1.5 text-xs text-[var(--error-text)]">
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <ScrambleText text={t.apiErrors[errorCode]} />
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-[var(--border-muted)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <ScrambleText text={formatMessage(t.applicationCard.applied, { time: formatRelativeTime(createdAt, language) })}
            protectedValues={[formatRelativeTime(createdAt, language)]} />
        </span>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="outline" className="h-10 min-w-28" leftIcon={<X aria-hidden="true" className="h-4 w-4" />}
            isLoading={pendingAction === "reject"} disabled={isBusy} onClick={() => onReject?.(id)}>
            <ScrambleText text={t.applicationCard.reject} />
          </Button>
          <Button className="h-10 min-w-28" leftIcon={<Check aria-hidden="true" className="h-4 w-4" />}
            isLoading={pendingAction === "accept"} disabled={isBusy || acceptDisabled} onClick={() => onAccept?.(id)}>
            <ScrambleText text={t.applicationCard.accept} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ApplicationCard;
