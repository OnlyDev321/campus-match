"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/design-system";
import {
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Lock,
  Code2,
  CheckCircle2,
  Cpu,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const { isLoggedIn, openLoginModal } = useAuth();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[var(--surface-container-low)]/50 via-[var(--background)] to-[var(--background)]">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--primary)]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              숭실대학교 공식 학사 연동 · 2026학년도 스터디 매칭
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            신뢰할 수 있는 학우와, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--primary-container)] to-blue-500 bg-clip-text text-transparent">
              완벽한 스터디 & 프로젝트 팀
            </span>
            을 완성하세요.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed">
            CampusMatch는 숭실대학교 <strong>u-SAINT 포털 단일 인증(SSO)</strong>을 통해 100% 신원이 검증된 학생들만 참여하는 캠퍼스 전용 팀원 매칭 플랫폼입니다.
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
                스터디 & 프로젝트 둘러보기
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
                  숭실대 u-SAINT으로 시작하기
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/groups"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  모집 중인 그룹 미리보기
                </Button>
              </>
            )}
          </div>

          {/* Social Proof Trust Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% 숭실대 재학생 인증
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500" /> 비밀번호 무저장 원칙
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> 학과 & 전공 맞춤 매칭
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
              왜 숭실대 학생들은 CampusMatch를 선택할까요?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              익명 커뮤니티의 잠수, 무임승차, 허위 프로필 문제를 원천 차단하고 학업에만 집중할 수 있는 환경을 만듭니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle>100% u-SAINT SSO 인증</CardTitle>
                <CardDescription>
                  별도의 회원가입 없이 학교 포털 아이디로 즉시 로그인하며, 학번과 학과가 자동 연동되어 허위 계정을 원천 차단합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                컴퓨터학부 · 소프트웨어학부 · AI융합학부 등 단과대학 자동 분류
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle>Zero Password Retention</CardTitle>
                <CardDescription>
                  학생들의 포털 비밀번호는 서버 메모리에서 학교 SSO 서버와 검증하는 찰나에만 사용되며, DB에 0.1초도 저장되지 않습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                안전한 JWT Stateless 토큰 기반 세션 관리
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-(--shadow-level-2) transition-all duration-200">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Code2 className="w-5 h-5" />
                </div>
                <CardTitle>과목 & 기술 스택 매칭</CardTitle>
                <CardDescription>
                  캡스톤 디자인, 알고리즘 코딩 테스트, Spring Boot, React, Next.js 등 원하는 목표와 기술 태그로 팀원을 빠르게 구하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-[var(--text-muted)]">
                역할별 모집 인원(Frontend/Backend/Designer) 정원 관리
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
                인증된 숭실대 학우
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                350+
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                개설된 스터디 & 팀
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                94%
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                프로젝트 완주율
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                100%
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                신원 인증 검증
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Callout */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface)] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            이번 학기, 멋진 프로젝트를 함께할 팀원을 찾고 계신가요?
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            포털 아이디로 1초 만에 로그인하고, 숭실대 최고의 동료들과 함께 스터디를 시작해보세요.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openLoginModal("/groups")}
              leftIcon={<GraduationCap className="w-5 h-5" />}
            >
              지금 u-SAINT으로 시작하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
