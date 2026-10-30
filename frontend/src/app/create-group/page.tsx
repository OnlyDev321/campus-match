"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, Check, Eye, FileText, Layers, Minus, Plus, ShieldCheck, Tags, Users, X } from "lucide-react";
import { Badge, Button, Input } from "@/design-system";

const field = "w-full rounded-lg border border-(--border-strong) bg-(--surface) px-3 py-2 text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--focus-ring)";
function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-xl border border-(--border-strong) bg-(--surface) p-5 shadow-xs"><h2 className="mb-5 flex items-center gap-2 border-b border-(--border-strong) pb-4 text-sm font-semibold"><span className="rounded-md bg-(--surface-container) p-1.5 text-(--primary)">{icon}</span>{title}</h2>{children}</section>;
}
function TagEditor({ label, values, onChange, topic = false }: { label: string; values: string[]; onChange: (items: string[]) => void; topic?: boolean }) {
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  function add() {
    const next = value.trim().replace(/^#+/, "");
    if (!next || values.length >= 10) return;
    if (values.some(item => item.toLowerCase() === next.toLowerCase())) { setError("이미 추가한 항목입니다."); return; }
    onChange([...values, next]); setValue(""); setEditing(false); setError("");
  }
  return <div className="space-y-2"><p className="text-xs font-medium">{label}</p><div className="flex flex-wrap items-center gap-2">{values.map(item => <span key={item} className="inline-flex items-center gap-1 rounded border border-(--border-strong) bg-(--surface-container-low) px-2 py-1 text-xs"><span className={topic ? "font-mono text-(--primary)" : ""}>{topic && "#"}{item}</span><button type="button" aria-label={`${item} 삭제`} onClick={() => onChange(values.filter(tag => tag !== item))}><X size={12} /></button></span>)}{editing ? <div className="flex gap-1"><input autoFocus aria-label={`새 ${topic ? "태그" : "기술"}`} maxLength={30} value={value} onChange={event => { setValue(event.target.value); setError(""); }} onKeyDown={event => { if (event.nativeEvent.isComposing) return; if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); } if (event.key === "Escape") { setEditing(false); setError(""); } }} className={`${field} max-w-36`} /><button type="button" onClick={add} aria-label="추가"><Check size={16} /></button><button type="button" onClick={() => { setEditing(false); setError(""); }} aria-label="입력 취소"><X size={16} /></button></div> : <button type="button" disabled={values.length >= 10} onClick={() => setEditing(true)} className="rounded border border-dashed border-(--border-strong) px-2 py-1 text-xs disabled:opacity-40">+ {topic ? "태그" : "기술"} 추가</button>}</div>{error && <p role="alert" className="text-xs text-(--error-text)">{error}</p>}</div>;
}
export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState("project");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const valid = Boolean(name.trim() && course.trim() && description.trim());
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || saved) return;
    try {
      const previous: unknown = JSON.parse(localStorage.getItem("campus-match-created-groups") || "[]");
      if (!Array.isArray(previous)) throw new Error("Invalid storage");
      const group = { id: crypto.randomUUID(), title: name.trim(), course: course.trim(), description: description.trim(), type, tags: skills, skills, memberCount: 1, maxMembers: capacity, openForApplications: open, leaderName: "나", leaderMajor: "그룹장" };
      localStorage.setItem("campus-match-created-groups", JSON.stringify([group, ...previous]));
      setSaved(true); setMessage("그룹을 이 브라우저에 저장했어요. 아직 다른 사용자에게는 공개되지 않아요.");
    } catch { setMessage("저장하지 못했어요. 브라우저 저장 공간 설정을 확인하고 다시 시도해 주세요."); }
  }
  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-10">
    <h1 className="text-2xl font-bold tracking-tight">그룹 만들기</h1><p className="mb-7 mt-1 text-sm text-(--text-secondary)">함께 공부하거나 프로젝트를 진행할 팀원을 모집해 보세요.</p>
    <div className="grid items-start gap-6 @min-[850px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <form onSubmit={submit} className="space-y-5"><fieldset disabled={saved} className="min-w-0 space-y-5 disabled:opacity-70">
        <Section title="기본 정보" icon={<Layers size={16} />}><div className="space-y-4"><Input label="그룹 이름 *" required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="예: 웹 프로그래밍 프로젝트 팀" /><Input label="과목 또는 활동 주제 *" required maxLength={100} value={course} onChange={e => setCourse(e.target.value)} placeholder="예: 웹 프로그래밍 (CS301), 코딩 테스트" /><fieldset><legend className="mb-2 text-xs font-medium">그룹 유형 *</legend><div className="grid gap-3 sm:grid-cols-2">{[{ value: "study", title: "스터디", text: "시험 준비, 과목 복습, 코딩 테스트", icon: BookOpen }, { value: "project", title: "프로젝트", text: "팀 과제, 캡스톤 디자인, 해커톤", icon: Layers }].map(item => <label key={item.value} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${type === item.value ? "border-(--primary) bg-(--primary-soft) ring-1 ring-(--primary)" : "border-(--border-strong)"}`}><input type="radio" name="group-type" checked={type === item.value} onChange={() => setType(item.value)} className="mt-0.5 accent-(--primary)" /><span><span className="flex items-center gap-1 text-xs font-semibold"><item.icon size={13} />{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-(--text-secondary)">{item.text}</span></span></label>)}</div></fieldset></div></Section>
        <Section title="그룹 소개" icon={<FileText size={16} />}><div className="space-y-5"><div><div className="mb-2 flex justify-between text-xs"><label htmlFor="overview" className="font-medium">활동 내용 *</label><span className="font-mono text-(--text-muted)">{description.length} / 500</span></div><textarea id="overview" required maxLength={500} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="활동 목표, 모임 일정, 찾고 있는 팀원을 자유롭게 소개해 주세요." className={field} /></div></div></Section>
        <Section title="관심 분야 및 기술" icon={<Tags size={16} />}><div className="space-y-5"><TagEditor label="함께 사용할 기술이나 관심 분야 (선택)" values={skills} onChange={setSkills} /></div></Section>
        <Section title="모집 설정" icon={<Users size={16} />}><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs font-medium">전체 인원</p><div className="flex items-center gap-3"><div className="flex items-center rounded-lg border border-(--border-strong) bg-(--surface-container-low)"><button type="button" aria-label="인원 줄이기" disabled={capacity <= 2} onClick={() => setCapacity(capacity - 1)} className="p-2 disabled:opacity-30"><Minus size={14} /></button><span aria-live="polite" className="w-16 text-center text-xs font-semibold">{capacity}명</span><button type="button" aria-label="인원 늘리기" disabled={capacity >= 20} onClick={() => setCapacity(capacity + 1)} className="p-2 disabled:opacity-30"><Plus size={14} /></button></div><span className="max-w-20 text-xs text-(--text-muted)">그룹장 포함</span></div></div><div className="flex max-w-64 items-center gap-3 rounded-lg border border-(--border-strong) bg-(--surface-container-low) p-3"><div><p className="text-xs font-semibold">{open ? "모집 중" : "모집 마감"}</p><p className="mt-1 text-xs text-(--text-muted)">{open ? "참여 신청을 받을 수 있어요." : "참여 신청을 받지 않아요."}</p></div><button type="button" role="switch" aria-checked={open} aria-label="모집 중" onClick={() => setOpen(!open)} className={`h-6 w-10 shrink-0 rounded-full p-0.5 ${open ? "bg-(--secondary)" : "bg-(--outline)"}`}><span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${open ? "translate-x-4" : ""}`} /></button></div></div></Section>
      </fieldset><div className="flex flex-wrap items-center justify-between gap-4 py-2"><p className={`flex items-center gap-1 text-xs ${valid ? "text-(--secondary)" : "text-(--text-muted)"}`}><ShieldCheck size={14} />{valid ? "그룹을 만들 준비가 되었어요." : "필수 항목(*)을 입력해 주세요."}</p><div className="flex gap-2"><Button href="/groups" variant="outline">{saved ? "그룹 목록" : "취소"}</Button><Button type="submit" disabled={!valid || saved} leftIcon={<Check size={16} />}>{saved ? "저장 완료" : "그룹 만들기"}</Button></div></div>{message && <p role="status" className={`rounded-lg border p-3 text-sm ${saved ? "border-(--success-border) bg-(--success-bg) text-(--success-text)" : "border-(--error-border) text-(--error-text)"}`}>{message}</p>}</form>
      <aside className="space-y-5 @min-[850px]:sticky @min-[850px]:top-20"><Section title="미리보기" icon={<Eye size={16} />}><article className="space-y-4 rounded-xl border border-(--border-strong) p-4"><div className="flex flex-wrap gap-2"><Badge variant="primary">{course.trim() || "과목 또는 활동 주제"}</Badge><Badge variant={open ? "recruiting" : "closed"} dot>{open ? `모집 중 · ${capacity - 1}명` : "모집 마감"}</Badge></div><h3 className="break-words text-sm font-semibold">{name.trim() || "그룹 이름"}</h3><p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-(--text-secondary)">{description.trim() || "작성한 활동 내용이 여기에 표시돼요."}</p><div className="flex flex-wrap gap-1.5">{skills.map(tag => <Badge key={tag} variant="primary">#{tag}</Badge>)}</div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--border) pt-3 text-xs"><span className="flex items-center gap-1 text-(--text-muted)"><Users size={13} />1 / {capacity}명</span></div></article></Section></aside>
    </div>
  </div>;
}
