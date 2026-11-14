# CampusMatch — kiến trúc hiện tại

Tài liệu này mô tả **mã nguồn trong repository tại ngày 14/11/2026**, không phải kế hoạch triển khai hay lời khẳng định về môi trường production. Nguồn sự thật của schema hiện là các JPA entity trong `backend/src/main/java/com/campusmatch/entity/` và `backend/src/main/java/com/campusmatch/academic/`; Hibernate dùng `ddl-auto: update`. Repository hiện không có thư mục migration hoặc Flyway/Liquibase.

## 1. Các tầng và luồng dữ liệu

```text
Browser (Next.js 16 / React 19 / TypeScript)
  ├─ app/pages + components + design-system
  ├─ Zustand: auth, language, notifications
  ├─ services → lib/api.ts → Spring Boot /api/* (JWT Bearer)
  └─ Next.js Route Handlers
       ├─ /api/auth/usaint → u-SAINT/SAP → Spring Boot /api/auth/sso/usaint
       └─ /api/translate → FactChat (nếu cấu hình FACTCHAT_API_KEY)
Spring Boot 4.1.1 / Java 17
  └─ controllers → services (@Transactional) → Spring Data JPA repositories
       └─ PostgreSQL (URL do DB_URL cung cấp)
```

- `frontend/src/app/layout.tsx` lắp Header, Sidebar, Footer, LoginModal và ThemeProvider. `frontend/src/design-system/` chứa component, tokens và theme. UI dùng ba từ điển `en`, `vi`, `ko` tại `frontend/src/i18n/dictionaries/`.
- `frontend/src/lib/types.ts` tập trung type/interface ứng dụng; `frontend/src/services/` đóng gói HTTP; `frontend/src/stores/` là state Zustand. `authStore` lưu profile, JWT và bản chụp thời khóa biểu trong localStorage; notification state được lấy lại từ database.
- Route `/api/auth/usaint` xác thực u-SAINT và lấy hồ sơ/thời khóa biểu SAP. Chỉ khi lấy được hồ sơ, route mới bàn giao profile cho Spring Boot để upsert `users` và cấp JWT. Mật khẩu và cookie SAP không được ghi vào PostgreSQL. Thời khóa biểu chỉ nằm trong phiên trình duyệt/localStorage, **không có bảng database**.
- Browser gọi Spring Boot trực tiếp qua `NEXT_PUBLIC_API_BASE_URL`. API public gồm danh sách/chi tiết nhóm, năm đăng, danh mục học vụ, thống kê và health; các thao tác cá nhân cần JWT. Service backend kiểm tra quyền leader/applicant trên từng thao tác.

## 2. Cấu trúc repository

```text
campus-match/
├─ frontend/
│  ├─ src/app/
│  │  ├─ page.tsx                   # Trang chủ + thống kê công khai
│  │  ├─ groups/page.tsx            # Tìm kiếm, lọc và phân trang nhóm
│  │  ├─ groups/[id]/page.tsx       # Chi tiết, thành viên, ứng tuyển
│  │  ├─ create-group/page.tsx      # Form tạo nhóm
│  │  ├─ manage/page.tsx            # Nhóm tôi dẫn dắt / đã tham gia
│  │  ├─ manage/[groupId]/page.tsx  # Sửa nhóm, duyệt đơn, xóa nhóm
│  │  ├─ mypage/page.tsx            # Hồ sơ và thời khóa biểu u-SAINT
│  │  └─ api/{auth/usaint,translate}/route.ts
│  ├─ src/components/{application,auth,common,group,layout}/
│  ├─ src/design-system/{components,theme}/
│  ├─ src/i18n/dictionaries/{en,vi,ko}.ts
│  ├─ src/lib/{api,hooks,types,usaint,timetable,timetableParser}.ts
│  ├─ src/services/{academic,application,group,notification,statistics,translation}Service.ts
│  └─ src/stores/{auth,language,notification}Store.ts
├─ backend/
│  ├─ src/main/java/com/campusmatch/
│  │  ├─ academic/                 # Đồng bộ danh mục SSU, entity snapshot, API
│  │  ├─ config/                   # Spring Security, CORS
│  │  ├─ controller/               # Auth, User, Group, Application, Notification, Statistics, Health
│  │  ├─ dto/                      # Request/response DTO (cùng một thư mục)
│  │  ├─ entity/                   # JPA schema và enum
│  │  ├─ repository/               # Spring Data JPA
│  │  ├─ security/                 # JWT và che mã sinh viên trong response công khai
│  │  └─ service/                  # Nghiệp vụ và transaction
│  ├─ src/main/resources/{application.yaml,academic/ssu-catalog.json}
│  └─ src/test/java/com/campusmatch/
└─ architecture.md
```

## 3. Mô hình database

| Bảng | Dữ liệu chính | Quan hệ / quy tắc |
| --- | --- | --- |
| `users` | `student_id` duy nhất, tên, khoa/viện, email, năm học, điện thoại, ảnh, role, thời gian đăng nhập | Hồ sơ từ u-SAINT; `student_id` bất biến, các trường hồ sơ còn lại được làm mới khi đăng nhập. |
| `study_groups` | leader, title, description, college, department, post_year, course_code/name, meeting_format, tags (JSONB), roles_quota (JSONB), contact_email/phone, max_members, status, timestamps | college/department lấy từ leader lúc tạo; contact chỉ lưu khi leader chọn công khai. Tối đa 5 tags, mỗi tag tối đa 50 ký tự; tổng `roles_quota[].max` bằng sức chứa khi tạo, leader chiếm 1 chỗ. |
| `group_members` | (group_id, user_id), role, joined_at | Khóa chính ghép; role `LEADER` hoặc `MEMBER`. |
| `applications` | group, applicant, statement, desired_role, status, timestamps | Duy nhất `(group_id, applicant_id)`; status `PENDING`, `ACCEPTED`, `REJECTED`. |
| `notifications` | recipient, actor, group, type, title, message, link, is_read, created_at | `is_read` và xóa được lưu ở DB. |
| `academic_catalog_snapshot` | id cố định 1, payload (TEXT) | Lưu bản danh mục học vụ SSU được xác thực; dùng JSON đi kèm ứng dụng làm dữ liệu khởi tạo, đồng bộ định kỳ từ nguồn SSU. |

`GroupStatus` còn enum `CLOSED` để đọc bản ghi cũ; form quản lý hiện không cho chọn trạng thái thủ công. Khi tạo nhóm hoặc thay đổi sức chứa, nhóm là `RECRUITING` nếu còn chỗ, `COMPLETED` khi đủ người. Khi duyệt thành viên cuối cùng, backend chuyển sang `COMPLETED`. Giảm sức chứa không được thấp hơn số thành viên hiện có; quota được điều chỉnh theo sức chứa mới; các vai trò đã có thành viên không thể giảm dưới số người đang giữ chỗ.

Nhóm cũ được tạo trước khi lưu `meeting_format` và tags sẽ có các trường này rỗng. Không có dữ liệu để tự backfill. `Group Detail` chỉ hiện nội dung có nguồn trong create form/DB; học kỳ, lịch họp hằng tuần, mục tiêu riêng và tech stack mặc định không thuộc model nhóm hiện tại.

## 4. REST API đang có

Base path backend: `/api`. BFF Next.js có base path riêng cùng tên nhưng chỉ xử lý auth u-SAINT và dịch thuật.

| Method | Path | Quyền | Ý nghĩa |
| --- | --- | --- | --- |
| POST | `/auth/sso/usaint` | public endpoint dành cho BFF | Đồng bộ hồ sơ, cấp JWT. |
| GET | `/users/me` | JWT | Hồ sơ user trong DB. |
| GET | `/users/me/groups` | JWT | Nhóm đã tham gia và vai trò. |
| GET | `/users/me/applications` | JWT | Đơn ứng tuyển của chính user, gồm trạng thái sau refresh. |
| GET | `/groups`, `/groups/years`, `/groups/{id}` | public | Tìm kiếm/phân trang, năm đăng, chi tiết nhóm. |
| POST | `/groups` | JWT | Tạo nhóm, lưu leader trong `group_members`. |
| PUT | `/groups/{id}` | JWT + leader | Sửa các trường của Create Group (title, description, course, meeting format, tags, liên hệ, sức chứa, role quotas); tự tính status. |
| DELETE | `/groups/{id}` | JWT + leader | Xóa nhóm và dữ liệu liên quan. |
| POST | `/groups/{id}/applications` | JWT | Nộp đơn; từ chối leader, member và đơn pending trùng. |
| GET | `/groups/{id}/applications` | JWT + leader | Xem đơn của nhóm. |
| PUT | `/applications/{id}/accept`, `/applications/{id}/reject` | JWT + leader | Chỉ xử lý đơn `PENDING`; accept thêm member, tăng role quota. |
| DELETE | `/applications/{id}` | JWT + applicant | Rút đơn `PENDING`. |
| GET | `/notifications`, `/notifications/unread-count` | JWT | Danh sách và số thông báo chưa đọc. |
| PATCH | `/notifications/{id}/read`, `/notifications/read-all` | JWT | Đánh dấu đã đọc trong DB. |
| DELETE | `/notifications/{id}`, `/notifications` | JWT | Xóa một hoặc tất cả thông báo. |
| GET | `/statistics`, `/academic-units`, `/health` | public | Thống kê COUNT từ DB, snapshot danh mục học vụ, kiểm tra server. |

`GET /groups` nhận `keyword`, `college`, `department`, `postYear`, `status` và Spring `page`, `size`, `sort`. Sắp xếp “spots left” dùng thuộc tính tính toán `availableSpots` trong SQL trước khi phân trang. Các response công khai che mã sinh viên; API riêng `/users/me` giữ mã đầy đủ cho chủ tài khoản.

## 5. Luồng nghiệp vụ UI → API → database

1. **Create Group:** form gửi title, description, course code/name, sức chứa 2–20, hình thức họp, tags, liên hệ được chọn công khai và role quotas. Backend gắn leader, college/department, postYear, ghi các thuộc tính nhóm vào `study_groups` (tags và role quotas là JSONB) cùng `group_members` trong transaction.
2. **Browse / Detail:** pages lấy group summary/detail từ backend; member count, status, leader, contacts, format, tags, quotas và roster đều lấy từ response. Nút Join khóa cho leader, thành viên hiện tại, người đã có đơn pending và nhóm đủ người. Trang chi tiết dùng dịch thuật tùy chọn cho title/description/role text; bản dịch không ghi DB.
3. **Apply:** ứng viên gửi lời giới thiệu, vai trò mong muốn. Các trường skills/GitHub/portfolio trên form hiện được ghép vào `statement` (text), chưa có cột riêng. Backend xác nhận quyền, quota và trạng thái nhóm. Đơn `REJECTED` có thể nộp lại, `PENDING`/`ACCEPTED` không thể nộp trùng. `GET /users/me/applications` phục hồi trạng thái đã nộp sau refresh.
4. **Manage:** leader lấy nhóm và đơn từ DB, sửa thông tin đã tạo qua một PUT transaction cập nhật `study_groups`, duyệt/từ chối đơn pending, xóa nhóm. Member chỉ xem nhóm của mình.
5. **Notifications:** đọc/xóa xác nhận qua backend trước khi đổi state UI; refresh lại lấy trạng thái `isRead` từ DB.

## 6. Cấu hình và kiểm tra

- Backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (`backend/.env.example`); PostgreSQL driver, Spring JPA `ddl-auto: update`.
- Database hiện tại đã được chuyển từ hai bảng tags/role quotas cũ sang hai cột JSONB trong `study_groups`. Repository không còn chứa script chuyển đổi; database cũ khác cần một kế hoạch di chuyển dữ liệu riêng trước khi chạy bản backend này. `ddl-auto: update` không tự xóa bảng cũ hoặc chuyển dữ liệu.
- Frontend: `NEXT_PUBLIC_API_BASE_URL`; `SPRING_BOOT_API_URL` cho BFF auth (mặc định `http://localhost:8080`); `FACTCHAT_API_KEY`/`FACTCHAT_MODEL` tùy chọn cho dịch thuật (`frontend/.env.example`).
- CORS backend hiện cho `localhost:3000` và `127.0.0.1:3000`; origin production phải được cấu hình trước khi triển khai.
- Kiểm tra frontend: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`. Kiểm tra backend: `./gradlew test --offline`. Test khởi tạo Spring context chỉ chạy khi có `DB_URL` trong môi trường; unit tests không cần database.

## 7. Giới hạn đang tồn tại

- Schema hiện do Hibernate tự cập nhật, không có lịch sử migration trong repository. Cần tích hợp công cụ migration có version trước khi nâng cấp schema trên các database có dữ liệu.
- `POST /api/auth/sso/usaint` hiện được SecurityConfig cho public để BFF gọi nhưng chưa có chứng thực nội bộ giữa BFF và backend. Không nên coi payload profile gửi trực tiếp tới endpoint này là đã được u-SAINT xác minh. Cần khóa endpoint bằng cơ chế server-to-server trước khi public deployment.
- Bài kiểm thử Spring context và đọc JSONB bằng JPA chỉ chạy khi môi trường cấp `DB_URL`; các unit tests còn lại không cần database.
