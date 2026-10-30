"use client";

import React, { useState } from "react";
import { Modal, Input, Button, Badge } from "@/design-system";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { ShieldCheck, User, Lock, AlertCircle } from "lucide-react";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuthStore();
  const { t } = useLanguageStore();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const getDisplayedError = (): string | null => {
    if (!errorCode && !customError) return null;
    switch (errorCode) {
      case "MISSING_FIELDS":
        return t.loginModal.errorMissing;
      case "INVALID_CREDENTIALS":
        return t.loginModal.errorInvalidCredentials;
      case "SERVER_ERROR":
        return t.loginModal.errorServer;
      case "NETWORK_ERROR":
        return t.loginModal.errorNetwork;
      default:
        return customError || t.loginModal.errorInvalidCredentials;
    }
  };

  const displayedError = getDisplayedError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setCustomError(null);
    setIsSubmitting(true);

    const res = await login(studentId, password);
    setIsSubmitting(false);

    if (!res.success) {
      if (res.errorCode) {
        setErrorCode(res.errorCode);
      } else if (res.error) {
        // Ánh xạ chuỗi lỗi cũ nếu backend trả về message thô
        if (
          res.error.includes("Sai") ||
          res.error.includes("비밀번호") ||
          res.error.includes("Invalid") ||
          res.error.includes("올바르지")
        ) {
          setErrorCode("INVALID_CREDENTIALS");
        } else if (
          res.error.includes("bắt buộc") ||
          res.error.includes("입력")
        ) {
          setErrorCode("MISSING_FIELDS");
        } else {
          setCustomError(res.error);
        }
      } else {
        setErrorCode("INVALID_CREDENTIALS");
      }
    } else {
      // Clear form on success
      setStudentId("");
      setPassword("");
    }
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => {
        setErrorCode(null);
        setCustomError(null);
        closeLoginModal();
      }}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-(--primary-container) flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
            SSU
          </div>
          <div>
            <h3 className="text-base font-bold text-(--text-primary) tracking-tight">
              {t.loginModal.title}
            </h3>
            <p className="text-xs text-(--text-muted) font-normal">
              {t.loginModal.subtitle}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Error banner */}
        {displayedError && (
          <div className="p-3 rounded-lg bg-(--error-bg) border border-(--error-border) flex items-start gap-2.5 text-(--error-text) text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Student ID input */}
        <div>
          <Input
            label={t.loginModal.studentIdLabel}
            placeholder={t.loginModal.studentIdPlaceholder}
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              if (errorCode || customError) {
                setErrorCode(null);
                setCustomError(null);
              }
            }}
            leftIcon={<User className="w-4 h-4" />}
            autoFocus
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Portal password input */}
        <div>
          <Input
            label={t.loginModal.passwordLabel}
            type="password"
            placeholder={t.loginModal.passwordPlaceholder}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorCode || customError) {
                setErrorCode(null);
                setCustomError(null);
              }
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            {isSubmitting ? t.loginModal.submittingBtn : t.loginModal.submitBtn}
          </Button>
        </div>

        {/* Security guarantee footer */}
        <div className="p-3.5 rounded-xl bg-(--surface-container-low) border border-(--border) flex items-start gap-3 mt-3">
          <ShieldCheck className="w-5 h-5 text-(--success) shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-(--text-primary)">
              {t.loginModal.securityGuaranteeTitle}
            </p>
            <p className="text-(--text-secondary) leading-relaxed">
              {t.loginModal.securityGuaranteeDesc}
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
