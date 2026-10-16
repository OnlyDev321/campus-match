# CAMPUSMATCH — AI AGENT CODING GUIDELINES

## 1. Centralized Type & Interface Rule

- Mọi `interface` và `type` của ứng dụng frontend PHẢI được định nghĩa tập trung trong `frontend/src/lib/types.ts`.
- Khi cần sử dụng ở bất kỳ đâu (Component, Store, Service, API route), luôn export từ `lib/types.ts` và import:
  `import type { ... } from "@/lib/types";`
- Không được định nghĩa interface/type cục bộ phân tán rải rác trong từng file component hay store.
- Mọi type/interface mới phải có chú thích JSDoc tiếng Việt rõ ràng cho từng trường.

## 2. Design System & Styling Rule

- TUÂN THỦ TUYỆT ĐỐI hệ thống thiết kế tại `frontend/src/design-system/`:
  - Luôn tái sử dụng các component có sẵn: `Button`, `Input`, `Modal`, `Badge`, `Card`, `Avatar`, `RoleQuota`, `CompatibilityTag`...
  - Không tự tiện tạo lại các component cơ bản hoặc viết CSS tùy biến đè lên design tokens.
- Sử dụng CSS Variables theo chuẩn semantic tokens từ `frontend/src/app/globals.css` (ví dụ: `var(--background)`, `var(--text-primary)`, `var(--primary)`, `var(--border-subtle)`).
- Hỗ trợ đầy đủ cả Light Mode và Dark Mode qua `ThemeProvider`.

## 3. Architecture Alignment (Dựa trên architecture.md)

- Tuân thủ cấu trúc phân tầng đã thống nhất trong `architecture.md`:
  - `stores/`: Chỉ chứa logic quản lý state toàn cục với Zustand (ví dụ: `authStore.ts`, `languageStore.ts`), không tạo Provider bọc bên ngoài.
  - `services/`: Chứa các hàm gọi API endpoint (kết nối BFF Next.js hoặc Spring Boot Backend).
  - `app/api/`: BFF layer xử lý các logic nhạy cảm (như u-SAINT SSO proxy qua `lib/usaint.ts`).
- Tuyệt đối không import hoặc phụ thuộc vào thư mục tài liệu tham khảo tạm thời `ssuonepage` (sẽ bị xóa sau này).
