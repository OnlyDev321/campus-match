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

## 4. Internationalization (i18n) & Language Synchronization Rule

- **Tuyệt đối không hardcode văn bản**: Mọi chuỗi hiển thị trên giao diện (tiêu đề, nhãn, nút bấm, placeholder, thông báo lỗi, thông báo thành công, modal, toast) KHÔNG được viết cứng một ngôn ngữ cố định (tiếng Việt, tiếng Anh hoặc tiếng Hàn) trong mã nguồn JSX/TSX.
- **Đồng bộ toàn bộ từ điển**: Khi bổ sung bất kỳ chuỗi mới nào, PHẢI cập nhật đồng thời và đầy đủ trên cả 3 từ điển:
  - `frontend/src/i18n/dictionaries/en.ts` (Tiếng Anh - nguồn định nghĩa gốc kiểu `TranslationDict`)
  - `frontend/src/i18n/dictionaries/ko.ts` (Tiếng Hàn)
  - `frontend/src/i18n/dictionaries/vi.ts` (Tiếng Việt)
- **Truy xuất thông qua `useLanguageStore`**:
  - Trong component, luôn lấy đối tượng dịch `t` và mã ngôn ngữ hiện tại từ Zustand:
    `const { t, language } = useLanguageStore();`
  - Render chuỗi thông qua `t.<namespace>.<key>`.
- **Đồng bộ thông báo lỗi và trạng thái từ API / Store**:
  - Không hiển thị chuỗi lỗi thô từ server nếu chuỗi đó bị cố định ngôn ngữ.
  - Luôn sử dụng mã lỗi chuẩn hóa (`errorCode` như `INVALID_CREDENTIALS`, `MISSING_FIELDS`, `SERVER_ERROR`, `NETWORK_ERROR`...) và ánh xạ sang `t.<namespace>.<errorKey>`.
  - Đảm bảo tính phản ứng tức thì (Reactive): Khi người dùng thay đổi ngôn ngữ qua `LanguageSwitcher`, tất cả thông báo lỗi và trạng thái đang hiển thị trên màn hình phải **tự động cập nhật tức thời sang ngôn ngữ vừa chọn**.
  - Khi gọi các API endpoint BFF hoặc Backend, luôn gửi kèm ngôn ngữ hiện tại thông qua header `Accept-Language` hoặc tham số `language` lấy từ `useLanguageStore.getState().language`.
