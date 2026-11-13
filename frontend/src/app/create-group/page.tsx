"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Crown,
  Globe2,
  GraduationCap,
  Info,
  Layers,
  MapPin,
  Mail,
  Minus,
  Plus,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  RoleQuota,
} from "@/design-system";
import { createGroup } from "@/services/groupService";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type {
  CreateGroupFormData,
  CreateGroupFormErrors,
  CreateGroupResponse,
  GroupRoleQuota,
  MeetingFormat,
} from "@/lib/types";

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const copy = t.createGroupPage;

  // Bảo vệ route: Yêu cầu đăng nhập tài khoản sinh viên u-SAINT
  const isReady = useRequireLogin("/create-group");

  // Dữ liệu biểu mẫu
  const [formData, setFormData] = useState<CreateGroupFormData>({
    title: "",
    description: "",
    courseCode: "",
    courseName: "",
    maxMembers: 4,
    contactEmail: "",
    contactPhone: "",
    publishEmail: false,
    publishPhone: false,
    meetingFormat: "Hybrid",
    tags: [],
    rolesQuota: [
      {
        role: "",
        current: 1,
        max: 2,
        description: "",
      },
      {
        role: "",
        current: 0,
        max: 2,
        description: "",
      },
    ],
  });

  // Vai trò được Trưởng nhóm (người tạo) đảm nhận
  const [selectedLeaderRoleIndex, setSelectedLeaderRoleIndex] =
    useState<number>(0);

  const [currentTagInput, setCurrentTagInput] = useState("");
  const [errors, setErrors] = useState<CreateGroupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<CreateGroupResponse | null>(
    null,
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Xử lý cập nhật trường dữ liệu
  const updateField = <K extends keyof CreateGroupFormData>(
    field: K,
    value: CreateGroupFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof CreateGroupFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Thêm tag từ khóa
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = currentTagInput.trim().replace(/^#/, "");
      if (
        trimmed &&
        !formData.tags.includes(trimmed) &&
        formData.tags.length < 5
      ) {
        updateField("tags", [...formData.tags, trimmed]);
        setCurrentTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tagToRemove),
    );
  };

  // Tăng giảm sĩ số
  const handleCapacityChange = (delta: number) => {
    const nextVal = Math.max(2, Math.min(20, formData.maxMembers + delta));
    updateField("maxMembers", nextVal);
  };

  // Chỉ định vai trò cho Trưởng nhóm
  const handleSelectLeaderRole = (index: number) => {
    setSelectedLeaderRoleIndex(index);
    const updated = formData.rolesQuota.map((r, idx) => ({
      ...r,
      current: idx === index ? 1 : 0,
      max: idx === index ? Math.max(1, r.max) : r.max,
    }));
    updateField("rolesQuota", updated);
  };

  // Quản lý cơ cấu nhóm & vai trò
  const handleAddRole = () => {
    const newRole: GroupRoleQuota = {
      role: "",
      current: 0,
      max: 1,
      description: "",
    };
    updateField("rolesQuota", [...formData.rolesQuota, newRole]);
  };

  const handleRemoveRole = (index: number) => {
    if (formData.rolesQuota.length <= 1) return;
    const nextList = formData.rolesQuota.filter((_, idx) => idx !== index);

    let nextLeaderIndex = selectedLeaderRoleIndex;
    if (selectedLeaderRoleIndex === index) {
      nextLeaderIndex = 0;
    } else if (selectedLeaderRoleIndex > index) {
      nextLeaderIndex = selectedLeaderRoleIndex - 1;
    }

    const rebalanced = nextList.map((r, idx) => ({
      ...r,
      current: idx === nextLeaderIndex ? 1 : 0,
      max: idx === nextLeaderIndex ? Math.max(1, r.max) : r.max,
    }));

    setSelectedLeaderRoleIndex(nextLeaderIndex);
    updateField("rolesQuota", rebalanced);
  };

  const handleUpdateRole = (
    index: number,
    field: keyof GroupRoleQuota,
    val: string | number,
  ) => {
    const updated = formData.rolesQuota.map((r, idx) => {
      if (idx !== index) return r;
      return { ...r, [field]: val };
    });
    updateField("rolesQuota", updated);
  };

  const handleRoleQuotaStep = (index: number, delta: number) => {
    const role = formData.rolesQuota[index];
    if (!role) return;
    const nextMax = Math.max(1, Math.min(10, role.max + delta));
    handleUpdateRole(index, "max", nextMax);
  };

  const handleApplyPreset = (preset: "dev" | "ai" | "general") => {
    let presetRoles: GroupRoleQuota[] = [];
    if (preset === "dev") {
      presetRoles = [
        {
          role: "Core Developer",
          current: 1,
          max: 2,
          description: "Feature development & code delivery",
        },
        {
          role: "Collaborator / Researcher",
          current: 0,
          max: 2,
          description: "Testing, documentation & implementation",
        },
      ];
    } else if (preset === "ai") {
      presetRoles = [
        {
          role: "AI / ML Engineer",
          current: 1,
          max: 2,
          description: "Model training, pipeline & inference",
        },
        {
          role: "Backend Developer",
          current: 0,
          max: 2,
          description: "Data preprocessing & API integration",
        },
      ];
    } else {
      presetRoles = [
        {
          role: "Leader",
          current: 1,
          max: 2,
          description: "Coordination & core coursework topics",
        },
        {
          role: "Member",
          current: 0,
          max: 2,
          description: "Weekly assignments & group discussions",
        },
      ];
    }
    setSelectedLeaderRoleIndex(0);
    const total = presetRoles.reduce((sum, r) => sum + r.max, 0);
    setFormData((prev) => ({
      ...prev,
      rolesQuota: presetRoles,
      maxMembers: Math.max(2, Math.min(20, total)),
    }));
  };

  const totalRoleQuota = formData.rolesQuota.reduce((sum, r) => sum + r.max, 0);

  const handleSyncCapacityWithQuota = () => {
    if (totalRoleQuota >= 2 && totalRoleQuota <= 20) {
      updateField("maxMembers", totalRoleQuota);
    }
  };

  // Xác thực biểu mẫu client-side
  const validateForm = (): boolean => {
    const newErrors: CreateGroupFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = copy.errors.titleRequired;
    } else if (formData.title.trim().length > 150) {
      newErrors.title = copy.errors.titleTooLong;
    }

    if (!formData.description.trim()) {
      newErrors.description = copy.errors.descriptionRequired;
    } else if (formData.description.trim().length < 20) {
      newErrors.description = copy.errors.descriptionTooShort;
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 20) {
      newErrors.maxMembers = copy.errors.capacityInvalid;
    }

    if (formData.publishEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
      newErrors.contactEmail = copy.errors.contactEmailInvalid;
    } else if (formData.publishEmail && user?.studentId && formData.contactEmail.includes(user.studentId)) {
      newErrors.contactEmail = copy.errors.contactEmailStudentId;
    }
    if (formData.publishPhone && !/^[+0-9() .-]{7,25}$/.test(formData.contactPhone.trim())) {
      newErrors.contactPhone = copy.errors.contactPhoneInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gửi tạo nhóm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cleanedRolesQuota = formData.rolesQuota
        .map((r, idx) => ({
          ...r,
          role: r.role.trim() || `${copy.roleNameLabel} ${idx + 1}`,
          description: r.description?.trim() || undefined,
        }))
        .filter((r) => r.max > 0);

      const response = await createGroup(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          courseCode: formData.courseCode.trim() || undefined,
          courseName: formData.courseName.trim() || undefined,
          maxMembers: formData.maxMembers,
          contactEmail: formData.publishEmail ? formData.contactEmail.trim() : undefined,
          contactPhone: formData.publishPhone ? formData.contactPhone.trim() : undefined,
          meetingFormat: formData.meetingFormat,
          rolesQuota:
            cleanedRolesQuota.length > 0 ? cleanedRolesQuota : undefined,
        },
      );

      setCreatedGroup(response);
      setIsSuccessModalOpen(true);
    } catch {
      setSubmitError(copy.errors.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính toán dữ liệu xem trước
  const spotsLeft = Math.max(0, formData.maxMembers - 1);
  const collegeDisplay = user?.faculty || copy.verifiedStudent;
  const departmentDisplay = user?.department || copy.verifiedStudent;
  const currentYear = new Date().getFullYear();

  const spotsText =
    spotsLeft === 1
      ? copy.spotsOpenSingle
      : copy.spotsOpenBadge.replace("{count}", String(spotsLeft));

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="@container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Breadcrumb */}
      <nav
        aria-label={copy.breadcrumbCreate}
        className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider"
      >
        <Link
          href="/manage"
          className="text-[var(--primary)] uppercase hover:underline transition-colors"
        >
          <ScrambleText text={t.myPage.breadcrumbRoot} />
        </Link>
        <span aria-hidden="true" className="text-[var(--text-faint)]">
          /
        </span>
        <span className="text-[var(--text-muted)] font-normal">
          <ScrambleText text={t.myPage.breadcrumbCampus} />
        </span>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            <ScrambleText text={copy.title} />
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            <ScrambleText text={copy.subtitle} />
          </p>
        </div>
      </header>

      {/* 2. Main Grid Layout: Form (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Form nhập liệu (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {submitError && (
            <div
              style={{ borderRadius: "var(--radius-input)" }}
              className="p-4 bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] text-sm flex items-start gap-3"
            >
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* CARD 1: Thông tin cơ bản */}
            <Card className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-muted)]">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                    <ScrambleText text={copy.basicInfoTitle} />
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    <ScrambleText text={copy.basicInfoSubtitle} />
                  </p>
                </div>
              </div>

              {/* Group Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="group-title"
                    className="block text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    <ScrambleText text={copy.groupTitleLabel} />{" "}
                    <span className="text-[var(--error)]">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-[var(--text-faint)]">
                    {formData.title.length}/150
                  </span>
                </div>
                <Input
                  id="group-title"
                  name="title"
                  placeholder={copy.groupTitlePlaceholder}
                  value={formData.title}
                  maxLength={150}
                  error={errors.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  leftIcon={<Layers className="w-4 h-4" />}
                />
                {!errors.title && (
                  <p className="text-xs text-[var(--text-muted)]">
                    <ScrambleText text={copy.groupTitleHelp} />
                  </p>
                )}
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="group-description"
                    className="block text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    <ScrambleText text={copy.descriptionLabel} />{" "}
                    <span className="text-[var(--error)]">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.description.length >= 20
                        ? "text-[var(--success-text)]"
                        : "text-[var(--text-faint)]"
                    }`}
                  >
                    {formData.description.length}/2000
                  </span>
                </div>
                <textarea
                  id="group-description"
                  name="description"
                  maxLength={2000}
                  aria-invalid={!!errors.description}
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder={copy.descriptionPlaceholder}
                  style={{ borderRadius: "var(--radius-input)" }}
                  className={`block w-full resize-y p-3.5 text-sm leading-relaxed bg-[var(--surface)] border transition-colors ${
                    errors.description
                      ? "border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft-border)]"
                  } text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none`}
                />
                {errors.description ? (
                  <p className="text-xs font-medium text-[var(--error-text)]">
                    {errors.description}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    <ScrambleText text={copy.descriptionHelp} />
                  </p>
                )}
              </div>

              <fieldset className="space-y-4 border-t border-[var(--border-muted)] pt-5">
                <legend className="text-sm font-semibold text-[var(--text-primary)] pt-4">
                  <ScrambleText text={copy.contactTitle} />
                </legend>
                <p className="text-xs text-[var(--text-muted)]">
                  <ScrambleText text={copy.contactDescription} />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      label={copy.contactEmailLabel}
                      placeholder={copy.contactEmailPlaceholder}
                      value={formData.contactEmail}
                      onChange={(event) => updateField("contactEmail", event.target.value)}
                      error={errors.contactEmail}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                    <label className="flex items-start gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publishEmail}
                        onChange={(event) => updateField("publishEmail", event.target.checked)}
                        className="mt-0.5 accent-[var(--primary)]"
                      />
                      <ScrambleText text={copy.publishEmailLabel} />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      autoComplete="tel"
                      maxLength={25}
                      label={copy.contactPhoneLabel}
                      placeholder={copy.contactPhonePlaceholder}
                      value={formData.contactPhone}
                      onChange={(event) => updateField("contactPhone", event.target.value)}
                      error={errors.contactPhone}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />
                    <label className="flex items-start gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publishPhone}
                        onChange={(event) => updateField("publishPhone", event.target.checked)}
                        className="mt-0.5 accent-[var(--primary)]"
                      />
                      <ScrambleText text={copy.publishPhoneLabel} />
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* Tags / Keywords Input */}
              <div className="space-y-2">
                <label
                  htmlFor="group-tags"
                  className="block text-xs font-semibold text-[var(--text-secondary)]"
                >
                  <ScrambleText text={copy.tagsLabel} />
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--surface-container-low)] border border-[var(--border)] rounded-[var(--radius-input)]">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[var(--radius-xs)] bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs animate-in zoom-in-95 duration-100"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={copy.removeTag.replace("{tag}", tag)}
                        className="text-[var(--text-muted)] hover:text-[var(--error)] ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formData.tags.length < 5 && (
                    <input
                      id="group-tags"
                      type="text"
                      value={currentTagInput}
                      onChange={(e) => setCurrentTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={
                        formData.tags.length === 0
                          ? copy.tagsPlaceholder
                          : copy.addTag
                      }
                      className="flex-1 min-w-[140px] bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none px-1 py-0.5"
                    />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  <ScrambleText text={copy.tagsHelp} />
                </p>
              </div>
            </Card>

            {/* CARD 2: Thông tin học phần & Hình thức sinh hoạt */}
            <Card className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-muted)]">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                    <ScrambleText text={copy.academicInfoTitle} />
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    <ScrambleText text={copy.academicInfoSubtitle} />
                  </p>
                </div>
              </div>

              {/* Course Code & Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Input
                    name="courseCode"
                    label={copy.courseCodeLabel}
                    placeholder={copy.courseCodePlaceholder}
                    value={formData.courseCode}
                    onChange={(e) =>
                      updateField("courseCode", e.target.value.toUpperCase())
                    }
                    helperText={copy.courseCodeHelp}
                    leftIcon={<BookOpen className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    name="courseName"
                    label={copy.courseNameLabel}
                    placeholder={copy.courseNamePlaceholder}
                    value={formData.courseName}
                    onChange={(e) => updateField("courseName", e.target.value)}
                    helperText={copy.courseNameHelp}
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Meeting Format Selector */}
              <fieldset className="space-y-2.5 pt-2">
                <legend className="block text-xs font-semibold text-[var(--text-secondary)]">
                  <ScrambleText text={copy.meetingFormatLabel} />
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                  {[
                    {
                      id: "Online" as MeetingFormat,
                      label: copy.formatOnline,
                      desc: copy.formatOnlineDesc,
                      icon: Globe2,
                    },
                    {
                      id: "Offline" as MeetingFormat,
                      label: copy.formatOffline,
                      desc: copy.formatOfflineDesc,
                      icon: MapPin,
                    },
                    {
                      id: "Hybrid" as MeetingFormat,
                      label: copy.formatHybrid,
                      desc: copy.formatHybridDesc,
                      icon: Calendar,
                    },
                  ].map((format) => {
                    const isSelected = formData.meetingFormat === format.id;
                    const IconComponent = format.icon;

                    return (
                      <label
                        key={format.id}
                        htmlFor={`meeting-format-${format.id}`}
                        className={`group relative flex flex-col justify-between gap-2.5 p-3.5 rounded-[var(--radius-input)] border cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm ring-1 ring-[var(--primary)]/20"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-container-low)]"
                        }`}
                      >
                        {/* Hidden native radio */}
                        <input
                          id={`meeting-format-${format.id}`}
                          type="radio"
                          name="meetingFormat"
                          value={format.id}
                          checked={isSelected}
                          onChange={() =>
                            updateField("meetingFormat", format.id)
                          }
                          className="peer sr-only"
                        />

                        {/* Top row: Icon + Title bên trái, Radio indicator ở góc trên bên phải */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                              <IconComponent className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {format.label}
                            </span>
                          </div>

                          {/* Custom radio indicator (Top-Right) */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--primary)] shadow-xs"
                                : "border-[var(--border-strong)] bg-[var(--surface)] group-hover:border-[var(--text-muted)]"
                            } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full bg-white transition-transform duration-150 ${
                                isSelected ? "scale-100" : "scale-0"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {format.desc}
                        </p>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </Card>

            {/* CARD 3: Sĩ số & Phân bổ chỗ ngồi */}
            <Card className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-muted)]">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                    <ScrambleText text={copy.capacityTitle} />
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    <ScrambleText text={copy.capacitySubtitle} />
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-[var(--radius-input)] bg-[var(--surface-container-low)] border border-[var(--border)]">
                  <div>
                    <label
                      id="max-members-label"
                      className="text-sm font-semibold text-[var(--text-primary)] block"
                    >
                      <ScrambleText text={copy.maxMembersLabel} />
                    </label>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      <ScrambleText text={copy.maxMembersHelp} />
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      type="button"
                      onClick={() => handleCapacityChange(-1)}
                      disabled={formData.maxMembers <= 2}
                      variant="outline"
                      className="h-9 w-9 p-0"
                      aria-label={copy.decreaseMembers}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <div
                      role="status"
                      aria-labelledby="max-members-label"
                      className="w-16 text-center font-mono font-bold text-lg text-[var(--primary)]"
                    >
                      {formData.maxMembers}
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleCapacityChange(1)}
                      disabled={formData.maxMembers >= 20}
                      variant="outline"
                      className="h-9 w-9 p-0"
                      aria-label={copy.increaseMembers}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Visual Seat Representation */}
                <div className="p-4 rounded-[var(--radius-input)] bg-[var(--surface)] border border-[var(--border-muted)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-secondary)]">
                      {copy.seatAllocation}
                    </span>
                    <span className="font-mono text-[var(--text-primary)] font-semibold">
                      {copy.seatSummary.replace("{count}", String(spotsLeft))}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Leader Seat */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] border border-[var(--primary-soft-border)] text-[var(--primary)] text-xs font-semibold">
                      <Avatar
                        size="sm"
                        name={user?.name || copy.leaderYou}
                        src={user?.avatarUrl}
                      />
                      <span>{copy.leaderYou}</span>
                    </div>

                    {/* Open Seats */}
                    {Array.from({ length: spotsLeft }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-container-low)] text-[var(--text-muted)] text-xs"
                      >
                        <div className="w-5 h-5 rounded-full border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[10px] font-mono">
                          {index + 2}
                        </div>
                        <span>{copy.openSpot}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROLE QUOTA & TEAM STRUCTURE CONFIGURATION */}
                <div className="pt-4 border-t border-[var(--border-muted)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--primary)]" />
                        <ScrambleText text={copy.rolesSectionTitle} />
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        <ScrambleText text={copy.rolesSectionSubtitle} />
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRole}
                      className="text-xs font-semibold self-start sm:self-auto shrink-0"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      <ScrambleText text={copy.addRoleBtn} />
                    </Button>
                  </div>

                  {/* Preset Quick Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                      {copy.presetLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("dev")}
                      className="px-2.5 py-1 text-xs rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-container-low)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] font-medium transition-colors"
                    >
                      {copy.presetDev}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("ai")}
                      className="px-2.5 py-1 text-xs rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-container-low)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] font-medium transition-colors"
                    >
                      {copy.presetAi}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("general")}
                      className="px-2.5 py-1 text-xs rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-container-low)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] font-medium transition-colors"
                    >
                      {copy.presetGeneral}
                    </button>
                  </div>

                  {/* Quota vs Total Capacity Sync Warning / Helper */}
                  {totalRoleQuota !== formData.maxMembers && (
                    <div className="p-3 rounded-[var(--radius-input)] bg-[var(--primary-soft)] border border-[var(--primary-soft-border)] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[var(--text-primary)]">
                        <Info className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        <span>
                          {copy.rolesSyncHelp
                            .replace("{total}", String(totalRoleQuota))
                            .replace("{max}", String(formData.maxMembers))}
                        </span>
                      </div>
                      {totalRoleQuota >= 2 && totalRoleQuota <= 20 && (
                        <button
                          type="button"
                          onClick={handleSyncCapacityWithQuota}
                          className="text-[var(--primary)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity text-left sm:text-right"
                        >
                          {copy.syncCapacityBtn} ({totalRoleQuota})
                        </button>
                      )}
                    </div>
                  )}

                  {/* Role Quota Editor Cards List */}
                  <div className="space-y-3">
                    {formData.rolesQuota.map((roleItem, index) => {
                      const isLeaderRole = selectedLeaderRoleIndex === index;
                      return (
                        <div
                          key={index}
                          className={`p-3.5 sm:p-4 rounded-[var(--radius-input)] border transition-all space-y-3 ${
                            isLeaderRole
                              ? "border-[var(--primary)] bg-[var(--primary-soft)]/20 shadow-xs ring-1 ring-[var(--primary)]/20"
                              : "border-[var(--border)] bg-[var(--surface-container-low)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                              <span className="w-5 h-5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-secondary)] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[130px] sm:max-w-[180px]">
                                {roleItem.role ||
                                  `${copy.roleNameLabel} ${index + 1}`}
                              </span>

                              {/* Nút chỉ định / Nhãn vai trò của Trưởng nhóm */}
                              {isLeaderRole ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--primary)] text-white shadow-xs">
                                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                                  <span>{copy.myLeaderRoleSelected}</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSelectLeaderRole(index)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
                                >
                                  <Crown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                  <span>{copy.selectAsMyRole}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Role Quota Stepper */}
                              <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2 py-1 rounded-[var(--radius-xs)] border border-[var(--border)]">
                                <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1">
                                  {copy.roleQuotaLabel}:
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleQuotaStep(index, -1)}
                                  disabled={roleItem.max <= 1}
                                  className="h-6 w-6 p-0"
                                  aria-label={copy.decreaseMembers}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-mono text-xs font-bold text-[var(--primary)] w-5 text-center">
                                  {roleItem.max}
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleQuotaStep(index, 1)}
                                  disabled={roleItem.max >= 10}
                                  className="h-6 w-6 p-0"
                                  aria-label={copy.increaseMembers}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Delete Role Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRole(index)}
                                disabled={formData.rolesQuota.length <= 1}
                                className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--error)]"
                                aria-label={copy.deleteRole}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Role Inputs Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label={copy.roleNameLabel}
                              placeholder={copy.roleNamePlaceholder}
                              value={roleItem.role}
                              onChange={(e) =>
                                handleUpdateRole(index, "role", e.target.value)
                              }
                            />
                            <Input
                              label={copy.roleDescLabel}
                              placeholder={copy.roleDescPlaceholder}
                              value={roleItem.description || ""}
                              onChange={(e) =>
                                handleUpdateRole(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* CARD 4: Thông báo xác thực danh tính u-SAINT */}
            <div
              style={{ borderRadius: "var(--radius-input)" }}
              className="p-4 bg-[var(--surface-container-low)] border border-[var(--border)] flex items-start gap-3.5"
            >
              <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                  <ScrambleText text={copy.leaderNoticeTitle} />
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <ScrambleText
                    text={copy.leaderNoticeDesc
                      .replace("{college}", collegeDisplay)
                      .replace("{department}", departmentDisplay)}
                  />
                </p>
              </div>
            </div>

            {/* Buttons Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-[var(--border)] pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/groups")}
                disabled={isSubmitting}
              >
                <ScrambleText text={copy.cancelBtn} />
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="px-6 font-semibold"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                <ScrambleText
                  text={isSubmitting ? copy.submittingBtn : copy.submitBtn}
                />
              </Button>
            </div>
          </form>
        </div>

        {/* Cột phải: Live Preview Card thời gian thực (Sticky Desktop) (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                <ScrambleText text={copy.previewTitle} />
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              <ScrambleText text={copy.previewSubtitle} />
            </p>
          </div>

          {/* Interactive Live Card Preview */}
          <div className="min-w-0">
            <Card className="h-full flex flex-col gap-4 p-5">
              <CardHeader className="mb-0 flex-wrap items-center justify-between">
                <Badge variant="primary" className="font-semibold text-xs">
                  {formData.courseCode ||
                    formData.courseName ||
                    copy.generalStudy}
                </Badge>
                <Badge variant="recruiting" dot>
                  {spotsText}
                </Badge>
              </CardHeader>

              <div className="space-y-1.5">
                <CardTitle className="text-base font-semibold leading-snug break-words">
                  {formData.title || copy.untitledGroup}
                </CardTitle>
                <CardDescription className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed break-words">
                  {formData.description || copy.previewDescription}
                </CardDescription>
              </div>

              {/* College & Department & Year Pills */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 content-start">
                <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-soft-border)]">
                  {collegeDisplay}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-[var(--radius-xs)] text-xs font-medium bg-[var(--surface-container-low)] text-[var(--text-secondary)] border border-[var(--border)]">
                  {departmentDisplay}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-[var(--radius-xs)] text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-container-low)] border border-[var(--border)]">
                  {currentYear}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium bg-[var(--surface-container-high)] text-[var(--text-secondary)]">
                  {formData.meetingFormat === "Online"
                    ? copy.formatOnline
                    : formData.meetingFormat === "Offline"
                      ? copy.formatOffline
                      : copy.formatHybrid}
                </span>
              </div>

              {/* Tags Preview */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Footer: Leader Avatar & Members Count */}
              <CardFooter className="pt-3 border-t border-[var(--border-muted)]">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.name || copy.leaderYou}
                    size="md"
                    className="ring-1 ring-[var(--border)] shrink-0"
                  />
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {user?.name || copy.verifiedStudent}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate">
                      {departmentDisplay}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right pl-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)] font-mono">
                    1
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    /{formData.maxMembers}{" "}
                    <ScrambleText text={copy.membersUnit} />
                  </span>
                </div>
              </CardFooter>

              {/* Preview action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 ">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full text-xs"
                >
                  <ScrambleText text={t.groupsPage.viewDetails} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled
                  className="w-full text-xs"
                >
                  <ScrambleText text={t.groupsPage.join} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Live Preview: Role Quota & Team Structure (Matching groups/[id]) */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-muted)] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  <ScrambleText text={t.groupDetail.rolesTitle} />
                </h4>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                1/{formData.maxMembers}{" "}
                <ScrambleText text={t.groupDetail.members} />
              </span>
            </div>

            {formData.rolesQuota && formData.rolesQuota.length > 0 ? (
              <div className="space-y-3 pt-1">
                <RoleQuota
                  variant="detailed"
                  roles={formData.rolesQuota}
                  className="space-y-2.5"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 pt-1">
                  {formData.rolesQuota.map((r, i) => {
                    const isLeaderRole = selectedLeaderRoleIndex === i;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border space-y-1 transition-colors ${
                          isLeaderRole
                            ? "border-[var(--primary)] bg-[var(--primary-soft)]/20 shadow-xs ring-1 ring-[var(--primary)]/15"
                            : "border-[var(--border)] bg-[var(--surface-container-low)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isLeaderRole && (
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {r.role || `${copy.roleNameLabel} ${i + 1}`}
                            </span>
                          </div>
                          <Badge
                            variant={
                              r.current >= r.max ? "neutral" : "recruiting"
                            }
                            size="sm"
                            className="shrink-0"
                          >
                            <ScrambleText
                              text={
                                r.current >= r.max
                                  ? t.groupDetail.filled
                                  : t.groupDetail.open
                              }
                            />
                          </Badge>
                        </div>
                        {r.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed break-words">
                            {r.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Card>

          {/* Quick Tips Box */}
          <Card className="p-4 bg-[var(--surface-container-low)] border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Sparkles className="w-4 h-4 text-[var(--warning)]" />
              <span>
                <ScrambleText text={copy.creatorTipsTitle} />
              </span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
              <li>
                <ScrambleText text={copy.creatorTipCourse} />
              </li>
              <li>
                <ScrambleText text={copy.creatorTipSchedule} />
              </li>
              <li>
                <ScrambleText text={copy.creatorTipApplications} />
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* 3. Modal Thông báo thành công */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => router.push("/manage")}
        title={copy.successTitle}
        description={copy.successDesc}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  createdGroup ? `/groups/${createdGroup.id}` : "/groups",
                )
              }
              className="text-xs font-semibold"
            >
              <ScrambleText text={copy.viewGroupBtn} />
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/manage")}
              className="text-xs font-semibold"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              <ScrambleText text={copy.goToManageBtn} />
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-[var(--success-bg)] border border-[var(--success-border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--success)] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--success-text)]">
                {createdGroup?.title || formData.title}
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {createdGroup?.college || collegeDisplay} ·{" "}
                {createdGroup?.department || departmentDisplay} ·{" "}
                {formData.maxMembers} <ScrambleText text={copy.membersUnit} />
              </p>
            </div>
          </div>

          {formData.rolesQuota.length > 0 && (
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-container-low)] space-y-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {t.groupDetail.rolesTitle}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formData.rolesQuota.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]"
                  >
                    <span className="font-medium">
                      {r.role || `${copy.roleNameLabel} ${i + 1}`}
                    </span>
                    <span className="font-mono text-[var(--primary)] font-semibold">
                      ({r.max})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
