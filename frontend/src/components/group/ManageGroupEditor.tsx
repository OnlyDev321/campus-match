"use client";

import { useState } from "react";
import { SlidersHorizontal, LockKeyhole } from "lucide-react";
import { Button, Card, Input } from "@/design-system";
import { validateManageGroup } from "@/lib/manageGroup";
import type { ManageGroupDraft, ManageGroupEditorProps } from "@/lib/types";
import { useLanguageStore } from "@/stores/languageStore";

export default function ManageGroupEditor({ group }: ManageGroupEditorProps) {
  const { t } = useLanguageStore();
  const copy = t.manageDetails;
  const [draft, setDraft] = useState<ManageGroupDraft>({
    title: group.title, description: group.description,
    maxMembers: String(group.maxMembers), status: group.status,
  });
  const errors = validateManageGroup(draft, group.memberCount);
  const valid = !Object.values(errors).some(Boolean);
  function update(field: keyof ManageGroupDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }
  return (
    <Card className="min-w-0 space-y-5 sm:p-6">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--primary)]" />
        <h2 className="text-base font-semibold tracking-tight">{copy.editTitle}</h2>
      </div>
      <div style={{ borderRadius: "var(--radius-input)" }} className="flex items-start gap-2 bg-[var(--surface-container-low)] p-3">
        <LockKeyhole aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{copy.blocked}</p>
      </div>
      <form noValidate className="space-y-5" onSubmit={(event) => {
        event.preventDefault();
        const first = Object.entries(errors).find(([, invalid]) => invalid)?.[0];
        if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      }}>
        <div className="space-y-2">
        <Input name="title" label={copy.groupTitle} required value={draft.title}
          onChange={(e) => update("title", e.target.value)} aria-invalid={errors.title} aria-describedby="edit-title-help" />
        <p id="edit-title-help" className={`text-xs leading-relaxed ${errors.title ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"}`}>{copy.titleRule}</p>
        </div>
        <div className="space-y-2">
        <label htmlFor="edit-description" className="block text-xs font-medium text-[var(--text-secondary)]">{copy.description}</label>
        <textarea id="edit-description" name="description" required rows={5} value={draft.description}
          onChange={(e) => update("description", e.target.value)} aria-invalid={errors.description} aria-describedby="edit-description-help"
          style={{ borderRadius: "var(--radius-input)" }}
          className={`block w-full min-h-32 resize-y p-3 text-sm leading-relaxed bg-[var(--surface)] border ${errors.description ? "border-[var(--error)]" : "border-[var(--border)]"} text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]`} />
        <p id="edit-description-help" className={`text-xs leading-relaxed ${errors.description ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"}`}>{copy.descriptionRule}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
        <div className="space-y-2 min-w-0">
        <Input name="maxMembers" label={copy.capacity} required type="number" min={Math.max(1, group.memberCount)} max={2147483647} step={1}
          value={draft.maxMembers} onChange={(e) => update("maxMembers", e.target.value)} aria-invalid={errors.maxMembers} aria-describedby="edit-capacity-help" />
        <p id="edit-capacity-help" className={`text-xs leading-relaxed ${errors.maxMembers ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"}`}>{copy.capacityRule}</p>
        </div>
        <div className="space-y-2 min-w-0">
        <label htmlFor="edit-status" className="block text-xs font-medium text-[var(--text-secondary)]">{copy.recruitment}</label>
        <select id="edit-status" name="status" value={draft.status} onChange={(e) => update("status", e.target.value)}
          aria-invalid={errors.status} aria-describedby="edit-status-help"
          style={{ borderRadius: "var(--radius-input)" }}
          className={`w-full h-[38px] px-3 text-sm bg-[var(--surface)] border ${errors.status ? "border-[var(--error)]" : "border-[var(--border)]"} text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]`}>
          {(["RECRUITING", "COMPLETED", "CLOSED"] as const).map((status) => <option key={status} value={status}>{t.groupStatus[status]}</option>)}
        </select>
        <p id="edit-status-help" className={`text-xs leading-relaxed ${errors.status ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"}`}>{copy.statusRule}</p>
        </div>
        </div>
        <div role="status" className={`text-sm ${valid ? "text-[var(--text-secondary)]" : "text-[var(--error-text)]"}`}>
          {!valid && copy.invalidDraft}
        </div>
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <Button type="submit" variant="primary" fullWidth disabled aria-describedby="save-blocked">{copy.save}</Button>
        <p id="save-blocked" className="text-xs leading-relaxed text-[var(--text-muted)]">{copy.notSaved}</p>
        </div>
      </form>
    </Card>
  );
}
