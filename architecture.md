# 🎓 CampusMatch — Tài liệu Kiến trúc Hệ thống (System Architecture)

> **Tài liệu đặc tả kiến trúc chuẩn cho dự án CampusMatch — Nền tảng ghép nhóm học tập & đồ án sinh viên Đại học Soongsil (숭실대학교).**  
> Dựa trên tài liệu gốc `README.md`, tài liệu này vạch ra toàn bộ bản thiết kế kỹ thuật, luồng xác thực SSO, mô hình dữ liệu và lộ trình triển khai chi tiết từng bước.

---

## 📑 Mục lục

1. [Tổng quan hệ thống (System Overview)](#1-tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể & Luồng SSO (Architecture & BFF Flow)](#2-kiến-trúc-tổng-thể--luồng-sso)
3. [Cấu trúc mã nguồn (Project Structure)](#3-cấu-trúc-mã-nguồn)
4. [Thiết kế Cơ sở dữ liệu (PostgreSQL Schema & JPA Entities)](#4-thiết-kế-cơ-sở-dữ-liệu)
5. [Đặc tả RESTful API (API Specifications)](#5-đặc-tả-restful-api)
6. [Quy chuẩn triển khai Backend & Frontend](#6-quy-chuẩn-triển-khai)
7. [Lộ trình triển khai chi tiết: "Cần làm những gì?"](#7-lộ-trình-triển-khai-chi-tiết)
8. [Triển khai Cloud & Vận hành (Production Deployment)](#8-triển-khai-cloud--vận-hành)

---

## 1. Tổng quan hệ thống

**CampusMatch** giải quyết bài toán cốt lõi trong môi trường đại học: Giúp sinh viên tìm kiếm đồng đội có cùng kỹ năng/môn học, thành lập nhóm học tập và đồ án capstone, đồng thời loại bỏ 100% tình trạng tài khoản ảo, bùng nhóm hoặc thông tin giả mạo.

### 🌟 4 Trụ cột công nghệ (Tech Stack)

| Tầng (Layer)           | Công nghệ chính                                                       | Vai trò kỹ thuật                                                                       |
| :--------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **Frontend**           | **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4** | Server/Client Components, Design System tokens, Theme Provider, Client routing.        |
| **Auth Gateway (BFF)** | **Next.js Route Handlers (`/api/auth/usaint`)**                       | Backend-For-Frontend đóng vai trò cổng đệm xác thực với cổng thông tin SAP của trường. |
| **Backend API**        | **Java 25 · Spring Boot 4.1 · Spring Data JPA · Spring Security**     | Xử lý domain nghiệp vụ, phân quyền JWT stateless, giao tiếp PostgreSQL qua HikariCP.   |
| **Database**           | **PostgreSQL 16 on Neon.tech (Singapore Region)**                     | Database quan hệ serverless, hỗ trợ SSL bắt buộc, Hibernate auto-ddl.                  |

---

## 2. Kiến trúc tổng thể & Luồng SSO

CampusMatch áp dụng mô hình kiến trúc **BFF (Backend-For-Frontend)**:

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend: Next.js 16                 │
│              (Hosted on Vercel · 24/7 Free)            │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │   UI Pages & Components │  │  Auth API Handler   │  │
│  │   (Tailwind CSS v4)     │  │  (BFF Route)        │  │
│  └────────────┬────────────┘  └──────────┬──────────┘  │
└───────────────┼──────────────────────────┼─────────────┘
                │                          │
       User Action                         │ 1. Xác thực ID & Password
       (Student ID & Portal Pass)          │    trực tiếp với trường
                │                          ▼
                │               ┌───────────────────────┐
                │               │  Soongsil University  │
                │               │     u-SAINT Portal    │
                │               │   (smartid.ssu.ac.kr) │
                │               └───────────────────────┘
                │                          │
                ▼                          │ 2. Trả về Profile đã xác thực
       3. Gửi Student Profile              │    (Tên, Khoa, Viện, Năm học)
          kèm SSO assertion đã ký          │
                │                          ▼
 ┌──────────────┴────────────────────────────────────────┐
 │           Backend: Java 25 · Spring Boot 4.1           │
 │       (Hosted on OCI Always Free VM · 24GB RAM)        │
 │                                                        │
 │  - Xác minh SSO assertion của BFF (chữ ký, 1 lần dùng)│
 │  - Kiểm tra và đồng bộ (Upsert) user vào table users  │
 │  - Ký và cấp phát JWT Token (HMAC-SHA256)             │
 └───────────────────────────┬────────────────────────────┘
                             │ JDBC over SSL
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                Database: Neon PostgreSQL               │
 │          (Singapore Region · Serverless 1GB)           │
 └────────────────────────────────────────────────────────┘
```

### 🔒 Nguyên tắc bảo mật: Zero Password Retention

- Mật khẩu u-SAINT của sinh viên **chỉ tồn tại tạm thời trong bộ nhớ đệm** tại máy chủ serverless edge trong vài mili-giây để bắt tay với `smartid.ssu.ac.kr`.
- Sau khi u-SAINT xác nhận hợp lệ, mật khẩu bị **hủy bỏ lập tức** (Garbage Collected).
- Backend Spring Boot và Database Neon **hoàn toàn KHÔNG BAO GIỜ lưu trữ mật khẩu**.
- Mọi tương tác sau đó giữa Frontend và Backend sử dụng **JWT Token (Bearer)** có thời hạn 24 giờ.

### 🔐 Tin cậy giữa BFF và Backend: SSO assertion

`POST /api/auth/sso/usaint` **không bao giờ** cấp JWT chỉ dựa trên `studentId` do bên gọi gửi lên. Endpoint chỉ chấp nhận request mang một **assertion có chữ ký** do BFF tạo ra _sau khi_ BFF đã xác thực thật với u-SAINT. Gọi thẳng vào backend (curl, Postman, script...) mà không có assertion hợp lệ luôn bị từ chối.

**Ai xác thực danh tính Soongsil?** Chỉ BFF (`frontend/src/lib/usaint.ts` và `app/api/auth/usaint/route.ts`): `SapSsoClient.login()` gửi ID/mật khẩu tới `smartid.ssu.ac.kr`, BFF yêu cầu phải nhận được cookie `MYSAPSSO2`, rồi đọc MSSV chuẩn từ ứng dụng SAP `ZCMW1001n`. MSSV đưa vào assertion luôn lấy từ kết quả này, **không bao giờ** từ dữ liệu trình duyệt. Backend không tự nói chuyện với u-SAINT; nó tin BFF thông qua chữ ký.

```text
Browser ──(studentId + password)──► BFF /api/auth/usaint ──► u-SAINT (xác thực thật, MYSAPSSO2)
                                      │  MSSV chuẩn lấy từ kết quả u-SAINT
                                      │  ký assertion HS256 (SSO_ASSERTION_SECRET, sống 30 giây, gắn với body)
                                      ▼
                      POST /api/auth/sso/usaint   Header: X-SSO-Assertion: <JWS>
                                      │
              Backend: chuỗi filter riêng (SsoBridgeSecurityConfig)
                - kiểm tra chữ ký + alg=HS256, iss, aud, exp, thời gian sống, jti dùng một lần
                - body phải đúng bằng body đã ký (body_sha256)
                - studentId trong body phải TRÙNG sub của assertion
                                      ▼
                     Upsert user theo sub  ──►  JWT ứng dụng (định dạng không đổi)
```

| Claim         | Ý nghĩa                                                                                            |
| :------------ | :------------------------------------------------------------------------------------------------- |
| `iss`         | Phải là `campus-match-bff`                                                                         |
| `aud`         | Phải là `campus-match-backend`                                                                     |
| `sub`         | MSSV đã xác thực: **nguồn danh tính duy nhất** của lần đăng nhập                                   |
| `iat` / `exp` | BFF ký thời hạn 30 giây; backend từ chối nếu `exp - iat` > 60 giây hoặc `iat` ở tương lai (>5 giây) |
| `jti`         | Mã dùng một lần; dùng lại là bị từ chối (chống replay)                                             |
| `body_sha256` | SHA-256 (hex) của đúng body JSON gửi kèm: không thể đổi nội dung hồ sơ sau khi ký                  |

**Biến môi trường (chỉ tên, không ghi giá trị vào mã nguồn hay tài liệu):**

| Biến                  | Nơi dùng                      | Ghi chú                                                                                                        |
| :-------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `SSO_ASSERTION_SECRET`| Backend **và** BFF (server)   | Hai bên phải giống hệt nhau. Ngẫu nhiên, ≥ 32 byte (ví dụ `openssl rand -hex 32`), **khác** `JWT_SECRET`.      |
| `JWT_SECRET`          | Backend                       | Ký JWT ứng dụng. Không dùng chung với assertion (backend từ chối khởi động nếu hai khóa trùng nhau).           |
| `SPRING_BOOT_API_URL` | BFF (server)                  | Địa chỉ backend mà BFF gọi server-to-server (mặc định `http://localhost:8080`).                                |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Backend      | Kết nối PostgreSQL.                                                                                            |

`SSO_ASSERTION_SECRET` tuyệt đối không có tiền tố `NEXT_PUBLIC_`, không được trả về trong bất kỳ response nào, và assertion không bao giờ được gửi xuống trình duyệt.

**Cách xử lý lỗi (đóng an toàn):**

| Tình huống                                                                                   | Kết quả                                                         |
| :------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| Thiếu header, sai chữ ký, hết hạn, sai `iss`/`aud`, `alg` khác HS256, body bị đổi, bị replay | Backend trả `401`, không chạm DB, không cấp JWT                 |
| Body quá 2 MiB (đã có assertion hợp lệ)                                                      | `413`                                                           |
| `studentId` trong body khác `sub` của assertion                                              | `403` (kiểm tra trước mọi truy cập DB)                          |
| Backend chưa cấu hình `SSO_ASSERTION_SECRET`                                                 | Vẫn khởi động, nhưng từ chối mọi request tới endpoint (`401`)   |
| Khóa quá ngắn (< 32 byte) hoặc trùng `JWT_SECRET`                                            | Backend từ chối khởi động                                       |
| BFF thiếu/ngắn `SSO_ASSERTION_SECRET`                                                        | BFF trả `SERVER_ERROR` (500) và **không** gọi backend           |
| Backend từ chối assertion                                                                    | BFF trả `SERVER_ERROR` (502); người dùng không nhận JWT         |

Log chỉ ghi _mã lý do_ từ chối (ví dụ `BAD_SIGNATURE`, `REPLAYED`) và MSSV đã che bốn ký tự đầu; không bao giờ ghi assertion, JWT, khóa ký hay mật khẩu.

**Cô lập endpoint:** `SsoBridgeSecurityConfig` tạo chuỗi filter riêng chỉ cho đường dẫn này: không CORS (trình duyệt không gọi được), không đọc JWT ứng dụng, không CSRF/session. `SecurityConfig` không còn `permitAll` cho `/api/auth/**`.

**Giới hạn đã biết:**

- **Replay chỉ được chặn trong bộ nhớ tiến trình** (`SsoAssertionReplayGuard`). Dự án chưa có Redis và bảng DB mới sẽ là thay đổi schema. Với 1 instance backend thì chính xác; khởi động lại backend sẽ quên các `jti` đang còn hạn (tối đa ~65 giây), và nếu chạy nhiều instance thì mỗi instance chấp nhận một lần replay. Khi mở rộng nhiều instance cần chuyển sang kho dùng chung.
- **Backend tin BFF:** ai nắm `SSO_ASSERTION_SECRET` có thể tạo assertion cho bất kỳ MSSV nào. Hãy giữ khóa ở biến môi trường server-only, và dùng HTTPS giữa BFF và backend ở production (chữ ký gắn với body nhưng không mã hóa nó).
- Thay khóa cần cập nhật đồng thời cả hai phía (chưa hỗ trợ hai khóa song song). Hệ thống không kiểm tra độ ngẫu nhiên của khóa, chỉ kiểm tra độ dài.
- Xác thực thật với u-SAINT chỉ chạy được với tài khoản Soongsil thật; luồng này chưa được kiểm thử tự động với u-SAINT.

---

## 3. Cấu trúc mã nguồn

```text
campus-match/
├── frontend/                               # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing Page giới thiệu & CTA SSO
│   │   │   ├── layout.tsx                  # Root layout (ThemeProvider, AuthProvider)
│   │   │   ├── globals.css                 # Design Tokens & CSS Variables
│   │   │   ├── groups/                     # [Trang chính] Danh sách & Lọc nhóm
│   │   │   ├── manage/                     # My Groups (Sidebar → Manage): nhóm tôi làm Leader / thành viên; duyệt đơn tại manage/[groupId]
│   │   │   ├── mypage/                     # Profile cá nhân (u-SAINT, chỉ đọc)
│   │   │   ├── create-group/               # Form tạo nhóm mới
│   │   │   └── api/auth/usaint/route.ts    # BFF Handler xác thực u-SAINT
│   │   ├── components/
│   │   │   ├── auth/                       # LoginModal, LoginForm
│   │   │   ├── group/                      # GroupCard, FilterBar
│   │   │   ├── application/                # ApplicationCard
│   │   │   └── layout/                     # Header, Sidebar, Footer
│   │   ├── context/
│   │   │   └── AuthContext.tsx             # Quản lý Global Auth State (useAuth)
│   │   ├── design-system/                  # Button, Badge, Card, Modal, Input...
│   │   └── lib/
│   │       ├── api.ts                      # Client gọi REST API sang Spring Boot
│   │       ├── ssoAssertion.ts             # [server-only] Ký SSO assertion BFF → Backend
│   │       └── types.ts                    # TypeScript interface dùng chung
│
├── backend/                                # Java 25 · Spring Boot 4.1 REST API
│   ├── src/main/java/com/campusmatch/
│   │   ├── BackendApplication.java         # Main Entry Point (@SpringBootApplication)
│   │   ├── config/
│   │   │   ├── SecurityConfig.java         # CORS, Stateless Session, JWT Filter (chuỗi filter cho sinh viên)
│   │   │   ├── SsoBridgeSecurityConfig.java# Chuỗi filter riêng cho POST /api/auth/sso/usaint (assertion)
│   │   │   └── WebConfig.java              # Cấu hình MVC & CORS nâng cao
│   │   ├── controller/
│   │   │   ├── AuthController.java         # /api/auth/sso/usaint, /api/users/me
│   │   │   ├── GroupController.java        # /api/groups
│   │   │   ├── ApplicationController.java  # /api/groups/{id}/applications
│   │   │   └── HealthController.java       # /api/health
│   │   ├── service/
│   │   │   ├── AuthService.java            # Logic cấp phát JWT & đồng bộ User
│   │   │   ├── GroupService.java           # Tìm kiếm, lọc, tạo & sửa Group
│   │   │   └── ApplicationService.java     # Nộp đơn, duyệt đơn (Accept/Reject)
│   │   ├── repository/
│   │   │   ├── UserRepository.java         # Spring Data JPA cho User
│   │   │   ├── GroupRepository.java        # Spring Data JPA cho StudyGroup
│   │   │   └── ApplicationRepository.java  # Spring Data JPA cho Application
│   │   ├── entity/
│   │   │   ├── User.java                   # Table: users
│   │   │   ├── StudyGroup.java             # Table: study_groups
│   │   │   ├── Application.java            # Table: applications
│   │   │   └── GroupMember.java            # Table: group_members
│   │   ├── dto/
│   │   │   ├── request/                    # SSORequest, CreateGroupRequest, ApplyRequest...
│   │   │   └── response/                   # AuthResponse, GroupResponse, MemberResponse...
│   │   └── security/
│   │       ├── JwtTokenProvider.java       # Sinh & giải mã JWT
│   │       ├── JwtAuthenticationFilter.java# Interceptor kiểm tra Bearer token
│   │       ├── SsoAssertionVerifier.java   # Xác minh assertion HS256 của BFF (iss/aud/exp/sub/body)
│   │       ├── SsoAssertionReplayGuard.java# Mỗi assertion (jti) chỉ dùng được một lần
│   │       ├── SsoAssertionAuthenticationFilter.java # Filter xác thực service-to-service
│   │       └── CustomUserDetails.java      # UserDetails Spring Security
│   ├── src/main/resources/
│   │   ├── application.yaml                # Cấu hình Neon PostgreSQL, HikariCP, JWT
│   │   └── application-prod.yaml           # Cấu hình môi trường Production
│   └── build.gradle                        # Gradle dependencies & toolchain
```

---

## 4. Thiết kế Cơ sở dữ liệu

Hệ thống sử dụng **PostgreSQL 16 (Neon.tech)** với các quan hệ chuẩn mực:

```text
┌───────────────────────────┐             ┌───────────────────────────┐
│           users           │             │       study_groups        │
├───────────────────────────┤             ├───────────────────────────┤
│ id (PK, BIGINT)           │1           *│ id (PK)                   │
│ student_id (UNIQUE)       │────────────▶│ leader_id (FK)            │
│ name                      │             │ title                     │
│ department                │             │ description               │
│ faculty                   │             │ college    (단과대, IT대학)  │
│ email                     │             │ department (학과, 소프트...) │
│ academic_year             │             │ post_year  (Năm đăng, 2024)│
│ phone_number              │             │ max_members               │
│ avatar_url                │             │ status                    │
│ role                      │             │ created_at                │
│ created_at                │             └─────────────┬─────────────┘
│ last_login_at             │                           │
└─────────────┬─────────────┘                           │
              │                                         │
              │ 1                                       │ 1
              ▼ *                                       ▼ *
┌───────────────────────────┐             ┌───────────────────────────┐
│       applications        │             │       group_members       │
├───────────────────────────┤             ├───────────────────────────┤
│ id (PK)                   │             │ group_id (PK, FK)         │
│ group_id (FK)             │             │ user_id  (PK, FK)         │
│ applicant_id (FK)         │             │ role (LEADER, MEMBER)     │
│ statement                 │             │ joined_at                 │
│ status (PENDING...)       │             └───────────────────────────┘
│ created_at                │
└───────────────────────────┘
```

### Chi tiết các Table & Ràng buộc (Constraints):

1. **`users` (Thông tin sinh viên Soongsil):**
   - `id`: Khóa chính (`BIGINT` / `Long`, Identity).
   - `student_id`: Mã sinh viên u-SAINT (VD: `20211234`), `VARCHAR(20)`, **UNIQUE**, `NOT NULL`, Index, bất biến (`updatable = false`).
   - `name`: Họ và tên sinh viên chính thức (`VARCHAR(100)`), `NOT NULL`, bất biến (`updatable = false`).
   - `department`: Khoa / Ngành học (VD: `소프트웨어학부`, `컴퓨터학부`), `VARCHAR(100)`, bất biến (`updatable = false`).
   - `faculty`: Trường / Viện chủ quản (VD: `IT대학`), `VARCHAR(100)`, bất biến (`updatable = false`).
   - `email`: Email trường cấp (`VARCHAR(150)`, VD: `20211234@soongsil.ac.kr`).
   - `academic_year`: Năm học ghi nhận lúc nhập học (`VARCHAR(10)`, VD: `1`, `2`, `3`, `4`), bất biến (`updatable = false`).
   - `phone_number`: Số điện thoại liên hệ (`VARCHAR(20)`).
   - `avatar_url`: Ảnh đại diện / ảnh thẻ sinh viên u-SAINT (`TEXT`).
   - `role`: Phân quyền trong hệ thống (`VARCHAR(20)`), `NOT NULL`, mặc định `ROLE_STUDENT`.
   - `created_at`: Thời gian tạo tài khoản lần đầu (`TIMESTAMP`), `NOT NULL`, bất biến.
   - `last_login_at`: Thời điểm đăng nhập u-SAINT gần nhất (`TIMESTAMP`).

2. **`study_groups` (Nhóm học tập & Đồ án - Lọc theo 3 tiêu chí u-SAINT):**
   - `id`: Khóa chính.
   - `leader_id`: FK liên kết tới `users(id)`.
   - `title`: Tên nhóm / đề tài.
   - `description`: Mô tả chi tiết mục tiêu, yêu cầu.
   - `college`: Đơn vị trường/viện (단과대학, VD: `IT대학`). Kế thừa trực tiếp từ profile u-SAINT của người tạo.
   - `department`: Đơn vị khoa/ngành (학부/학과, VD: `소프트웨어학부`, `컴퓨터학부`). Kế thừa trực tiếp từ profile u-SAINT của người tạo.
   - `post_year`: Năm đăng bài (Integer, VD: `2024`). Được hệ thống tự động trích xuất từ năm của `created_at` để đánh B-Tree Index phục vụ lọc siêu tốc.
   - `course_code` / `course_name`: Mã môn học (e.g. `CS490 - Capstone`, tùy chọn).
   - `max_members`: Số lượng thành viên tối đa (VD: 4 - 6).
   - `status`: Enum (`RECRUITING`, `COMPLETED`, `CLOSED`).
   - `created_at`, `updated_at`: Timestamps.

3. **`applications` (Đơn xin gia nhập nhóm):**
   - `id`: Khóa chính.
   - `group_id`: FK liên kết tới `study_groups(id)`.
   - `applicant_id`: FK liên kết tới `users(id)`.
   - `statement`: Lời giới thiệu / nguyện vọng của ứng viên.
   - `status`: Enum (`PENDING`, `ACCEPTED`, `REJECTED`).
   - **Ràng buộc:** `UNIQUE(group_id, applicant_id)` (Mỗi sinh viên chỉ nộp 1 đơn vào 1 nhóm).

4. **`group_members` (Thành viên chính thức của nhóm):**
   - Composite PK: `(group_id, user_id)`.
   - `role`: Trưởng nhóm (`LEADER`) hoặc Thành viên (`MEMBER`).
   - `joined_at`: Ngày gia nhập.

---

## 5. Đặc tả RESTful API

**Base URL Backend:** `http://localhost:8080/api` (Local) / `https://api.yourdomain.com/api` (Prod)

### 1. Authentication & Student Profile

| Method | Endpoint           | Mô tả                                             | Quyền truy cập (Auth) |
| :----- | :----------------- | :------------------------------------------------ | :-------------------- |
| `POST` | `/auth/sso/usaint` | Nhận profile từ BFF, đồng bộ DB, trả về JWT Token | Chỉ BFF (header `X-SSO-Assertion` ký HS256) |
| `GET`  | `/users/me`        | Lấy profile sinh viên hiện tại dựa trên JWT Token | Bearer Token          |
| `GET`  | `/health`          | Kiểm tra trạng thái server & database             | Public                |

#### Sample SSO Payload:

Chỉ BFF gọi được, kèm header `X-SSO-Assertion: <JWS HS256>` (xem mục _Tin cậy giữa BFF và Backend_). `studentId` trong body phải trùng `sub` của assertion; body phải đúng với `body_sha256` đã ký.

```json
// POST /api/auth/sso/usaint
{
  "studentId": "20211234",
  "name": "홍길동",
  "department": "컴퓨터학부",
  "faculty": "IT대학",
  "email": "20211234@soongsil.ac.kr",
  "academicYear": "3"
}
```

#### Sample Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "studentId": "20211234",
    "name": "홍길동",
    "department": "컴퓨터학부",
    "faculty": "IT대학"
  }
}
```

---

### 2. Groups (Quản lý nhóm)

| Method   | Endpoint           | Mô tả                                                                     | Quyền truy cập  |
| :------- | :----------------- | :------------------------------------------------------------------------ | :-------------- |
| `GET`    | `/groups`          | Tìm kiếm & lọc nhóm (`search`, `college`, `department`, `year`, `status`) | Public / Bearer |
| `GET`    | `/groups/{id}`     | Xem chi tiết nhóm, danh sách thành viên hiện tại                          | Public / Bearer |
| `POST`   | `/groups`          | Tạo một nhóm học tập mới (Người tạo tự động là Leader)                    | Bearer Token    |
| `GET`    | `/users/me/groups` | Lấy danh sách nhóm của sinh viên hiện tại (kèm `myRole`, `pendingCount`)  | Bearer Token    |
| `PUT`    | `/groups/{id}`     | Cập nhật thông tin nhóm (Tên, mô tả, chỉ tiêu)                            | Chỉ Leader nhóm |
| `DELETE` | `/groups/{id}`     | Đóng đợt tuyển hoặc xóa nhóm                                              | Chỉ Leader nhóm |

---

### 3. Applications (Ứng tuyển & Duyệt thành viên)

| Method   | Endpoint                    | Mô tả                                                  | Quyền truy cập   |
| :------- | :-------------------------- | :----------------------------------------------------- | :--------------- |
| `POST`   | `/groups/{id}/applications` | Nộp đơn xin vào nhóm kèm lời nhắn                      | Bearer Token     |
| `GET`    | `/groups/{id}/applications` | Xem tất cả đơn ứng tuyển của một nhóm                  | Chỉ Leader nhóm  |
| `PUT`    | `/applications/{id}/accept` | Chấp thuận ứng viên (Tự động thêm vào `group_members`) | Chỉ Leader nhóm  |
| `PUT`    | `/applications/{id}/reject` | Từ chối đơn ứng tuyển                                  | Chỉ Leader nhóm  |
| `DELETE` | `/applications/{id}`        | Ứng viên tự rút lại đơn đang chờ duyệt                 | Ứng viên nộp đơn |

---

## 6. Quy chuẩn triển khai

### Backend (Java 25 · Spring Boot 4.1)

1. **Layered Architecture:** Controller chỉ nhận Request DTO và trả Response DTO (không để lộ Entity ra ngoài API).
2. **Exception Handling:** Sử dụng `@RestControllerAdvice` và `@ExceptionHandler` để bắt lỗi tập trung, trả về format JSON chuẩn:
   ```json
   {
     "status": 400,
     "error": "BAD_REQUEST",
     "message": "Nhóm đã đủ số lượng thành viên tối đa",
     "timestamp": "2026-10-15T15:00:00"
   }
   ```
3. **Transaction Management:** Mọi thao tác ghi DB nghiệp vụ (tạo nhóm, accept đơn) đều đánh dấu `@Transactional`.

### Frontend (Next.js 16)

1. **Design System First:** Tất cả nút bấm, thẻ bài, popup, badge đều phải dùng component từ `src/design-system/` (`Button`, `Card`, `Badge`, `Modal`, `Input`).
2. **Tokens & Theme:** Tuyệt đối không hardcode màu sắc; sử dụng biến CSS token trong `globals.css` (`var(--primary)`, `var(--surface)`, `var(--border)`).
3. **State Management:** Dùng `useAuthStore` (Zustand) để nắm giữ thông tin sinh viên đăng nhập và token toàn cục.

---

## 7. Lộ trình triển khai chi tiết: "Cần làm những gì?"

Dưới đây là checklist từng bước rõ ràng để hoàn thiện toàn bộ hệ thống từ Backend tới Frontend:

### 📍 Giai đoạn 1: Hoàn thiện Database Entities (Backend)

- [x] Đã cấu hình kết nối Neon PostgreSQL trong `application.yaml`.
- [x] Đã thiết lập `SecurityConfig` và kiểm tra `HealthController`.
- [x] Tạo file Entity `User.java`.
- [x] Tạo file Entity `StudyGroup.java` (gồm 3 trường phân loại u-SAINT: `college`, `department`, `post_year`) và Enum `GroupStatus`.
- [x] Tạo file Entity `Application.java` và Enum `ApplicationStatus`.
- [x] Tạo file Entity `GroupMember.java` (kèm `GroupMemberId.java` và `GroupRole.java`).
- [x] Chạy server để Hibernate tự động sinh ra các bảng chuẩn trên Neon PostgreSQL.

### 📍 Giai đoạn 2: Cơ chế Xác thực & Cấp phát JWT (Backend + Frontend)

- [x] Thêm thư viện `jjwt-api`, `jjwt-impl`, `jjwt-jackson` vào `build.gradle`.
- [x] Viết `JwtTokenProvider.java` (tạo token, validate token, trích xuất studentId, role, claims) và `JwtUtil.java`.
- [x] Viết `JwtAuthenticationFilter.java` chặn và đọc header `Authorization: Bearer <token>`, tích hợp vào `SecurityConfig.java`.
- [x] Viết `AuthController.java` xử lý endpoint `POST /api/auth/sso/usaint` và `UserController.java` xử lý `GET /api/users/me`.
- [x] Cập nhật hàm `login()` trong `frontend/src/stores/authStore.ts` (Zustand) gọi trực tiếp sang BFF `/api/auth/usaint` và chuyển tiếp Backend thật `POST /api/auth/sso/usaint`.
- [x] Bảo vệ `POST /api/auth/sso/usaint` bằng SSO assertion ký HS256 (BFF ký trong `frontend/src/lib/ssoAssertion.ts`; backend xác minh bằng `SsoAssertionVerifier`, một lần dùng nhờ `SsoAssertionReplayGuard`, chuỗi filter riêng `SsoBridgeSecurityConfig`). Backend không còn cấp JWT chỉ dựa trên `studentId` do bên gọi gửi lên.

### 📍 Giai đoạn 3: REST API Nhóm học tập (Backend Group Module)

- [x] Viết `GroupRepository.java` (tìm kiếm từ khóa, lọc theo 3 mục chuẩn u-SAINT: `college`, `department`, `post_year`) và `GroupMemberRepository.java`.
- [x] Thiết kế DTOs: `CreateGroupRequest.java`, `GroupSummaryResponse.java` (kèm `memberCount`, `leaderInfo`), `GroupDetailResponse.java` (danh sách `members`), `MyGroupSummaryResponse.java` (kèm `myRole`, `pendingApplicationCount`).
- [x] Viết `GroupService.java` xử lý nghiệp vụ:
  - Tạo nhóm: tự động gắn `college`, `department` của user và `post_year` từ thời điểm tạo, đồng thời thêm người tạo làm `LEADER` trong `group_members`.
  - Lấy danh sách nhóm & lọc theo tiêu chí.
  - Xem chi tiết nhóm kèm danh sách thành viên.
  - Lấy danh sách nhóm của tôi (`GET /api/users/me/groups`) chia theo `LEADER` và `MEMBER`.
- [x] Viết `GroupController.java` cho các endpoint: `GET /api/groups`, `GET /api/groups/{id}`, `POST /api/groups`, `GET /api/users/me/groups`.

### 📍 Giai đoạn 4: Ứng tuyển & Duyệt thành viên (Backend Application Module)

- [x] Viết `ApplicationRepository.java` (tìm theo `groupId`, kiểm tra đơn trùng lặp `applicantId + groupId`).
- [x] Thiết kế DTOs: `ApplyRequest.java`, `ApplicationResponse.java`.
- [x] Viết `ApplicationService.java` xử lý logic nghiệp vụ:
  - Sinh viên nộp đơn (`POST /api/groups/{id}/applications`): Kiểm tra nhóm còn nhận người (`RECRUITING`), kiểm tra không cho Leader tự ứng tuyển vào nhóm mình, không nộp đơn trùng lặp.
  - Leader xem danh sách đơn (`GET /api/groups/{id}/applications`): Chỉ Leader nhóm mới có quyền xem.
  - Leader bấm **Accept** (`PUT /api/applications/{id}/accept`): Chuyển trạng thái đơn thành `ACCEPTED`, tự động thêm bản ghi vào `group_members`, kiểm tra nếu nhóm đã đủ `max_members` thì tự đổi trạng thái nhóm sang `COMPLETED`.
  - Leader bấm **Reject** (`PUT /api/applications/{id}/reject`): Chuyển trạng thái đơn thành `REJECTED`.
  - Ứng viên rút đơn (`DELETE /api/applications/{id}`): Chỉ người nộp đơn được rút khi đơn còn `PENDING`.
- [x] Viết `ApplicationController.java`.

### 📍 Giai đoạn 5: Tích hợp Frontend & Thay thế Mock Data

- [ ] Bổ sung các hàm gọi API trong `frontend/src/services/`:
  - `groupService.ts`: Bổ sung `getGroups(params)`, `getGroupDetail(id)`, `createGroup(data)`.
  - `applicationService.ts`: Bổ sung `applyToGroup(groupId, statement)`.
- [ ] Xây dựng hoàn chỉnh giao diện Form tạo nhóm trong `frontend/src/app/create-group/page.tsx` sử dụng Design System và gắn kết nối API `createGroup`.
- [ ] Chuyển đổi dữ liệu sang API thật (`USE_MOCK = false` trong `frontend/src/services/mocks/groupMocks.ts`):
  - `frontend/src/app/groups/page.tsx`: Danh sách & bộ lọc nhóm lấy trực tiếp từ Neon DB qua Backend.
  - `frontend/src/app/groups/[id]/page.tsx` & `ApplyModal.tsx`: Chi tiết nhóm thật & nộp đơn ứng tuyển thật.
  - `frontend/src/app/manage/page.tsx`: My Groups (nhóm tôi làm Leader & thành viên).
  - `frontend/src/app/manage/[groupId]/page.tsx`: Leader duyệt danh sách đơn ứng tuyển thật.

---

## 8. Triển khai Cloud & Vận hành (Production)

Hệ thống được thiết kế để chạy **24/7 hoàn toàn miễn phí (100% Free)** trên 3 nền tảng Cloud:

```text
┌──────────────────────┐      ┌───────────────────────────┐      ┌─────────────────────────┐
│     Vercel Edge      │ ───► │      Oracle Cloud VM      │ ───► │     Neon PostgreSQL     │
│   (Next.js 16 Web)   │      │  (Spring Boot Container)  │      │   (Singapore Region)    │
│  HTTPS Auto · No CDN │      │ 4 OCPU ARM · 24GB RAM · 24/7│    │  Serverless 1GB Storage │
└──────────────────────┘      └───────────────────────────┘      └─────────────────────────┘
```

1. **Frontend:** Triển khai tự động từ GitHub lên **Vercel** (`https://campusmatch.vercel.app`).
2. **Backend:** Đóng gói Docker qua `docker-compose.prod.yml` chạy trên **Oracle Cloud Always Free VM (Ampere A1 ARM 24GB RAM)** không bao giờ ngủ (No Sleep Timer).
3. **Database:** **Neon PostgreSQL** kết nối bảo mật qua SSL.
