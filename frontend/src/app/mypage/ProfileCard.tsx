"use client";

import React, { useRef, useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2, Upload, X } from "lucide-react";
import { Avatar, Badge, Button, Input } from "@/design-system";
import type { User } from "./mockData";

// Khung hồ sơ trên My Page. Bấm "Edit Profile" để chuyển sang chế độ sửa ngay tại chỗ.
//
// Chỉ đọc (lấy từ tài khoản trường): name, studentId, major, cohort.
// Sửa được: ảnh đại diện (upload), bio, skills, email, số điện thoại.

const BIO_MAX = 300;
const SKILL_MAX = 10;
const SKILL_LENGTH_MAX = 24;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface ProfileCardProps {
  user: User;
  // Khi có API thật: gọi API ở đây (upload ảnh lên storage, cập nhật hồ sơ)
  // rồi mới trả về user đã lưu.
  onSave: (updated: User) => void;
}

const ProfileCard = ({ user, onSave }: ProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="relative rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-1)] overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-(--primary-container)/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {isEditing ? (
          <ProfileEditor
            user={user}
            onCancel={() => setIsEditing(false)}
            onSave={(updated) => {
              onSave(updated);
              setIsEditing(false);
            }}
          />
        ) : (
          <ProfileView user={user} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Chế độ xem                                                          */
/* ------------------------------------------------------------------ */

const ProfileHeading = ({ user }: { user: User }) => (
  <div className="space-y-1">
    <div className="flex flex-wrap items-center gap-2.5">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {user.name}
      </h1>
      <Badge variant="primary" size="sm" mono>
        {user.cohort}
      </Badge>
    </div>
    <p className="text-xs font-mono text-[var(--text-muted)]">
      {user.studentId} • {user.major}
    </p>
  </div>
);

const ProfileView = ({ user, onEdit }: { user: User; onEdit: () => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
    <Avatar src={user.avatarUrl} name={user.name} size="xl" />

    <div className="flex-1 min-w-0 space-y-3">
      <ProfileHeading user={user} />

      <p className="max-w-2xl text-sm text-[var(--text-secondary)] leading-relaxed">
        {user.bio}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {user.skills.map((skill) => (
          <Badge key={skill} variant="neutral" size="sm">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <a
          href={`mailto:${user.email}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          {user.email}
        </a>
        {user.phone && (
          <a
            href={`tel:${user.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {user.phone}
          </a>
        )}
      </div>
    </div>

    <Button
      variant="outline"
      size="sm"
      leftIcon={<Pencil className="w-3.5 h-3.5" />}
      onClick={onEdit}
      className="shrink-0"
    >
      Edit Profile
    </Button>
  </div>
);

/* ------------------------------------------------------------------ */
/* Chế độ sửa                                                          */
/* ------------------------------------------------------------------ */

type FormErrors = Partial<Record<"avatar" | "bio" | "skills" | "email" | "phone", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfileEditor = ({
  user,
  onCancel,
  onSave,
}: {
  user: User;
  onCancel: () => void;
  onSave: (updated: User) => void;
}) => {
  // State khởi tạo khi vào chế độ sửa; Cancel chỉ cần unmount là bỏ mọi thay đổi.
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio);
  const [skills, setSkills] = useState(user.skills);
  const [skillDraft, setSkillDraft] = useState("");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setError = (key: keyof FormErrors, message?: string) =>
    setErrors((prev) => ({ ...prev, [key]: message }));

  // Đọc ảnh thành data URL để xem trước và lưu trong state.
  // Khi có API: thay bằng upload file lên server/storage và lưu URL trả về.
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // cho phép chọn lại cùng một file
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setError("avatar", "Only PNG, JPG or WebP images are allowed.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("avatar", "Image must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(typeof reader.result === "string" ? reader.result : undefined);
      setError("avatar", undefined);
    };
    reader.onerror = () => setError("avatar", "Could not read this image. Try another one.");
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const value = skillDraft.trim();
    if (!value) return;

    if (value.length > SKILL_LENGTH_MAX) {
      setError("skills", `Skill must be at most ${SKILL_LENGTH_MAX} characters.`);
    } else if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setError("skills", "This skill is already added.");
    } else if (skills.length >= SKILL_MAX) {
      setError("skills", `You can add up to ${SKILL_MAX} skills.`);
    } else {
      setSkills((prev) => [...prev, value]);
      setSkillDraft("");
      setError("skills", undefined);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const nextErrors: FormErrors = {};

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    // Số điện thoại không bắt buộc; nếu nhập thì cần 9-15 chữ số (cho phép + đầu, dấu cách, -, ., ()).
    if (trimmedPhone) {
      const digits = trimmedPhone.replace(/[\s\-.()]/g, "");
      if (!/^\+?\d{9,15}$/.test(digits)) {
        nextErrors.phone = "Enter a valid phone number (9-15 digits).";
      }
    }

    if (bio.length > BIO_MAX) {
      nextErrors.bio = `Bio must be at most ${BIO_MAX} characters.`;
    }

    setErrors((prev) => ({ avatar: prev.avatar, skills: prev.skills, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...user,
      avatarUrl,
      bio: bio.trim(),
      skills,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Avatar upload */}
        <div className="flex flex-col items-start gap-2 shrink-0">
          <Avatar src={avatarUrl} name={user.name} size="xl" />
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_TYPES.join(",")}
            onChange={handleAvatarChange}
            className="sr-only"
            aria-label="Upload profile photo"
            tabIndex={-1}
          />
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Remove photo"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  setAvatarUrl(undefined);
                  setError("avatar", undefined);
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="max-w-[10rem] text-xs text-[var(--text-muted)]">
            PNG, JPG or WebP, up to 2 MB.
          </p>
          {errors.avatar && (
            <p className="max-w-[10rem] text-xs font-medium text-[var(--error-text)]" role="alert">
              {errors.avatar}
            </p>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {/* Thông tin từ trường: chỉ đọc */}
          <div className="space-y-1">
            <ProfileHeading user={user} />
            <p className="text-xs text-[var(--text-muted)]">
              Name, student ID, major and cohort come from your university account and can&apos;t
              be changed here.
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-bio"
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ borderRadius: "var(--radius-input)" }}
              className={`w-full px-3 py-2 text-sm leading-relaxed resize-none bg-(--surface) text-(--text-primary) border transition-all duration-150 placeholder:text-(--text-faint) focus:outline-none focus:border-(--primary-container) focus:ring-2 focus:ring-(--focus-ring) ${
                errors.bio
                  ? "border-(--error) focus:border-(--error) focus:ring-(--error-border)"
                  : "border-(--border) hover:border-(--border-strong)"
              }`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--error-text)] font-medium">{errors.bio}</span>
              <span
                className={`font-mono ${
                  bio.length > BIO_MAX ? "text-[var(--error-text)]" : "text-[var(--text-muted)]"
                }`}
              >
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Input
                label="Skills"
                placeholder="Add a skill and press Enter"
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                error={errors.skills}
                helperText={`${skills.length}/${SKILL_MAX} skills`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                leftIcon={<Plus className="w-4 h-4" />}
                className="shrink-0 mt-[22px]"
              >
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="neutral" size="sm" className="pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => {
                          setSkills((prev) => prev.filter((s) => s !== skill));
                          setError("skills", undefined);
                        }}
                        aria-label={`Remove ${skill}`}
                        className="p-0.5 rounded-full text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container)] cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Liên hệ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="e.g. 0901 234 567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone}
              helperText="Optional."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-muted)]">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
};

export default ProfileCard;
