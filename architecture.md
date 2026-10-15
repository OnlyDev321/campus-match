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
| **Backend API**        | **Java 17/21 · Spring Boot 3/4 · Spring Data JPA · Spring Security**  | Xử lý domain nghiệp vụ, phân quyền JWT stateless, giao tiếp PostgreSQL qua HikariCP.   |
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
          kèm Secret Handshake             │
                │                          ▼
 ┌──────────────┴────────────────────────────────────────┐
 │               Backend: Java Spring Boot 3              │
 │       (Hosted on OCI Always Free VM · 24GB RAM)        │
 │                                                        │
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
│   │   │   ├── manage/                     # Workspace quản lý nhóm của Leader
│   │   │   ├── mypage/                     # Profile cá nhân & Đơn ứng tuyển
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
│   │       └── types.ts                    # TypeScript interface dùng chung
│
├── backend/                                # Java Spring Boot 3 REST API
│   ├── src/main/java/com/campusmatch/
│   │   ├── BackendApplication.java         # Main Entry Point (@SpringBootApplication)
│   │   ├── config/
│   │   │   ├── SecurityConfig.java         # CORS, Stateless Session, PermitAll/JWT Filter
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
┌──────────────────────┐             ┌───────────────────────────┐
│        users         │             │       study_groups        │
├──────────────────────┤             ├───────────────────────────┤
│ id (PK, UUID/BIGINT) │1           *│ id (PK)                   │
│ student_id (UNIQUE)  │────────────▶│ leader_id (FK)            │
│ name                 │             │ title                     │
│ department           │             │ description               │
│ faculty              │             │ college    (단과대, IT대학)  │
│ email                │             │ department (학과, 소프트...) │
│ academic_year        │             │ post_year  (Năm đăng, 2024)│
│ avatar_url           │             │ max_members               │
│ created_at           │             │ status                    │
└──────────┬───────────┘             │ created_at                │
           │                         └─────────────┬─────────────┘
           │                                       │
           │ 1                                     │ 1
           ▼ *                                     ▼ *
┌──────────────────────┐             ┌───────────────────────────┐
│     applications     │             │       group_members       │
├──────────────────────┤             ├───────────────────────────┤
│ id (PK)              │             │ group_id (PK, FK)         │
│ group_id (FK)        │             │ user_id  (PK, FK)         │
│ applicant_id (FK)    │             │ joined_at                 │
│ statement            │             └───────────────────────────┘
│ status (PENDING...)  │
│ created_at           │
└──────────────────────┘
```

### Chi tiết các Table & Ràng buộc (Constraints):

1. **`users` (Thông tin sinh viên Soongsil):**
   - `id`: Khóa chính (Long/UUID).
   - `student_id`: Mã sinh viên (VD: `20211234`), **UNIQUE**, Index.
   - `name`: Họ và tên sinh viên.
   - `department`: Khoa (e.g. `컴퓨터학부`, `소프트웨어학부`).
   - `faculty`: Trường/Viện (e.g. `IT대학`).
   - `email`: Email trường (e.g. `20211234@soongsil.ac.kr`).
   - `academic_year`: Năm học (1, 2, 3, 4).
   - `created_at`: Thời gian tạo.

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
| `POST` | `/auth/sso/usaint` | Nhận profile từ BFF, đồng bộ DB, trả về JWT Token | Public (BFF Internal) |
| `GET`  | `/users/me`        | Lấy profile sinh viên hiện tại dựa trên JWT Token | Bearer Token          |
| `GET`  | `/health`          | Kiểm tra trạng thái server & database             | Public                |

#### Sample SSO Payload:

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

| Method   | Endpoint       | Mô tả                                                     | Quyền truy cập  |
| :------- | :------------- | :-------------------------------------------------------- | :-------------- |
| `GET`    | `/groups`      | Tìm kiếm & lọc nhóm (`search`, `college`, `department`, `year`, `status`) | Public / Bearer |
| `GET`    | `/groups/{id}` | Xem chi tiết nhóm, danh sách thành viên hiện tại          | Public / Bearer |
| `POST`   | `/groups`      | Tạo một nhóm học tập mới (Người tạo tự động là Leader)    | Bearer Token    |
| `PUT`    | `/groups/{id}` | Cập nhật thông tin nhóm (Tên, mô tả, chỉ tiêu)            | Chỉ Leader nhóm |
| `DELETE` | `/groups/{id}` | Đóng đợt tuyển hoặc xóa nhóm                              | Chỉ Leader nhóm |

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

### Backend (Spring Boot 3/4)

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
3. **State Management:** Dùng `AuthContext` để nắm giữ thông tin sinh viên đăng nhập và token toàn cục.

---

## 7. Lộ trình triển khai chi tiết: "Cần làm những gì?"

Dưới đây là checklist từng bước rõ ràng để hoàn thiện toàn bộ hệ thống từ Backend tới Frontend:

### 📍 Giai đoạn 1: Hoàn thiện Database Entities (Backend)

- [x] Đã cấu hình kết nối Neon PostgreSQL trong `application.yaml`.
- [x] Đã thiết lập `SecurityConfig` và kiểm tra `HealthController`.
- [ ] Tạo file Entity `User.java`.
- [ ] Tạo file Entity `StudyGroup.java` (gồm 3 trường phân loại u-SAINT: `college`, `department`, `post_year`) và Enum `GroupStatus`.
- [ ] Tạo file Entity `Application.java` và Enum `ApplicationStatus`.
- [ ] Tạo file Entity `GroupMember.java`.
- [ ] Chạy server để Hibernate tự động sinh ra các bảng chuẩn trên Neon PostgreSQL.

### 📍 Giai đoạn 2: Cơ chế Xác thực & Cấp phát JWT (Backend + Frontend)

- [ ] Thêm thư viện `jjwt-api`, `jjwt-impl`, `jjwt-jackson` vào `build.gradle`.
- [ ] Viết `JwtTokenProvider.java` (tạo token, validate token, trích xuất studentId).
- [ ] Viết `JwtAuthenticationFilter.java` chặn và đọc header `Authorization: Bearer <token>`.
- [ ] Viết `AuthController.java` xử lý endpoint `POST /api/auth/sso/usaint`.
- [ ] Cập nhật hàm `login()` trong `frontend/src/context/AuthContext.tsx` gọi trực tiếp sang Backend thật thay vì dùng mock timer.

### 📍 Giai đoạn 3: REST API Nhóm học tập (Backend Group Module)

- [ ] Viết `GroupRepository.java` hỗ trợ tìm kiếm theo từ khóa và lọc theo 3 mục chuẩn u-SAINT: 단과대 (`college`), 학부/학과 (`department`), năm đăng bài (`post_year`).
- [ ] Viết `GroupService.java` xử lý nghiệp vụ tạo nhóm (tự động gắn `college`, `department` của user và `post_year` từ thời điểm tạo), giới hạn số lượng thành viên.
- [ ] Viết `GroupController.java` cho các endpoint `GET /api/groups`, `GET /api/groups/{id}`, `POST /api/groups`.

### 📍 Giai đoạn 4: Ứng tuyển & Duyệt thành viên (Backend Application Module)

- [ ] Viết `ApplicationRepository.java` & `ApplicationService.java`.
- [ ] Xử lý logic nghiệp vụ:
  - Khi Leader bấm **Accept**: Chuyển trạng thái đơn thành `ACCEPTED`, tự động thêm bản ghi vào `group_members`, kiểm tra nếu nhóm đã đầy thì tự đổi trạng thái nhóm sang `COMPLETED`.
  - Khi Leader bấm **Reject**: Chuyển trạng thái đơn thành `REJECTED`.
- [ ] Viết `ApplicationController.java`.

### 📍 Giai đoạn 5: Tích hợp Frontend với Backend API

- [ ] Viết các hàm fetch API trong `frontend/src/lib/api.ts` kết nối tới backend `http://localhost:8080/api`.
- [ ] Thay thế dữ liệu tĩnh trong `mockData.ts` bằng dữ liệu gọi thật từ API trong các trang:
  - `frontend/src/app/groups/page.tsx` (Hiển thị danh sách nhóm thật từ Neon DB).
  - `frontend/src/app/create-group/page.tsx` (Form tạo nhóm gửi POST sang backend).
  - `frontend/src/app/manage/page.tsx` (Leader duyệt danh sách đơn ứng tuyển).
  - `frontend/src/app/mypage/page.tsx` (Hiển thị nhóm đã tham gia và đơn đã gửi).

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
