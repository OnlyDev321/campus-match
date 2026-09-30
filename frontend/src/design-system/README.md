# CampusMatch UI Design System (v2.0)

Hệ thống Design System chung chuẩn hóa cho ứng dụng **CampusMatch** dựa trên đặc tả tại [DESIGN.md](../DESIGN.md).

Hỗ trợ 2 theme:
- ☀️ **Light Theme:** Giao diện SaaS hiện đại, sạch sẽ (`#FAF8FF`, bề mặt `#FFFFFF`, viền `#E2E8F0`, điểm nhấn xanh `#004AC6` / `#2563EB`, font Inter, radius 8px-12px).
- 🌙 **Dark Theme:** Không gian làm việc phong cách OLED tối giản (`#000000`, bề mặt `#131313`, viền `#1F1F23`, font Inter đồng nhất, radius 6px-8px, điểm nhấn electric blue).

---

## 1. Cấu trúc thư mục

```
src/design-system/
├── tokens.ts              # Design tokens chuẩn TypeScript (colors, typography, spacing, radius, elevation)
├── theme/
│   ├── ThemeProvider.tsx  # React Context quản lý 'light' | 'dark' | 'system' + lưu localStorage + chống chớp trắng FOUC
│   ├── ThemeToggle.tsx    # Nút chuyển theme (Icon toggle hoặc Segmented control)
│   └── useTheme.ts        # Hook lấy theme: theme, resolvedTheme, setTheme, toggleTheme
├── components/
│   ├── Button.tsx         # Primary, Secondary, Outline, Ghost, Destructive, Loading spinner, Left/Right icons
│   ├── Badge.tsx          # Status chips: Recruiting, Active, Pending, Applying, Closed, Archived (kèm đèn led dot/pulse)
│   ├── Card.tsx           # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter (kèm hover elevation)
│   ├── Input.tsx          # Input trường nhập liệu chuẩn 38px, label, helper text, error message, left/right icons
│   ├── SearchInput.tsx    # Thanh tìm kiếm nhanh kèm shortcut keycap badge (⌘K / Ctrl+K)
│   ├── Checkbox.tsx       # Checkbox 16x16 chuẩn theme
│   ├── Radio.tsx          # Radio button 16x16 chuẩn theme
│   ├── Avatar.tsx         # Avatar hình tròn & AvatarGroup đếm số thành viên còn lại (+N)
│   ├── Modal.tsx          # Modal dialog chuẩn Level 3 elevation, backdrop blur, phím Escape
│   ├── RoleQuota.tsx      # Quota vai trò trong nhóm (ví dụ: 3/5 thành viên hoặc phân vai Frontend/Backend)
│   ├── CompatibilityTag.tsx # Nhãn độ tương thích lịch học / kỹ năng (ví dụ: 94% Schedule Match)
│   └── CommandBar.tsx     # Quick search command palette toàn cục (bấm ⌘K để mở)
└── index.ts               # Barrel export tất cả component & hooks
```

---

## 2. Hướng dẫn sử dụng

### 2.1 Import Component từ Barrel Export

Tất cả component đều được export trực tiếp tại `@/design-system`:

```tsx
import {
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
  ThemeToggle,
  useTheme,
} from "@/design-system";
```

### 2.2 Quản lý và chuyển đổi Theme (`useTheme`)

```tsx
import { useTheme, ThemeToggle } from "@/design-system";

export function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Theme đang kích hoạt: {resolvedTheme}</p>
      {/* Nút bấm chuyển đổi nhanh */}
      <ThemeToggle />
      {/* Hoặc bộ chọn Segmented */}
      <ThemeToggle variant="segmented" />
    </div>
  );
}
```

### 2.3 Thẻ Nhóm Học Tập (Study Group Card)

```tsx
<Card isInteractive>
  <CardHeader>
    <span className="font-mono text-xs font-semibold text-[#2563EB]">CS490 • CAPSTONE</span>
    <Badge variant="recruiting" dot pulse mono>RECRUITING</Badge>
  </CardHeader>

  <CardTitle>AI Academic Planner</CardTitle>
  <CardDescription>
    Xây dựng nền tảng hỗ trợ sinh viên tự động ghép nhóm theo lịch rảnh và môn học.
  </CardDescription>

  <CardContent>
    <div className="flex gap-1.5">
      <CompatibilityTag score={94} label="Schedule Match" />
      <Badge variant="neutral" size="sm">Next.js 16</Badge>
    </div>
    <RoleQuota current={3} max={5} label="thành viên" />
  </CardContent>

  <CardFooter>
    <AvatarGroup max={3} total={5}>
      <Avatar name="Hau Nguyen" />
      <Avatar name="Minh Tran" />
      <Avatar name="Lan Vu" />
    </AvatarGroup>
    <Button variant="primary" size="sm">Ứng tuyển</Button>
  </CardFooter>
</Card>
```

### 2.4 Hộp thoại Modal & Command Palette

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Tiêu đề Modal"
  description="Mô tả phụ ngắn gọn"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
      <Button variant="primary">Xác nhận</Button>
    </>
  }
>
  <p>Nội dung form hoặc chi tiết...</p>
</Modal>
```

---

## 3. Các biến CSS (CSS Variables) dùng trong Tailwind hoặc CSS thuần

Nếu bạn viết CSS hoặc dùng inline styles, có thể tham chiếu trực tiếp các biến ngữ nghĩa:

- Nền & Mặt phẳng: `var(--background)`, `var(--surface)`, `var(--surface-container)`, `var(--surface-container-low)`
- Màu chữ: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--text-faint)`
- Đường viền: `var(--border)`, `var(--border-muted)`, `var(--border-strong)`
- Tương tác: `var(--primary)`, `var(--primary-hover)`, `var(--focus-ring)`
- Trạng thái: `var(--success-bg)`, `var(--success-text)`, `var(--warning-bg)`, `var(--warning-text)`, `var(--error-bg)`, `var(--error-text)`
- Bo góc: `var(--radius-button)`, `var(--radius-card)`, `var(--radius-input)`, `var(--radius-modal)`
- Đổ bóng: `var(--shadow-level-1)`, `var(--shadow-level-2)`, `var(--shadow-level-3)`
