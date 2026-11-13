"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Info,
  Layers,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
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
  Radio,
} from "@/design-system";
import { createGroup } from "@/services/groupService";
import { useRequireLogin } from "@/lib/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import type {
  CreateGroupFormData,
  CreateGroupFormErrors,
  CreateGroupResponse,
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
    meetingFormat: "Hybrid",
    tags: [],
  });

  const [currentTagInput, setCurrentTagInput] = useState("");
  const [errors, setErrors] = useState<CreateGroupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<CreateGroupResponse | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Xử lý cập nhật trường dữ liệu
  const updateField = <K extends keyof CreateGroupFormData>(
    field: K,
    value: CreateGroupFormData[K]
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
      if (trimmed && !formData.tags.includes(trimmed) && formData.tags.length < 5) {
        updateField("tags", [...formData.tags, trimmed]);
        setCurrentTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Tăng giảm sĩ số
  const handleCapacityChange = (delta: number) => {
    const nextVal = Math.max(2, Math.min(20, formData.maxMembers + delta));
    updateField("maxMembers", nextVal);
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
      const response = await createGroup(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          courseCode: formData.courseCode.trim() || undefined,
          courseName: formData.courseName.trim() || undefined,
          maxMembers: formData.maxMembers,
        },
        user
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
          <span aria-hidden="true" className="text-[var(--text-faint)]">/</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <div
                        key={format.id}
                        className={`p-3.5 rounded-[var(--radius-input)] border transition-colors ${isSelected ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"}`}
                      >
                        <Radio
                          id={`meeting-format-${format.id}`}
                          name="meetingFormat"
                          value={format.id}
                          checked={isSelected}
                          onChange={() => updateField("meetingFormat", format.id)}
                          label={<span className="flex items-center gap-2"><IconComponent className="h-4 w-4 text-[var(--primary)]" />{format.label}</span>}
                          description={format.desc}
                          className="peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]"
                        />
                      </div>
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

                    <div role="status" aria-labelledby="max-members-label" className="w-16 text-center font-mono font-bold text-lg text-[var(--primary)]">
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
                  <ScrambleText text={copy.leaderNoticeDesc
                    .replace("{college}", collegeDisplay)
                    .replace("{department}", departmentDisplay)} />
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
                <ScrambleText text={isSubmitting ? copy.submittingBtn : copy.submitBtn} />
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
                  {formData.courseCode || formData.courseName || copy.generalStudy}
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
                  {formData.description ||
                    copy.previewDescription}
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
                  {formData.meetingFormat === "Online" ? copy.formatOnline : formData.meetingFormat === "Offline" ? copy.formatOffline : copy.formatHybrid}
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
                    /{formData.maxMembers} <ScrambleText text={copy.membersUnit} />
                  </span>
                </div>
              </CardFooter>

              {/* Mock Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 ">
                <Button variant="outline" size="sm" disabled className="w-full text-xs">
                  <ScrambleText text={t.groupsPage.viewDetails} />
                </Button>
                <Button variant="primary" size="sm" disabled className="w-full text-xs">
                  <ScrambleText text={t.groupsPage.join} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Tips Box */}
          <Card className="p-4 bg-[var(--surface-container-low)] border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Sparkles className="w-4 h-4 text-[var(--warning)]" />
              <span><ScrambleText text={copy.creatorTipsTitle} /></span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
              <li><ScrambleText text={copy.creatorTipCourse} /></li>
              <li><ScrambleText text={copy.creatorTipSchedule} /></li>
              <li><ScrambleText text={copy.creatorTipApplications} /></li>
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
              onClick={() => router.push("/groups")}
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
                {createdGroup?.college || collegeDisplay} · {createdGroup?.department || departmentDisplay} · {formData.maxMembers} <ScrambleText text={copy.membersUnit} />
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
