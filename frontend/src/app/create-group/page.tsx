"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, Eye, FileText, Layers, Minus, Plus, ShieldCheck, Tags, Users, X } from "lucide-react";
import { Badge, Button, Card, Input } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { createBrowserGroup } from "@/services/browserGroupService";
import type { CreateBrowserGroupPayload, CreateGroupSectionProps, CreateGroupSkillsProps } from "@/lib/types";

const field = "w-full rounded-(--radius-input) border border-(--border-strong) bg-(--surface) px-3 py-2 text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--focus-ring)";

function Section({ title, icon, children }: CreateGroupSectionProps) {
  return (
    <Card>
      <h2 className="mb-5 flex items-center gap-2 border-b border-(--border) pb-4 text-sm font-semibold">
        <span className="rounded-md bg-(--surface-container) p-1.5 text-(--primary)">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function SkillsEditor({ label, values, onChange }: CreateGroupSkillsProps) {
  const { t } = useLanguageStore();
  const copy = t.createGroup;
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  function add() {
    const next = value.trim().replace(/^#+/, "");
    if (!next || values.length >= 10) return;
    if (values.some(item => item.toLowerCase() === next.toLowerCase())) {
      setDuplicate(true);
      return;
    }
    onChange([...values, next]);
    cancel();
  }
  function cancel() {
    setValue("");
    setEditing(false);
    setDuplicate(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {values.map(item => (
          <span key={item} className="inline-flex items-center gap-1 rounded border border-(--border-strong) bg-(--surface-container-low) px-2 py-1 text-xs">
            {item}
            <Button type="button" size="sm" variant="ghost" className="h-6! px-1!" aria-label={copy.removeSkill.replace("{skill}", item)} onClick={() => onChange(values.filter(skill => skill !== item))}>
              <X size={12} />
            </Button>
          </span>
        ))}
        {editing ? (
          <div className="flex flex-wrap items-center gap-1">
            <Input autoFocus aria-label={copy.newSkill} maxLength={30} value={value}
              onChange={event => { setValue(event.target.value); setDuplicate(false); }}
              onKeyDown={event => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); }
                if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); }
              }} />
            <Button type="button" size="sm" variant="outline" onClick={add} aria-label={copy.confirmSkill}><Check size={16} /></Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel} aria-label={copy.cancelSkill}><X size={16} /></Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled={values.length >= 10} onClick={() => setEditing(true)} leftIcon={<Plus size={12} />}>{copy.addSkill}</Button>
        )}
      </div>
      {duplicate && <p role="alert" className="text-xs text-(--error-text)">{copy.duplicateSkill}</p>}
    </div>
  );
}

export default function CreateGroupPage() {
  const { t, language } = useLanguageStore();
  const { user, isLoggedIn, isLoading, openLoginModal } = useAuthStore();
  const router = useRouter();
  const copy = t.createGroup;
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState<CreateBrowserGroupPayload["type"]>("project");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const valid = Boolean(name.trim() && course.trim() && description.trim());

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      openLoginModal("/create-group");
      router.push("/");
    }
  }, [isLoading, isLoggedIn, openLoginModal, router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || saved || !user || !isLoggedIn) return;
    try {
      createBrowserGroup({ title: name.trim(), course: course.trim(), description: description.trim(), type, skills, maxMembers: capacity, openForApplications: open }, user);
      setSaved(true);
      setSaveError(false);
    } catch { setSaveError(true); }
  }

  if (!isLoggedIn || !user) return null;

  return (
    <div lang={language} className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mb-7 mt-1 text-sm text-(--text-secondary)">{copy.subtitle}</p>
      <div className="grid items-start gap-6 @min-[850px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={saved} className="min-w-0 space-y-5 disabled:opacity-70">
            <Section title={copy.basic} icon={<Layers size={16} />}>
              <div className="space-y-4">
                <Input id="group-name" label={`${copy.name} *`} required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder={copy.namePlaceholder} />
                <Input id="group-course" label={`${copy.course} *`} required maxLength={100} value={course} onChange={e => setCourse(e.target.value)} placeholder={copy.coursePlaceholder} />
                <fieldset>
                  <legend className="mb-2 text-xs font-medium">{copy.type} *</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["study", "project"] as const).map(value => (
                      <label key={value} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${type === value ? "border-(--primary) bg-(--primary-soft) ring-1 ring-(--primary)" : "border-(--border-strong)"}`}>
                        <input type="radio" name="group-type" checked={type === value} onChange={() => setType(value)} className="mt-0.5 accent-(--primary)" />
                        <span>
                          <span className="flex items-center gap-1 text-xs font-semibold">{value === "study" ? <BookOpen size={13} /> : <Layers size={13} />}{copy[value]}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-(--text-secondary)">{value === "study" ? copy.studyHint : copy.projectHint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </Section>
            <Section title={copy.introduction} icon={<FileText size={16} />}>
              <div className="mb-2 flex justify-between text-xs">
                <label htmlFor="overview" className="font-medium">{copy.description} *</label>
                <span className="font-mono text-(--text-muted)">{description.length} / 500</span>
              </div>
              <textarea id="overview" required maxLength={500} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder={copy.descriptionPlaceholder} className={field} />
            </Section>
            <Section title={copy.skillsTitle} icon={<Tags size={16} />}>
              <SkillsEditor label={copy.skillsLabel} values={skills} onChange={setSkills} />
            </Section>
            <Section title={copy.recruitment} icon={<Users size={16} />}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium">{copy.capacity}</p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" aria-label={copy.decrease} disabled={capacity <= 2} onClick={() => setCapacity(capacity - 1)}><Minus size={14} /></Button>
                    <span aria-live="polite" className="text-center text-xs font-semibold">{copy.memberCount.replace("{count}", String(capacity))}</span>
                    <Button type="button" variant="outline" size="sm" aria-label={copy.increase} disabled={capacity >= 20} onClick={() => setCapacity(capacity + 1)}><Plus size={14} /></Button>
                  </div>
                  <p className="mt-2 text-xs text-(--text-muted)">{copy.includesLeader}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-(--surface-container-low) p-3">
                  <input type="checkbox" role="switch" checked={open} onChange={e => setOpen(e.target.checked)} className="h-4 w-4 accent-(--secondary)" />
                  <span><span className="block text-xs font-semibold">{open ? copy.open : copy.closed}</span><span className="mt-1 block text-xs text-(--text-muted)">{open ? copy.openHint : copy.closedHint}</span></span>
                </label>
              </div>
            </Section>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <p className={`flex items-center gap-1 text-xs ${valid ? "text-(--secondary)" : "text-(--text-muted)"}`}><ShieldCheck size={14} />{valid ? copy.ready : copy.required}</p>
            <div className="flex gap-2">
              <Button href="/groups" variant="outline">{saved ? copy.viewGroups : copy.cancel}</Button>
              <Button type="submit" disabled={!valid || saved} leftIcon={<Check size={16} />}>{saved ? copy.saved : copy.title}</Button>
            </div>
          </div>
          {(saved || saveError) && <p role="status" className={`rounded-lg border p-3 text-sm ${saved ? "border-(--success-border) bg-(--success-bg) text-(--success-text)" : "border-(--error-border) text-(--error-text)"}`}>{saved ? copy.success : copy.saveError}</p>}
        </form>
        <aside className="@min-[850px]:sticky @min-[850px]:top-20">
          <Section title={copy.preview} icon={<Eye size={16} />}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{course.trim() || copy.course}</Badge>
                <Badge variant={open ? "recruiting" : "closed"} dot>{open ? copy.spots.replace("{count}", String(capacity - 1)) : copy.closed}</Badge>
              </div>
              <h3 className="break-words text-sm font-semibold">{name.trim() || copy.name}</h3>
              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-(--text-secondary)">{description.trim() || copy.previewDescription}</p>
              <div className="flex flex-wrap gap-1.5">{skills.map(skill => <Badge key={skill} variant="primary">{skill}</Badge>)}</div>
              <p className="flex items-center gap-1 border-t border-(--border) pt-3 text-xs text-(--text-muted)"><Users size={13} />{copy.previewMembers.replace("{count}", String(capacity))}</p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
