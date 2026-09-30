"use client";

import React, { useState } from "react";
import {
  useTheme,
  ThemeToggle,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  SearchInput,
  Checkbox,
  Radio,
  Avatar,
  AvatarGroup,
  Modal,
  RoleQuota,
  CompatibilityTag,
  CommandBar,
} from "@/design-system";
import {
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  Code2,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";

export default function DesignPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState("lead");
  const [checkboxState, setCheckboxState] = useState({
    typescript: true,
    tailwind: true,
    fullstack: false,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Hero / Header Section */}
      <section className="relative rounded-2xl p-8 sm:p-10 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-level-1)] overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="primary" dot pulse mono>
              DESIGN SYSTEM V2.0
            </Badge>
            <span className="text-xs font-mono text-[var(--text-muted)]" suppressHydrationWarning>
              Active Theme:{" "}
              <strong className="text-[var(--text-primary)] uppercase">
                {mounted ? resolvedTheme : "..."}
              </strong>{" "}
              ({mounted ? theme : "..."})
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            CampusMatch Unified Design System
          </h1>

          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Hệ thống Design System chung chuẩn hóa cho toàn bộ ứng dụng CampusMatch với 2 chế độ{" "}
            <span className="font-semibold text-[var(--text-primary)]">Light Mode</span> (SaaS thanh lịch, gọn gàng) và{" "}
            <span className="font-semibold text-[var(--text-primary)]">Dark Mode</span> (OLED tối giản, tập trung cho kỹ thuật & capstone).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <ThemeToggle variant="segmented" />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-3.5 h-3.5" />}
              onClick={() => setIsCommandOpen(true)}
            >
              Mở Quick Search (⌘K)
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Layers className="w-3.5 h-3.5" />}
              onClick={() => setIsModalOpen(true)}
            >
              Xem Modal Dialog Mẫu
            </Button>
          </div>
        </div>
      </section>

      {/* Semantic Color Tokens Showcase */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            1. Bảng Token Màu Ngữ Nghĩa (Semantic Color Tokens)
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Tự động đổi màu mượt mà theo <code>DESIGN.md</code> khi đổi giữa Light và Dark theme.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--background)] border border-[var(--border)]" />
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Background</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--background</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--surface-container)] border border-[var(--border)]" />
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Surface Container</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--surface-container</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
              Aa
            </div>
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Primary Accent</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--primary</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] flex items-center justify-center text-xs font-bold">
              Success
            </div>
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Recruiting / Active</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--success</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--warning-text)] flex items-center justify-center text-xs font-bold">
              Pending
            </div>
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Warning State</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--warning</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-1.5">
            <div className="h-9 rounded-md bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] flex items-center justify-center text-xs font-bold">
              Error
            </div>
            <span className="text-xs font-semibold block text-[var(--text-primary)]">Destructive</span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">--error</span>
          </div>
        </div>
      </section>

      {/* Buttons & Interactive Elements */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            2. Nút Bấm & Hành Động (Button Variants)
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Radius tự thích ứng: 8px ở Light Mode và 6px sắc sảo ở Dark Mode.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-muted)]">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Small with Icon
            </Button>
            <Button variant="outline" size="md" rightIcon={<Send className="w-4 h-4" />}>
              Medium with Right Icon
            </Button>
            <Button variant="primary" size="lg" leftIcon={<Zap className="w-4 h-4" />}>
              Large Action
            </Button>
            <Button variant="primary" isLoading>
              Loading State
            </Button>
            <Button variant="outline" disabled>
              Disabled State
            </Button>
          </div>
        </div>
      </section>

      {/* Status Chips & Badges */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            3. Trạng Thái & Nhãn (Status Chips & Badges)
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Quy chuẩn mục 8.2: Recruiting (xanh lục), Pending (hổ phách), Closed (đỏ nhạt/xám đậm).
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-wrap items-center gap-3">
          <Badge variant="recruiting" dot pulse mono>
            RECRUITING
          </Badge>
          <Badge variant="active" dot>
            Active Project
          </Badge>
          <Badge variant="pending" dot>
            Pending Approval
          </Badge>
          <Badge variant="applying" dot>
            Applying (2 in review)
          </Badge>
          <Badge variant="closed" dot>
            Closed
          </Badge>
          <Badge variant="archived">Archived</Badge>
          <Badge variant="primary" mono>
            CS490 CAPSTONE
          </Badge>
          <Badge variant="neutral">React & Next.js</Badge>
          <Badge variant="neutral">FastAPI</Badge>
        </div>
      </section>

      {/* Cards & Domain-Specific Components (Section 8.3 & 8.7) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            4. Thẻ Nhóm Học Tập & Dự Án (Study Group & Project Cards)
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Bao gồm Course Code, Status Badge, Compatibility Score, Role Quota và Member Avatars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: CS490 Capstone */}
          <Card isInteractive>
            <CardHeader>
              <span className="font-mono text-xs font-semibold text-(--primary) tracking-wide">
                CS490 • CAPSTONE
              </span>
              <Badge variant="recruiting" size="sm" dot pulse mono>
                RECRUITING
              </Badge>
            </CardHeader>

            <CardTitle>AI Academic Planner & Study Matcher</CardTitle>
            <CardDescription>
              Xây dựng nền tảng hỗ trợ sinh viên tự động ghép nhóm theo lịch rảnh và môn học sử dụng LLM & Next.js.
            </CardDescription>

            <CardContent>
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                <CompatibilityTag score={94} label="Schedule Match" />
                <Badge variant="neutral" size="sm">
                  Next.js 16
                </Badge>
                <Badge variant="neutral" size="sm">
                  Python
                </Badge>
              </div>

              <div className="pt-2">
                <RoleQuota current={3} max={5} label="thành viên" />
              </div>
            </CardContent>

            <CardFooter>
              <AvatarGroup max={3} total={5} size="sm">
                <Avatar name="Hau Nguyen" />
                <Avatar name="Minh Tran" />
                <Avatar name="Lan Vu" />
              </AvatarGroup>

              <Button
                variant="primary"
                size="sm"
                onClick={() => alert("Ứng tuyển vào nhóm!")}
              >
                Ứng tuyển
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: IS334 System Design */}
          <Card isInteractive>
            <CardHeader>
              <span className="font-mono text-xs font-semibold text-[var(--text-muted)] tracking-wide">
                IS334 • HỆ THỐNG
              </span>
              <Badge variant="pending" size="sm" dot mono>
                PENDING
              </Badge>
            </CardHeader>

            <CardTitle>Distributed Microservices Simulator</CardTitle>
            <CardDescription>
              Thiết kế hệ thống phân tán chịu tải cao mô phỏng đăng ký tín chỉ thời gian thực cho 20,000 sinh viên.
            </CardDescription>

            <CardContent>
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                <CompatibilityTag score={88} label="Skills Match" />
                <Badge variant="neutral" size="sm">
                  Go / Docker
                </Badge>
                <Badge variant="neutral" size="sm">
                  Kafka
                </Badge>
              </div>

              <div className="pt-2">
                <RoleQuota current={4} max={4} label="đầy chỗ" />
              </div>
            </CardContent>

            <CardFooter>
              <AvatarGroup max={4} total={4} size="sm">
                <Avatar name="Quoc Bao" />
                <Avatar name="Duy Anh" />
                <Avatar name="Thu Trang" />
                <Avatar name="Son Tung" />
              </AvatarGroup>

              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>

          {/* Card 3: Detailed Role Quota */}
          <Card isInteractive>
            <CardHeader>
              <span className="font-mono text-xs font-semibold text-(--secondary) tracking-wide">
                SE214 • SOFTWARE ARCH
              </span>
              <Badge variant="recruiting" size="sm" dot mono>
                RECRUITING
              </Badge>
            </CardHeader>

            <CardTitle>Campus Event Ticketing WebApp</CardTitle>
            <CardDescription>
              Phần mềm quản lý vé và check-in QR code cho câu lạc bộ sinh viên với dashboard thời gian thực.
            </CardDescription>

            <CardContent>
              <RoleQuota
                variant="detailed"
                roles={[
                  { role: "Frontend (React)", current: 1, max: 2 },
                  { role: "Backend (Node.js)", current: 1, max: 1 },
                  { role: "UI/UX Designer", current: 0, max: 1 },
                ]}
              />
            </CardContent>

            <CardFooter>
              <AvatarGroup max={2} total={4} size="sm">
                <Avatar name="Thao Nguyen" />
                <Avatar name="Khang Le" />
              </AvatarGroup>

              <Button variant="primary" size="sm">
                Xem vai trò
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Form Controls & Inputs */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            5. Trường Nhập Liệu & Form (Form Controls & Inputs)
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Height 38px, focus ring chuẩn xanh SaaS, hỗ trợ validation error text và shortcut keys.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="Tên Dự Án / Nhóm Học"
              placeholder="VD: Nhóm Capstone AI 2026"
              helperText="Tên nhóm nên kèm mã môn học để dễ tìm kiếm"
            />

            <Input
              label="Mã Lớp Học Phần"
              placeholder="CS490.O12"
              defaultValue="CS490"
            />

            <Input
              label="Số Điện Thoại Trưởng Nhóm"
              placeholder="0912345678"
              error="Số điện thoại chưa đúng định dạng"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Tìm kiếm toàn bộ nhóm
            </label>
            <SearchInput placeholder="Nhập từ khóa tìm kiếm (bấm ⌘K để mở)..." />

            <div className="pt-2 space-y-3">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Kỹ Năng Yêu Cầu (Checkboxes)
              </label>
              <div className="flex flex-col gap-2.5">
                <Checkbox
                  label="TypeScript & Next.js"
                  description="Cần kiến thức cơ bản về React 19 và Tailwind"
                  checked={checkboxState.typescript}
                  onChange={(e) =>
                    setCheckboxState({ ...checkboxState, typescript: e.target.checked })
                  }
                />
                <Checkbox
                  label="Tailwind CSS v4"
                  checked={checkboxState.tailwind}
                  onChange={(e) =>
                    setCheckboxState({ ...checkboxState, tailwind: e.target.checked })
                  }
                />
                <Checkbox
                  label="Fullstack Deployment"
                  checked={checkboxState.fullstack}
                  onChange={(e) =>
                    setCheckboxState({ ...checkboxState, fullstack: e.target.checked })
                  }
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Vai Trò Dự Án (Radio Options)
              </label>
              <div className="flex items-center gap-5">
                <Radio
                  name="role"
                  label="Trưởng nhóm (Lead)"
                  checked={selectedRadio === "lead"}
                  onChange={() => setSelectedRadio("lead")}
                />
                <Radio
                  name="role"
                  label="Thành viên (Member)"
                  checked={selectedRadio === "member"}
                  onChange={() => setSelectedRadio("member")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Usage Quick Guide */}
      <section className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
          <Code2 className="w-4 h-4 text-(--primary)" />
          <span>Cách Tái Sử Dụng Design System Trong Code</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Mọi component và hook đều được đóng gói và export tại <code>@/design-system</code>.
        </p>
        <pre className="p-4 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-mono overflow-x-auto">
{`import { 
  Button, 
  Badge, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  RoleQuota, 
  CompatibilityTag, 
  SearchInput, 
  useTheme 
} from "@/design-system";

// Dùng hook lấy theme hiện tại hoặc chuyển theme:
const { theme, resolvedTheme, toggleTheme } = useTheme();

// Dùng component:
<Card isInteractive>
  <CardHeader>
    <Badge variant="recruiting" dot>RECRUITING</Badge>
  </CardHeader>
  <CardTitle>Nhóm CS490 Capstone</CardTitle>
  <CardContent>
    <CompatibilityTag score={94} />
    <RoleQuota current={3} max={5} />
  </CardContent>
  <CardFooter>
    <Button variant="primary">Ứng tuyển</Button>
  </CardFooter>
</Card>`}
        </pre>
      </section>

      {/* Sample Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng Ký Tham Gia Nhóm Nghiên Cứu"
        description="Vui lòng điền thông tin và thời gian rảnh của bạn để trưởng nhóm liên hệ."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert("Đơn đăng ký của bạn đã được gửi!");
                setIsModalOpen(false);
              }}
            >
              Gửi Đơn Ứng Tuyển
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên sinh viên"
            placeholder="VD: Nguyễn Văn A"
            defaultValue="Nguyễn Văn A"
          />
          <Input
            label="Mã số sinh viên (MSSV)"
            placeholder="VD: 21520000"
            defaultValue="21520000"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Lời nhắn gửi trưởng nhóm
            </label>
            <textarea
              rows={3}
              placeholder="Giới thiệu về kỹ năng, kinh nghiệm và mong muốn đóng góp cho dự án..."
              style={{ borderRadius: "var(--radius-input)" }}
              className="w-full p-3 text-xs bg-(--surface) text-(--text-primary) border border-(--border) focus:outline-none focus:border-(--primary-container) focus:ring-2 focus:ring-(--focus-ring) placeholder:text-(--text-faint)"
            />
          </div>
        </div>
      </Modal>

      {/* Command Bar quick search */}
      <CommandBar
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}
