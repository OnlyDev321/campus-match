"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/design-system";
import {
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Lock,
  Code2,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const { isLoggedIn, openLoginModal } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[var(--surface-container-low)]/50 via-[var(--background)] to-[var(--background)]">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--primary)]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {t.landing.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
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
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isLoggedIn ? (
              <Button
                variant="primary"
                size="lg"
                href="/groups"
                className="w-full sm:w-auto shadow-md"
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
                  className="w-full sm:w-auto shadow-md"
                  leftIcon={<GraduationCap className="w-5 h-5" />}
                >
                  {t.landing.startBtn}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/groups"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t.landing.browseBtn}
                </Button>
              </>
            )}
          </div>

          {/* Social Proof Trust Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.landing.trustBadge1}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500" /> {t.landing.trustBadge2}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> {t.landing.trustBadge3}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars / Features */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="primary" size="md">
              CORE FEATURES
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {t.landing.coreFeaturesTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              {t.landing.coreFeaturesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle>{t.landing.feature1Title}</CardTitle>
                <CardDescription>
                  {t.landing.feature1Desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                {t.landing.feature1Sub}
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle>{t.landing.feature2Title}</CardTitle>
                <CardDescription>
                  {t.landing.feature2Desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                {t.landing.feature2Sub}
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Code2 className="w-5 h-5" />
                </div>
                <CardTitle>{t.landing.feature3Title}</CardTitle>
                <CardDescription>
                  {t.landing.feature3Desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                {t.landing.feature3Sub}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Real-Time Stats Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface-container-low)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--primary)] font-mono">
                1,200+
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                {t.landing.statsStudents}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                350+
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                {t.landing.statsGroups}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                94%
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                {t.landing.statsCompletion}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                100%
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                {t.landing.statsVerification}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Callout */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface)] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.landing.bottomCtaTitle}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {t.landing.bottomCtaSubtitle}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openLoginModal("/groups")}
              leftIcon={<GraduationCap className="w-5 h-5" />}
            >
              {t.landing.startBtn}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
