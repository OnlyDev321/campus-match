"use client";

import React, { useState } from "react";
import { Modal, Input, Button, Badge } from "@/design-system";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, User, Lock, AlertCircle, Sparkles } from "lucide-react";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(studentId, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || t.loginModal.errorMissing);
    } else {
      // Clear form on success
      setStudentId("");
      setPassword("");
    }
  };

  const handleFillDemo = () => {
    setStudentId("20211234");
    setPassword("soongsil2026!");
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
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
        {errorMessage && (
          <div className="p-3 rounded-lg bg-(--error-bg) border border-(--error-border) flex items-start gap-2.5 text-(--error-text) text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Student ID input */}
        <div>
          <Input
            label={t.loginModal.studentIdLabel}
            placeholder={t.loginModal.studentIdPlaceholder}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Quick Demo Fill button */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 text-xs text-(--primary) hover:underline font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.loginModal.demoFillBtn}</span>
          </button>
          <span className="text-(--text-faint)">{t.loginModal.demoDept}</span>
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
