"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, FileText, Layers, Minus, Plus, ShieldCheck, Tags, Users, X } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, CardContent, Checkbox, Input, Radio } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { createBrowserGroup } from "@/services/browserGroupService";
import type { CreateBrowserGroupPayload, CreateGroupSectionProps, CreateGroupSkillsProps } from "@/lib/types";

const field = "w-full rounded-(--radius-input) border border-(--border-strong) bg-(--surface) px-3 py-2 text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--focus-ring)";

function Section({ title, icon, children }: CreateGroupSectionProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <CardHeader className="items-center gap-2.5 border-b border-(--border-muted) pb-4">
        <span className="inline-flex shrink-0 rounded-(--radius-sm) bg-(--primary-soft) p-2 text-(--primary)">{icon}</span>
        <CardTitle className="flex-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 mb-0">{children}</CardContent>
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
    <div lang={language} className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <nav aria-label={copy.breadcrumb} className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider">
        <span className="uppercase text-(--primary)">{copy.workspace}</span>
        <span aria-hidden="true" className="text-(--text-faint)">/</span>
        <span className="font-normal text-(--text-muted)">{copy.title}</span>
      </nav>
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--text-primary)">{copy.title}</h1>
        <p className="text-sm sm:text-base text-(--text-secondary)">{copy.subtitle}</p>
      </div>
      <div className="grid items-start gap-6 @min-[920px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form onSubmit={submit} className="min-w-0 space-y-6">
          <fieldset disabled={saved} className="min-w-0 space-y-6 disabled:opacity-70">
            <Section title={copy.basic} icon={<Layers size={16} />}>
              <div className="space-y-4">
                <Input id="group-name" label={`${copy.name} *`} required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder={copy.namePlaceholder} />
                <Input id="group-course" label={`${copy.course} *`} required maxLength={100} value={course} onChange={e => setCourse(e.target.value)} placeholder={copy.coursePlaceholder} />
                <fieldset>
                  <legend className="mb-2 text-xs font-medium">{copy.type} *</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["study", "project"] as const).map(value => (
                      <div key={value} className={`rounded-(--radius-input) border p-4 ${type === value ? "border-(--primary) bg-(--primary-soft)" : "border-(--border)"}`}>
                        <Radio id={`group-type-${value}`} name="group-type" value={value}
                          checked={type === value} onChange={() => setType(value)}
                          label={copy[value]} description={value === "study" ? copy.studyHint : copy.projectHint} />
                      </div>
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
                <div className="rounded-(--radius-input) border border-(--border) bg-(--surface-container-low) p-4">
                  <Checkbox id="group-recruitment" checked={open} onChange={e => setOpen(e.target.checked)}
                    label={open ? copy.open : copy.closed} description={open ? copy.openHint : copy.closedHint} />
                </div>
              </div>
            </Section>
          </fieldset>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <p className={`flex items-center gap-1 text-xs ${valid ? "text-(--secondary)" : "text-(--text-muted)"}`}><ShieldCheck size={14} />{valid ? copy.ready : copy.required}</p>
            <div className="flex gap-2">
              <Button href="/groups" variant="outline">{saved ? copy.viewGroups : copy.cancel}</Button>
              <Button type="submit" disabled={!valid || saved} leftIcon={<Check size={16} />}>{saved ? copy.saved : copy.title}</Button>
            </div>
          </Card>
          {(saved || saveError) && <p role="status" className={`rounded-lg border p-3 text-sm ${saved ? "border-(--success-border) bg-(--success-bg) text-(--success-text)" : "border-(--error-border) text-(--error-text)"}`}>{saved ? copy.success : copy.saveError}</p>}
        </form>
        <aside className="min-w-0 @min-[920px]:sticky @min-[920px]:top-20">
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
