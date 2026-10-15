"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button, Badge } from "@/design-system";
import {
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Lock,
  Code2,
  CheckCircle2,
  Users,
  Compass,
  Trophy,
} from "lucide-react";

export default function LandingPage() {
  const { isLoggedIn, openLoginModal } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-14 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[var(--surface-container-low)]/40 via-[var(--background)] to-[var(--background)]">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-[var(--primary)]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {t.landing.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.18]">
            {t.landing.heroTitlePrefix} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--primary-container)] to-blue-500 bg-clip-text text-transparent">
              {t.landing.heroTitleHighlight}
            </span>{" "}
            {t.landing.heroTitleSuffix}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed">
            {t.landing.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isLoggedIn ? (
              <Button
                variant="primary"
                size="lg"
                href="/groups"
                className="w-full sm:w-auto shadow-md h-12 px-7 text-sm font-semibold rounded-xl"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t.landing.seeGroupsBtn}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => openLoginModal("/groups")}
                  className="w-full sm:w-auto shadow-md h-12 px-7 text-sm font-semibold rounded-xl"
                  leftIcon={<GraduationCap className="w-5 h-5" />}
                >
                  {t.landing.startBtn}
                </Button>
              </>
            )}
          </div>

          {/* Social Proof Trust Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[var(--text-muted)] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
              {t.landing.trustBadge1}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500" /> {t.landing.trustBadge2}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />{" "}
              {t.landing.trustBadge3}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars / Features */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <Badge variant="primary" size="md">
              CORE FEATURES
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {t.landing.coreFeaturesTitle}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              {t.landing.coreFeaturesSubtitle}
            </p>
          </div>

          {/* 3 Redesigned Spacious Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group relative p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-level-2)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
              <div>
                {/* Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                  <GraduationCap className="w-6 h-6" />
                </div>
                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2.5">
                  {t.landing.feature1Title}
                </h3>
                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t.landing.feature1Desc}
                </p>
              </div>

              {/* Sub Info Footer */}
              <div className="mt-6 pt-4 border-t border-[var(--border-muted)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">{t.landing.feature1Sub}</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500 hover:shadow-[var(--shadow-level-2)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
              <div>
                {/* Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2.5">
                  {t.landing.feature2Title}
                </h3>
                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t.landing.feature2Desc}
                </p>
              </div>

              {/* Sub Info Footer */}
              <div className="mt-6 pt-4 border-t border-[var(--border-muted)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{t.landing.feature2Sub}</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-purple-500 hover:shadow-[var(--shadow-level-2)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
              <div>
                {/* Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                  <Code2 className="w-6 h-6" />
                </div>
                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2.5">
                  {t.landing.feature3Title}
                </h3>
                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t.landing.feature3Desc}
                </p>
              </div>

              {/* Sub Info Footer */}
              <div className="mt-6 pt-4 border-t border-[var(--border-muted)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">{t.landing.feature3Sub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real-Time Stats Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface-container-low)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-1.5 shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--primary)] font-mono">
                1,200+
              </div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">
                {t.landing.statsStudents}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-1.5 shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                350+
              </div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">
                {t.landing.statsGroups}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-1.5 shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                94%
              </div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">
                {t.landing.statsCompletion}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-1.5 shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                100%
              </div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">
                {t.landing.statsVerification}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Callout */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface)] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t.landing.bottomCtaTitle}
          </h3>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {t.landing.bottomCtaSubtitle}
          </p>
        </div>
      </section>
    </div>
  );
}
