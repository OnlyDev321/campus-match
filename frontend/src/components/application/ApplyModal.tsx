"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
  Code2,
  Globe,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Modal, Button, Badge, Avatar, Input } from "@/design-system";
import { useAuth } from "@/context/AuthContext";
import type { GroupCardData, GroupRoleQuota } from "@/lib/types";

export interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: (GroupCardData & { rolesQuota?: GroupRoleQuota[] }) | null;
  onSuccess?: (groupId: string) => void;
}

export default function ApplyModal({
  isOpen,
  onClose,
  group,
  onSuccess,
}: ApplyModalProps) {
  const { user, isLoggedIn, openLoginModal } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [statement, setStatement] = useState<string>("");
  const [skills, setSkills] = useState<string>();
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [portfolioUrl, setPortfolioUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available roles to pick from
  const availableRoles = React.useMemo(() => {
    if (!group) return [];
    if (group.rolesQuota && group.rolesQuota.length > 0) {
      return group.rolesQuota.map((r) => r.role);
    }
    return [
      "Frontend Developer",
      "Backend Developer",
      "Fullstack Developer",
      "UI/UX Designer",
      "AI / ML Engineer",
      "General Member",
    ];
  }, [group]);

  // Set default role when opened
  React.useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMsg(null);
      if (availableRoles.length > 0 && !selectedRole) {
        setSelectedRole(availableRoles[0]);
      }
    }
  }, [isOpen, availableRoles, selectedRole]);

  if (!group) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!selectedRole) {
      setErrorMsg("Please select a target role.");
      return;
    }

    if (!statement.trim() || statement.trim().length < 10) {
      setErrorMsg(
        "Please write a short introduction (at least 10 characters).",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate sending application to Backend: POST /api/groups/{id}/applications
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(group.id);
      }
    }, 700);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setStatement("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>Apply to Join Group</span>
        </div>
      }
      description={`Submit your application for "${group.title}" (${group.course})`}
    >
      {isSuccess ? (
        /* Success Screen */
        <div className="py-8 px-4 text-center space-y-5 animate-in fade-in-50 zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Application Submitted!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Your application has been delivered to{" "}
              <strong>{group.leaderName}</strong>. You will be notified once the
              group leader reviews your profile.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface-container-low)] border border-[var(--border)] max-w-sm mx-auto text-xs text-[var(--text-muted)] space-y-1">
            <div className="flex justify-between">
              <span>Target Role:</span>
              <strong className="text-[var(--text-primary)]">
                {selectedRole}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Target Group:</span>
              <span className="text-[var(--text-primary)] truncate max-w-[200px]">
                {group.title}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleFinish} className="px-8 font-semibold">
              Done & Return
            </Button>
          </div>
        </div>
      ) : (
        /* Form Screen */
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Student Profile Preview Banner (u-SAINT identity) */}
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-container-low)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                name={user?.name || "Student"}
                size="md"
                className="ring-1 ring-[var(--border)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {user?.name || "Soongsil Student"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--success-text)] bg-[var(--success-bg)] px-2 py-0.5 rounded border border-[var(--success-border)]">
                    <ShieldCheck className="w-3 h-3" />
                    u-SAINT
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.studentId || "2021****"} •{" "}
                  {user?.department || group.department} •{" "}
                  {user?.academicYear
                    ? `Year ${user.academicYear}`
                    : "Undergraduate"}
                </p>
              </div>
            </div>
            <Badge variant="neutral" size="sm" mono>
              Applicant
            </Badge>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Desired Role in Group{" "}
              <span className="text-[var(--error)]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none border cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-container)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivation / Statement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="apply-statement"
                className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
              >
                Introduction & Motivation{" "}
                <span className="text-[var(--error)]">*</span>
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                {statement.length}/500 chars
              </span>
            </div>
            <textarea
              id="apply-statement"
              rows={4}
              maxLength={500}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Briefly introduce your relevant coursework, skills, or what you want to achieve with the team (e.g. Aiming for an A+, available for weekly meetings on weekends)..."
              style={{ borderRadius: "var(--radius-input)" }}
              className="w-full p-3 text-sm bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--primary-container)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all resize-none"
            />
          </div>

          {/* Relevant Skills (Free-form text input) */}
          <div className="space-y-1.5">
            <Input
              label="Relevant Skills / Tech Stack"
              placeholder="e.g. React, Next.js, Go, Spring Boot, Python, Figma, Docker..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              helperText="Feel free to freely list your programming languages, frameworks, or tools."
            />
          </div>

          {/* Optional Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Link (Optional)"
              placeholder="github.com/username"
              leftIcon={<Code2 className="w-3.5 h-3.5" />}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <Input
              label="Portfolio / Website (Optional)"
              placeholder="https://myportfolio.dev"
              leftIcon={<Globe className="w-3.5 h-3.5" />}
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-[var(--error-bg)] border border-[var(--error-border)] text-xs text-[var(--error-text)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-muted)]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
