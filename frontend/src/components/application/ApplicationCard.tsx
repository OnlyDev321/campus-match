"use client";

import { AlertCircle, Check, Clock, Eye, Link as LinkIcon, X } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { formatMessage, formatRelativeTime } from "@/lib/format";
import type { ApplicationCardProps } from "@/lib/types";
import styles from "./ApplicationCard.module.css";

const publicUrl = (value?: string) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch { return null; }
};

export default function ApplicationCard({ application, acceptDisabled = false, disabled = false, onAccept, onReject, pendingAction = null, errorCode = null }: ApplicationCardProps) {
  const { t, language } = useLanguageStore();
  const { id, applicant, statement, createdAt } = application;
  const isBusy = disabled || pendingAction !== null;
  const affiliation = [applicant.department, applicant.academicYear ? formatMessage(t.profile.yearBadge, { year: applicant.academicYear }) : null].filter(Boolean).join(" · ");
  const github = publicUrl(application.githubUrl);
  const portfolio = publicUrl(application.portfolioUrl);
  const badgeStyle = { borderRadius: "var(--radius-xs)" };

  return (
    <Card className={styles.card}>
      <Avatar src={applicant.avatarUrl} name={applicant.name} size="xl" className={styles.avatar} />
      <div className={styles.body}>
        <div className={styles.heading}>
          <h3>{applicant.name}</h3>
          {affiliation && <Badge mono className={styles.affiliation} style={badgeStyle}>{affiliation}</Badge>}
          {application.isHonorsStudent && <Badge variant="primary" className={styles.honors} style={badgeStyle}>{t.manage.honorsStudent}</Badge>}
          <span className={styles.applied}><Clock size={13} />{formatMessage(t.applicationCard.applied, { time: formatRelativeTime(createdAt, language) })}</span>
        </div>
        {(!!application.skills?.length || application.scheduleMatch !== undefined) && <div className={styles.skills}>
          {application.skills?.map((skill) => <Badge key={skill} variant="primary" mono style={badgeStyle}>{skill}</Badge>)}
          {application.scheduleMatch !== undefined && <Badge variant="active" dot mono style={badgeStyle}>{formatMessage(t.manage.scheduleMatch, { count: application.scheduleMatch })}</Badge>}
        </div>}
        <blockquote className={styles.statement}>“{statement}”</blockquote>
        {(github || portfolio) && <div className={styles.links}>
          {github && <a href={github.href} target="_blank" rel="noopener noreferrer"><LinkIcon size={15} />{github.hostname}{github.pathname}</a>}
          {portfolio && <a href={portfolio.href} target="_blank" rel="noopener noreferrer"><Eye size={16} />{t.manage.portfolioLink}</a>}
        </div>}
        {errorCode && <p role="alert" className={styles.error}><AlertCircle size={14} />{t.apiErrors[errorCode]}</p>}
      </div>
      <div className={styles.actions}>
        <Button fullWidth leftIcon={<Check size={17} />} isLoading={pendingAction === "accept"} disabled={isBusy || acceptDisabled} onClick={() => onAccept?.(id)}>{t.applicationCard.accept}</Button>
        <Button fullWidth variant="outline" leftIcon={<X size={17} />} isLoading={pendingAction === "reject"} disabled={isBusy} onClick={() => onReject?.(id)}>{t.applicationCard.reject}</Button>
      </div>
    </Card>
  );
}
