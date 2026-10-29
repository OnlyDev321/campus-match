"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/design-system";
import type { CardSkeletonListProps, EmptyStateProps, ErrorStateProps } from "@/lib/types";

// Các khung trạng thái dùng chung khi tải dữ liệu từ services/: loading (skeleton), lỗi, rỗng.

export const CardSkeletonList = ({ count = 2 }: CardSkeletonListProps) => (
  <div className="space-y-5" aria-busy="true">
    {Array.from({ length: count }, (_, index) => (
      <Card key={index} className="space-y-3 animate-pulse">
        <div className="h-3 w-1/3 rounded bg-[var(--surface-container)]" />
        <div className="h-5 w-2/3 rounded bg-[var(--surface-container)]" />
        <div className="h-3 w-full rounded bg-[var(--surface-container)]" />
        <div className="h-3 w-5/6 rounded bg-[var(--surface-container)]" />
      </Card>
    ))}
  </div>
);

export const EmptyState = ({ text, action }: EmptyStateProps) => (
  <div className="p-10 rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-center space-y-2">
    <p className="text-sm text-[var(--text-secondary)]">{text}</p>
    {action && (
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">{action}</div>
    )}
  </div>
);

export const ErrorState = ({ title, message, retryLabel, onRetry }: ErrorStateProps) => (
  <div
    role="alert"
    className="p-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-container-low)] text-center space-y-2"
  >
    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
      <AlertCircle className="w-4 h-4 text-[var(--error)]" />
      {title}
    </p>
    <p className="text-xs text-[var(--text-secondary)]">{message}</p>
    {onRetry && retryLabel && (
      <div className="pt-1">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      </div>
    )}
  </div>
);
