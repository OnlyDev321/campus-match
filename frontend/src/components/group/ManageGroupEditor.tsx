"use client";

import { useState } from "react";
import { BookOpen, CalendarDays, Mail, Plus, SlidersHorizontal, Trash2, Users } from "lucide-react";
import { Button, Card, Input } from "@/design-system";
import { ScrambleText } from "@/design-system/components/ScrambleText";
import { validateManageGroup } from "@/lib/manageGroup";
import { toApiErrorCode } from "@/lib/api";
import { updateGroup } from "@/services/groupService";
import type { ApiErrorCode, GroupDetailResponse, GroupRoleQuota, ManageGroupDraft, ManageGroupEditorProps, MyGroupSummary, UpdateGroupPayload } from "@/lib/types";
import { useLanguageStore } from "@/stores/languageStore";

const draftFromGroup = (group: MyGroupSummary | GroupDetailResponse): ManageGroupDraft => ({
  title: group.title,
  description: group.description,
  maxMembers: String(group.maxMembers),
  courseCode: group.courseCode ?? "",
  courseName: group.courseName ?? "",
  meetingFormat: group.meetingFormat ?? "",
  tags: [...(group.tags ?? [])],
  contactEmail: group.contactEmail ?? "",
  contactPhone: group.contactPhone ?? "",
  rolesQuota: (group.rolesQuota ?? []).map((role) => ({ ...role })),
});

const payloadFromDraft = (draft: ManageGroupDraft): UpdateGroupPayload => ({
  title: draft.title.trim(),
  description: draft.description.trim(),
  maxMembers: Number(draft.maxMembers),
  courseCode: draft.courseCode.trim() || undefined,
  courseName: draft.courseName.trim() || undefined,
  meetingFormat: draft.meetingFormat || undefined,
  tags: draft.tags.map((tag) => tag.trim()),
  contactEmail: draft.contactEmail.trim() || undefined,
  contactPhone: draft.contactPhone.trim() || undefined,
  rolesQuota: draft.rolesQuota.map((role) => ({
    role: role.role.trim(),
    description: role.description?.trim() || undefined,
    current: role.current,
    max: role.max,
  })),
});

export default function ManageGroupEditor({ group, onSaved }: ManageGroupEditorProps) {
  const { t } = useLanguageStore();
  const copy = t.manageDetails;
  const createCopy = t.createGroupPage;
  const [draft, setDraft] = useState<ManageGroupDraft>(() => draftFromGroup(group));
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiErrorCode | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const errors = validateManageGroup(draft, group.memberCount);
  const valid = !Object.values(errors).some(Boolean);
  const isDirty = JSON.stringify(payloadFromDraft(draft)) !== JSON.stringify(payloadFromDraft(draftFromGroup(group)));
  const allocated = draft.rolesQuota.reduce((sum, role) => sum + role.max, 0);

  function change(next: ManageGroupDraft) {
    setDraft(next);
    setSaveError(null);
    setIsSaved(false);
  }

  function changeCapacity(value: string) {
    const capacity = Number(value);
    const roles = draft.rolesQuota.map((role) => ({ ...role }));
    if (roles.length > 0 && Number.isInteger(capacity) && capacity >= group.memberCount && capacity <= 20) {
      let difference = capacity - roles.reduce((sum, role) => sum + role.max, 0);
      if (difference > 0) roles[roles.length - 1].max += difference;
      else if (difference < 0) {
        for (let i = roles.length - 1; i >= 0 && difference < 0; i--) {
          const removable = Math.min(-difference, roles[i].max - Math.max(1, roles[i].current));
          roles[i].max -= removable;
          difference += removable;
        }
      }
    }
    change({ ...draft, maxMembers: value, rolesQuota: roles });
  }

  function updateRole(index: number, changes: Partial<GroupRoleQuota>) {
    change({ ...draft, rolesQuota: draft.rolesQuota.map((role, i) => i === index ? { ...role, ...changes } : role) });
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (tag && tag.length <= 50 && draft.tags.length < 5 && !draft.tags.includes(tag)) {
      change({ ...draft, tags: [...draft.tags, tag] });
      setTagInput("");
    }
  }

  function addRole() {
    if (draft.rolesQuota.length >= 20 || Number(draft.maxMembers) >= 20) return;
    const nextCapacity = Number(draft.maxMembers) + 1;
    change({ ...draft, maxMembers: String(nextCapacity), rolesQuota: [...draft.rolesQuota, { role: "", description: "", current: 0, max: 1 }] });
  }

  function removeLastRole() {
    const last = draft.rolesQuota.at(-1);
    if (!last || last.current > 0 || draft.rolesQuota.length <= 1) return;
    const nextCapacity = Number(draft.maxMembers) - last.max;
    if (nextCapacity < Math.max(2, group.memberCount)) return;
    change({ ...draft, maxMembers: String(nextCapacity), rolesQuota: draft.rolesQuota.slice(0, -1) });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || !isDirty || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateGroup(group.id, payloadFromDraft(draft));
      setDraft(draftFromGroup(updated));
      onSaved(updated);
      setIsSaved(true);
    } catch (error) {
      setSaveError(toApiErrorCode(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="min-w-0 space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"><SlidersHorizontal aria-hidden="true" className="h-4 w-4" /></span>
        <div><h2 className="text-base font-semibold text-[var(--text-primary)]"><ScrambleText text={copy.editTitle} /></h2><p className="text-xs text-[var(--text-muted)]"><ScrambleText text={copy.editSubtitle} /></p></div>
      </div>
      <form noValidate className="space-y-7" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><BookOpen aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" /><ScrambleText text={createCopy.basicInfoTitle} /></div>
          <Input name="title" label={copy.groupTitle} required maxLength={150} value={draft.title} onChange={(e) => change({ ...draft, title: e.target.value })} aria-invalid={errors.title} helperText={copy.titleRule} />
          <div className="space-y-1.5"><label htmlFor="edit-description" className="text-xs font-medium text-[var(--text-secondary)]"><ScrambleText text={copy.description} /></label><textarea id="edit-description" name="description" required rows={5} value={draft.description} onChange={(e) => change({ ...draft, description: e.target.value })} aria-invalid={errors.description} className="w-full min-h-28 resize-y rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" /><p className="text-xs text-[var(--text-muted)]"><ScrambleText text={copy.descriptionRule} /></p></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label={createCopy.courseCodeLabel} maxLength={50} value={draft.courseCode} onChange={(e) => change({ ...draft, courseCode: e.target.value.toUpperCase() })} /><Input label={createCopy.courseNameLabel} maxLength={100} value={draft.courseName} onChange={(e) => change({ ...draft, courseName: e.target.value })} /></div>
        </section>

        <section className="space-y-4 border-t border-[var(--border-muted)] pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><CalendarDays aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" /><ScrambleText text={createCopy.meetingFormatLabel} /></div>
          <div className="grid gap-2 sm:grid-cols-3">{(["Online", "Offline", "Hybrid"] as const).map((format) => <button key={format} type="button" aria-pressed={draft.meetingFormat === format} onClick={() => change({ ...draft, meetingFormat: format })} className={`rounded-[var(--radius-input)] border p-3 text-left transition-colors ${draft.meetingFormat === format ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"}`}><span className="block text-sm font-semibold">{createCopy[`format${format}`]}</span><span className="mt-1 block text-xs leading-relaxed">{createCopy[`format${format}Desc`]}</span></button>)}</div>
          {!draft.meetingFormat && <p className="text-xs text-[var(--text-muted)]"><ScrambleText text={t.groupDetail.meetingFormatFallback} /></p>}
          <div className="space-y-2"><label htmlFor="manage-tags" className="text-xs font-medium text-[var(--text-secondary)]"><ScrambleText text={createCopy.tagsLabel} /></label><div className="flex flex-wrap gap-2">{draft.tags.map((tag) => <button key={tag} type="button" onClick={() => change({ ...draft, tags: draft.tags.filter((item) => item !== tag) })} aria-label={createCopy.removeTag.replace("{tag}", tag)} className="rounded-lg border border-[var(--primary-soft-border)] bg-[var(--primary-soft)] px-2.5 py-1 text-xs text-[var(--primary)]">#{tag} ×</button>)}</div>{draft.tags.length < 5 && <Input id="manage-tags" maxLength={50} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} placeholder={createCopy.tagsPlaceholder} helperText={createCopy.tagsHelp} />}</div>
        </section>

        <section className="space-y-4 border-t border-[var(--border-muted)] pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><Users aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" /><ScrambleText text={createCopy.capacityTitle} /></div>
          <Input name="maxMembers" label={createCopy.maxMembersLabel} type="number" min={Math.max(2, group.memberCount)} max={20} step={1} value={draft.maxMembers} onChange={(e) => changeCapacity(e.target.value)} aria-invalid={errors.maxMembers} helperText={copy.capacityRule} />
          <div className="rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-container-low)] p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-[var(--text-primary)]"><ScrambleText text={createCopy.rolesSectionTitle} /></p><p className="text-xs text-[var(--text-muted)]"><ScrambleText text={createCopy.rolesSectionSubtitle} /></p></div><Button type="button" size="sm" variant="outline" onClick={addRole} disabled={Number(draft.maxMembers) >= 20} leftIcon={<Plus className="h-3.5 w-3.5" />}><ScrambleText text={createCopy.addRoleBtn} /></Button></div>
            {draft.rolesQuota.map((role, index) => <div key={index} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[1fr_1fr_110px_auto] sm:items-end"><Input label={createCopy.roleNameLabel} maxLength={100} value={role.role} onChange={(e) => updateRole(index, { role: e.target.value })} /><Input label={createCopy.roleDescLabel} maxLength={500} value={role.description ?? ""} onChange={(e) => updateRole(index, { description: e.target.value })} /><div><Input label={createCopy.roleQuotaLabel} type="number" min={Math.max(1, role.current)} max={20} value={role.max} onChange={(e) => updateRole(index, { max: Number(e.target.value) })} /><p className="mt-1 text-[11px] text-[var(--text-muted)]">{copy.occupiedSeats.replace("{count}", String(role.current))}</p></div><Button type="button" variant="ghost" aria-label={createCopy.deleteRole} disabled={index !== draft.rolesQuota.length - 1 || role.current > 0 || draft.rolesQuota.length <= 1 || Number(draft.maxMembers) - role.max < Math.max(2, group.memberCount)} onClick={removeLastRole} className="h-10 w-10 p-0"><Trash2 className="h-4 w-4" /></Button></div>)}
            <p className={`text-xs ${errors.rolesQuota ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"}`}><ScrambleText text={createCopy.rolesSyncHelp.replace("{total}", String(allocated)).replace("{max}", draft.maxMembers)} /></p>
          </div>
        </section>

        <section className="space-y-4 border-t border-[var(--border-muted)] pt-6"><div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><Mail aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" /><ScrambleText text={copy.contactTitle} /></div><p className="text-xs text-[var(--text-muted)]"><ScrambleText text={copy.contactHint} /></p><div className="grid gap-4 sm:grid-cols-2"><Input label={createCopy.contactEmailLabel} type="email" maxLength={254} value={draft.contactEmail} onChange={(e) => change({ ...draft, contactEmail: e.target.value })} aria-invalid={errors.contactEmail} /><Input label={createCopy.contactPhoneLabel} type="tel" maxLength={25} value={draft.contactPhone} onChange={(e) => change({ ...draft, contactPhone: e.target.value })} aria-invalid={errors.contactPhone} /></div></section>

        {!valid && <p role="status" className="text-sm text-[var(--error-text)]"><ScrambleText text={copy.invalidDraft} /></p>}
        <div className="space-y-3 border-t border-[var(--border)] pt-5"><Button type="submit" variant="primary" disabled={!valid || !isDirty || isSaving} isLoading={isSaving} className="h-11 w-full sm:w-auto sm:min-w-40"><ScrambleText text={copy.save} /></Button>{saveError && <p role="alert" className="text-xs text-[var(--error-text)]"><ScrambleText text={t.apiErrors[saveError]} /></p>}{isSaved && <p role="status" className="text-xs text-[var(--success-text)]"><ScrambleText text={copy.saved} /></p>}</div>
      </form>
    </Card>
  );
}
