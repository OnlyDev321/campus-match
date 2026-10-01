# CampusMatch — Kiến trúc hệ thống

Tài liệu mô tả kiến trúc thực tế của dự án **CampusMatch** — nền tảng tìm kiếm, tạo và quản lý nhóm học tập / đồ án trong trường đại học.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Database Design](#4-database-design)
5. [REST API](#5-rest-api)
6. [Quy ước Backend](#6-quy-ước-backend)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Core User Flow](#8-core-user-flow)

---

## 1. Tổng quan

**CampusMatch** giúp sinh viên tìm nhóm học tập / đồ án phù hợp, kết nối với đồng đội và quản lý quá trình hợp tác trong một nơi.

**MVP tập trung vào 4 chức năng cốt lõi:**

1. Đăng nhập / đăng ký
2. Tìm kiếm & xem Study Group
3. Tạo & quản lý Study Group
4. Apply & duyệt thành viên

Với phạm vi này, project có đủ **CRUD, Authentication, Search/Filter, quan hệ 1-N / N-N, REST API** và database.

### Tech Stack

| Layer              | Technologies                                                |
| ------------------ | ----------------------------------------------------------- |
| **Frontend**       | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · pnpm |
| **Backend**        | Python · Flask · Flask Blueprints · REST API                |
| **Database**       | MySQL                                                       |
| **Authentication** | JWT · bcrypt password hashing                               |
| **HTTP client**    | Fetch API (gói trong `lib/api.ts`)                          |

---

## 2. Kiến trúc hệ thống

```text
┌──────────────────────────────────────────────┐
│                  Frontend                    │
│      Next.js 16 · React 19 · TypeScript      │
│            Tailwind CSS v4                   │
│                                              │
│  app/ (pages) → components/ (domain)         │
│       → design-system/ (generic UI)          │
│       → lib/ (api.ts, types.ts)              │
└────────────────────┬─────────────────────────┘
                     │  HTTP / JSON  (REST API)
                     │  Header: Authorization: Bearer <JWT>
                     ▼
┌──────────────────────────────────────────────┐
│                  Backend                     │
│         Python · Flask · Blueprint           │
│                                              │
│  routes/  ──►  services/  ──►  config/       │
│  (HTTP layer)  (business logic)  (database)  │
│  utils/ (jwt, validators)                    │
└────────────────────┬─────────────────────────┘
                     │  SQL (PyMySQL)
                     ▼
┌──────────────────────────────────────────────┐
│                 Database                     │
│                    MySQL                     │
│  users · study_groups · tags · group_tags    │
│  applications · group_members                │
└──────────────────────────────────────────────┘
```

### Nguyên tắc phân tầng Backend

| Layer         | Responsibility                                                      | Ví dụ                          |
| ------------- | ------------------------------------------------------------------- | ------------------------------ |
| **routes/**   | Nhận HTTP request, validate đầu vào, gọi service, trả JSON + mã lỗi | `routes/groups.py`             |
| **services/** | Toàn bộ business logic + truy vấn database                          | `group_service.create_group()` |
| **config/**   | Kết nối database                                                    | `database.get_db_connection()` |
| **utils/**    | Hàm dùng chung (JWT, validators)                                    | `jwt.encode_token()`           |

**Quy tắc:** route **không** viết SQL, service **không** biết gì về HTTP — mọi lỗi nghiệp vụ được ném ra dưới dạng exception để route đổi thành mã HTTP (xem [mục 6](#6-quy-ước-backend)).

---

## 3. Cấu trúc thư mục

### Backend

```text
backend/
├── app.py                       # Tạo Flask app, CORS, đăng ký blueprint
├── config/
│   └── database.py              # get_db_connection() — PyMySQL, DictCursor, .env
├── routes/                      # HTTP layer (Blueprint)
│   ├── auth.py                  # /api/auth/*
│   ├── users.py                 # /api/users/*
│   ├── groups.py                # /api/groups/*
│   ├── applications.py          # /api/groups/:id/applications, /api/applications/*
│   └── members.py               # /api/groups/:id/members/*
├── services/                    # Business logic + query SQL
│   ├── auth_service.py
│   ├── group_service.py
│   └── application_service.py
├── models/                      # Định nghĩa bảng / helper data
│   ├── user.py
│   ├── group.py
│   ├── tag.py
│   ├── application.py
│   └── member.py
├── utils/
│   ├── jwt.py                   # Tạo / verify token
│   └── validators.py            # Kiểm tra input
├── requirements.txt
├── .env                         # Secret (KHÔNG commit)
└── venv/                        # Virtual environment
```

### Frontend

```text
frontend/
├── src/
│   ├── app/                     # App Router — mỗi page 1 route
│   │   ├── layout.tsx           # Shell chung: Header + Sidebar + Footer + Theme
│   │   ├── page.tsx             # Trang chủ
│   │   ├── groups/
│   │   │   ├── page.tsx         # Group Search
│   │   │   └── [id]/page.tsx    # Group Detail
│   │   ├── create-group/page.tsx  # Tạo nhóm
│   │   ├── manage/page.tsx        # Quản lý nhóm / duyệt đơn
│   │   ├── mypage/page.tsx        # Profile, nhóm đã tham gia, đơn đã gửi
│   │   └── design/page.tsx        # Xem trước design system
│   ├── components/              # Domain components (tái sử dụng ≥ 2 page)
│   │   ├── layout/              # Header.tsx · Sidebar.tsx · Footer.tsx
│   │   ├── group/               # GroupCard.tsx
│   │   └── application/         # ApplicationCard.tsx
│   ├── design-system/           # UI generic — KHÔNG chứa business
│   │   ├── tokens.ts            # Design tokens (màu, spacing, radius...)
│   │   ├── theme/               # ThemeProvider, ThemeToggle (light/dark)
│   │   └── components/          # Button · Card · Badge · Avatar · Modal ·
│   │                            # Input · SearchInput · Checkbox · Radio ·
│   │                            # RoleQuota · CommandBar · CompatibilityTag
│   └── lib/
│       ├── api.ts               # Fetch wrapper: base URL, JWT, error chung
│       ├── types.ts             # Types dùng chung cho toàn project
│       └── mockData.ts          # Data giả để dev khi chưa có API
├── DESIGN.md                    # Quy chuẩn thiết kế (color, typography...)
├── AGENTS.md                    # Quy tắc cho AI agent (Next.js breaking changes)
└── package.json
```

---

## 4. Database Design

6 bảng, đã được tạo trong database `campusmatch_db`.

### Sơ đồ quan hệ

```text
                     ┌──────────────┐
                     │    users     │
                     └──────┬───────┘
                            │
            ┌───────────────┼────────────────┐
            │ leader_id     │ applicant_id   │ user_id
            ▼               ▼                ▼
   ┌────────────────┐  ┌──────────────┐  ┌────────────────┐
   │ study_groups   │  │ applications │  │ group_members  │
   └───────┬────────┘  └──────▲───────┘  └───────▲────────┘
           │ group_id         │ group_id         │ group_id
           ▼                  │                  │
   ┌────────────────┐         │                  │
   │   group_tags   │─────────┼──────────────────┘
   └───────┬────────┘         │
           │ tag_id           │
           ▼                  │
      ┌─────────┐             │
      │  tags   │             │
      └─────────┘             │
```

### 4.1. users

| Column          | Type                    | Description               |
| --------------- | ----------------------- | ------------------------- |
| `id`            | INT PK AUTO             | ID người dùng             |
| `student_num`   | VARCHAR(20) **UNIQUE**  | Mã số sinh viên           |
| `name`          | VARCHAR(50)             | Họ tên                    |
| `email`         | VARCHAR(100) **UNIQUE** | Email                     |
| `password_hash` | VARCHAR(255)            | Mật khẩu đã hash (bcrypt) |
| `department`    | VARCHAR(50)             | Khoa / ngành              |
| `created_at`    | TIMESTAMP               | Thời gian tạo             |

### 4.2. study_groups

| Column             | Type           | Description                                  |
| ------------------ | -------------- | -------------------------------------------- |
| `id`               | INT PK AUTO    | ID nhóm                                      |
| `title`            | VARCHAR(100)   | Tên nhóm / project                           |
| `subject_name`     | VARCHAR(100)   | Tên môn học                                  |
| `description`      | TEXT           | Mô tả nhóm                                   |
| `max_members`      | INT            | Số thành viên tối đa (≥ 2, CHECK constraint) |
| `current_members`  | INT            | Số thành viên hiện tại — **đồng bộ tự động bởi trigger** (xem 4.7), DEFAULT 0 |
| `status`           | ENUM           | `RECRUITING` · `COMPLETED` · `CLOSED`        |
| `leader_id`        | INT FK → users | Trưởng nhóm (source of truth)                |
| `created_at`       | TIMESTAMP      | Thời gian tạo                                |

> **Về `current_members`:** đây là cột denormalized — dữ liệu **phụ thuộc** được lưu sẵn để query list nhanh (không cần `GROUP BY` mỗi lần). Thay đổi tới `group_members` **tự động** cập nhật cột này qua MySQL trigger, nên không thể bị lệch. Query ngược lại (`COUNT`) chỉ dùng khi cần kiểm tra / repair.

### 4.3. tags

| Column     | Type                   | Description                     |
| ---------- | ---------------------- | ------------------------------- |
| `id`       | INT PK AUTO            | ID tag                          |
| `tag_name` | VARCHAR(30) **UNIQUE** | Tên kỹ năng (React, Next.js...) |

### 4.4. group_tags (quan hệ N-N)

| Column     | Type                  |
| ---------- | --------------------- |
| `group_id` | INT FK → study_groups |
| `tag_id`   | INT FK → tags         |

**Primary Key:** `(group_id, tag_id)`

### 4.5. applications

| Column         | Type           | Description                         |
| -------------- | -------------- | ----------------------------------- |
| `id`           | INT PK AUTO    | ID đơn                              |
| `group_id`     | INT FK         | Nhóm muốn tham gia                  |
| `applicant_id` | INT FK → users | Người đăng ký                       |
| `introduction` | TEXT           | Lời giới thiệu                      |
| `status`       | ENUM           | `PENDING` · `ACCEPTED` · `REJECTED` |
| `created_at`   | TIMESTAMP      | Thời gian đăng ký                   |

**Constraint:** `UNIQUE(group_id, applicant_id)` — 1 sinh viên chỉ gửi 1 đơn cho 1 nhóm.

### 4.6. group_members

| Column      | Type           | Description                             |
| ----------- | -------------- | --------------------------------------- |
| `group_id`  | INT FK         | Nhóm                                    |
| `user_id`   | INT FK → users | Thành viên                              |
| `role`      | ENUM           | `LEADER` · `MEMBER` (mặc định `MEMBER`) |
| `joined_at` | TIMESTAMP      | Thời gian vào nhóm                      |

**Primary Key:** `(group_id, user_id)`

### Business Rules

1. **`current_members` luôn được đồng bộ bởi trigger** — mọi INSERT/DELETE trên `group_members` tự động ±1 (xem 4.7). Code backend **không** tự update cột này:
   ```sql
   -- Accept application: chỉ INSERT member, trigger tự +1
   INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'MEMBER');
   ```
2. **Trưởng nhóm cũng là thành viên** — khi tạo group, backend INSERT ngay 1 dòng vào `group_members` với `role='LEADER'` → trigger +1 → `current_members = 1` ngay lập tức.
3. **`leader_id` trong `study_groups` là source of truth** cho quyền hạn (duyệt đơn, xóa thành viên); cột `role` chỉ để query hiển thị tiện lợi. Leader không bao giờ chuyển nhượng → 2 nguồn không bị mâu thuẫn.
4. **Khi application được ACCEPTED** → backend INSERT vào `group_members` với `role='MEMBER'` (kiểm tra `current_members < max_members` trước, trong cùng transaction).
5. **Đủ người** (`current_members = max_members`) → `status = COMPLETED`; leader chủ động đóng → `status = CLOSED`.

### 4.7. Triggers đồng bộ `current_members`

Hai trigger trên bảng `group_members` — **nguồn tự động hóa duy nhất** để giữ `current_members` khớp:

```sql
-- Áp dụng cho database đã tạo (thêm cột + trigger)
ALTER TABLE study_groups
  ADD COLUMN current_members INT NOT NULL DEFAULT 0;

-- INSERT member (accept đơn / leader vào nhóm) → +1
CREATE TRIGGER trg_gm_after_insert
AFTER INSERT ON group_members
FOR EACH ROW
  UPDATE study_groups
  SET current_members = current_members + 1
  WHERE id = NEW.group_id;

-- DELETE member (leader xóa người / xóa nhóm cascade) → -1
CREATE TRIGGER trg_gm_after_delete
AFTER DELETE ON group_members
FOR EACH ROW
  UPDATE study_groups
  SET current_members = current_members - 1
  WHERE id = OLD.group_id;
```

**Đối chiếu tình huống:**

| Tình huống                          | Trigger            | `current_members` |
| ----------------------------------- | ------------------ | ----------------- |
| Tạo group (INSERT leader)           | `AFTER INSERT`     | = 1               |
| Accept application (INSERT member)  | `AFTER INSERT`     | +1                |
| Reject / rút đơn (không insert member) | không kích hoạt  | giữ nguyên        |
| Xóa member khỏi nhóm                | `AFTER DELETE`     | −1                |
| Đổi role (UPDATE)                   | không có trigger   | giữ nguyên        |

**Repair query** — đối soát định kỳ hoặc nếu lỡ sửa DB tay ngoài trigger:

```sql
UPDATE study_groups g
SET current_members = (SELECT COUNT(*) FROM group_members WHERE group_id = g.id);
```

### Trạng thái (Status Values)

| Entity          | Statuses                              |
| --------------- | ------------------------------------- |
| **Group**       | `RECRUITING` · `COMPLETED` · `CLOSED` |
| **Application** | `PENDING` · `ACCEPTED` · `REJECTED`   |

---

## 5. REST API

**Local base URL:** `http://localhost:5000`
**Content-Type:** `application/json`
**Authentication:** `Authorization: Bearer <JWT>` (các endpoint cần đăng nhập)

Tổng cộng **17 endpoints**, chia 4 module:

### 5.1. Authentication & User

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| `POST` | `/api/auth/register` | Đăng ký sinh viên     |
| `POST` | `/api/auth/login`    | Đăng nhập             |
| `POST` | `/api/auth/logout`   | Đăng xuất             |
| `GET`  | `/api/users/me`      | Lấy thông tin cá nhân |
| `PUT`  | `/api/users/me`      | Cập nhật thông tin    |

```jsonc
// POST /api/auth/register
{ "student_num": "20231234", "name": "Kim Jin Ho",
  "email": "student@example.com", "password": "password123",
  "department": "Software" }

// POST /api/auth/login → response
{ "access_token": "JWT_TOKEN",
  "user": { "id": 1, "name": "Kim Jin Ho", "student_num": "20231234" } }
```

### 5.2. Groups

| Method   | Endpoint          | Description                      |
| -------- | ----------------- | -------------------------------- |
| `GET`    | `/api/groups`     | Danh sách nhóm (search + filter) |
| `GET`    | `/api/groups/:id` | Chi tiết nhóm                    |
| `POST`   | `/api/groups`     | Tạo nhóm                         |
| `PUT`    | `/api/groups/:id` | Cập nhật nhóm                    |
| `DELETE` | `/api/groups/:id` | Đóng / xóa nhóm                  |

**Query params** (kết hợp được với nhau):

```http
GET /api/groups?search=web&subject_name=WebProgramming&tag=React&status=RECRUITING
```

| Param          | Meaning                           | Default      |
| -------------- | --------------------------------- | ------------ |
| `search`       | Tìm trong `title` / `description` | —            |
| `subject_name` | Lọc theo môn học                  | —            |
| `tag`          | Lọc theo tag (N-N qua group_tags) | —            |
| `status`       | Trạng thái nhóm                   | `RECRUITING` |

```jsonc
// GET /api/groups/:id → response
{
  "id": 1,
  "title": "Nhóm React",
  "subject_name": "WebProgramming",
  "description": "...",
  "max_members": 4,
  "status": "RECRUITING",
  "leader_id": 1,
  "leader_name": "Kim Jin Ho",
  "member_count": 2,
  "tags": [{ "id": 1, "name": "React" }],
}
```

### 5.3. Applications

| Method   | Endpoint                       | Description           |
| -------- | ------------------------------ | --------------------- |
| `POST`   | `/api/groups/:id/applications` | Gửi đơn tham gia      |
| `GET`    | `/api/groups/:id/applications` | Xem đơn (leader only) |
| `PUT`    | `/api/applications/:id/accept` | Chấp nhận đơn         |
| `PUT`    | `/api/applications/:id/reject` | Từ chối đơn           |
| `DELETE` | `/api/applications/:id`        | Rút đơn               |

```jsonc
// POST /api/groups/12/applications
{ "introduction": "Em đã có kinh nghiệm React và TypeScript." }
```

### 5.4. Members

| Method   | Endpoint                          | Description    |
| -------- | --------------------------------- | -------------- |
| `GET`    | `/api/groups/:id/members`         | Xem thành viên |
| `DELETE` | `/api/groups/:id/members/:userId` | Xóa thành viên |

> **Không có** `POST /api/groups/:id/members` — thành viên chỉ được thêm qua Application → `ACCEPTED` → `group_members`.

### Quy ước lỗi

| HTTP  | Khi nào                                |
| ----- | -------------------------------------- |
| `400` | Dữ liệu đầu vào không hợp lệ           |
| `401` | Chưa đăng nhập / token hết hạn         |
| `403` | Không có quyền (vd: không phải leader) |
| `404` | Không tìm thấy resource                |
| `500` | Lỗi database / server                  |

Format lỗi thống nhất:

```json
{ "error": "title và subject_name là bắt buộc" }
```

---

## 6. Quy ước Backend

### 6.1. Import & cách chạy

Project import theo kiểu **relative đến `backend/`** (không có prefix `backend.`):

```python
# routes/groups.py
from flask import Blueprint, request, jsonify
from services.group_service import get_groups, create_group, get_group_by_id

# services/group_service.py
from config.database import get_db_connection
```

Vì vậy app **bắt buộc chạy từ thư mục `backend/`**:

```bash
cd backend
source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1
python app.py              # → http://localhost:5000
```

> ⚠️ Sai lệch này (`ModuleNotFoundError: No module named 'backend'`) xảy ra nếu chạy từ thư mục gốc với `from backend.services...`. Quy ước chốt: **không dùng prefix `backend.`**.

### 6.2. Blueprint

Mỗi file route tạo Blueprint riêng, `app.py` đăng ký với `url_prefix`:

```python
# routes/groups.py
bp = Blueprint("groups", __name__)

# app.py
from routes.groups import bp as groups_bp
app.register_blueprint(groups_bp, url_prefix="/api/groups")
```

Route trong file chỉ viết path tương đối: `@bp.get("/")`, `@bp.get("/<int:group_id>")`.

### 6.3. Quy ước lỗi Service → Route

Service **không trả HTTP status** — chỉ ném exception, route bắt và đổi sang mã HTTP:

| Exception         | HTTP | Route bắt             |
| ----------------- | ---- | --------------------- |
| `ValueError`      | 400  | Dữ liệu không hợp lệ  |
| `LookupError`     | 404  | Không tìm thấy record |
| `PermissionError` | 403  | Không có quyền        |
| `ConnectionError` | 500  | Lỗi database          |

```python
# routes/groups.py — pattern chuẩn
@bp.post("/")
def create():
    try:
        group = create_group(request.get_json() or {}, leader_id=1)
        return jsonify(group), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
```

### 6.4. Quy ước transaction

Các thao tác ghi nhiều bảng (vd: tạo group + thêm leader vào `group_members` + gán tags) phải dùng **transaction thủ công**:

```python
conn = get_db_connection()      # database.py bật autocommit=True mặc định
conn.autocommit(False)          # tắt autocommit cho transaction này
try:
    # ... nhiều INSERT/UPDATE ...
    conn.commit()               # tất cả thành công mới lưu
except Exception:
    conn.rollback()             # có lỗi → hoàn toàn như chưa thay đổi gì
    raise
finally:
    conn.close()
```

### 6.5. Quy tắc query

- Dùng `pymysql.cursors.DictCursor` → kết quả là `dict`, trả thẳng ra JSON được
- Tên cột SQL phải khớp schema: `subject_name`, `tag_name` (không phải `subject`, `name`)
- Số thành viên đọc từ cột `study_groups.current_members` (trigger đã đồng bộ) — không cần `GROUP BY` khi list; `COUNT(group_members)` chỉ dùng để đối soát / repair, không bao giờ đếm qua application
- Gom tags cho nhiều group bằng 1 query `WHERE group_id IN (...)` (tránh N+1)

---

## 7. Frontend Architecture

### 7.1. Ba tầng component

```text
┌─────────────────────────────────────────────────────────┐
│ 1. app/  (Pages)                                        │
│    Chỉ routing + composition + gọi API. Page MỎNG.      │
│    groups/page.tsx · groups/[id]/page.tsx · mypage/...  │
├─────────────────────────────────────────────────────────┤
│ 2. components/  (Domain components)                     │
│    Component theo nghiệp vụ, compose design-system.     │
│    group/GroupCard · application/ApplicationCard        │
│    + components/layout/ (Header, Sidebar, Footer)       │
├─────────────────────────────────────────────────────────┤
│ 3. design-system/  (Generic UI)                         │
│    UI thuần, KHÔNG biết gì về business.                 │
│    Button · Card · Badge · Avatar · Modal · tokens...   │
└─────────────────────────────────────────────────────────┘
```

### 7.2. Nguyên tắc tách component

| Tình huống                       | Quyết định                            |
| -------------------------------- | ------------------------------------- |
| Component dùng ở **≥ 2 page**    | Tách vào `components/<domain>/`       |
| Mapping / logic business lặp lại | Tách ra (vd: status → badge variant)  |
| Dùng ở **1 lần**, không lặp      | Code thẳng trong page                 |
| UI thuần (nút, hộp, input)       | Dùng `design-system/`, không viết lại |

- **Quy tắc "rule of 2"**: extract component khi thấy code trùng lần thứ 2, không extract trước khi cần.
- **Ví dụ**: `GroupCard` dùng ở `/groups`, `/mypage`, `/manage` → tách. `ApplyModal` chỉ ở `/groups/[id]` → nằm trong page.
- `GroupCard` **không duplicate design-system** — nó chỉ compose `Card + Badge + Avatar + RoleQuota` đã có, đóng gói thêm mapping status + dữ liệu business.

### 7.3. lib/ — file dùng chung toàn project

| File          | Responsibility                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`      | Fetch wrapper: base URL (`http://localhost:5000`), tự gắn header JWT, parse JSON, xử lý lỗi 401/500 thống nhất — **17 endpoint gọi qua 1 chỗ** |
| `types.ts`    | TypeScript interface/type cho dữ liệu API (`Group`, `Application`, `User`, status unions) — 1 nguồn sự thật cho 4 thành viên                   |
| `mockData.ts` | Data giả + type tạm để dev khi backend chưa có API                                                                                             |

```typescript
// lib/api.ts — pattern sử dụng
const groups = await api.get<Group[]>("/groups?status=RECRUITING");
const group = await api.post<Group>("/groups", { title, subject_name });
```

### 7.4. Theme

- Hệ thống **light/dark theme** hoàn chỉnh: `ThemeProvider` + `tokens.ts` (theo `DESIGN.md`), script khởi tạo theme chạy trước khi paint (tránh nháy màn hình).
- Component dùng CSS variable: `var(--surface)`, `var(--border)`, `var(--text-primary)`...

---

## 8. Core User Flow

### 8.1. Sinh viên tìm & tham gia nhóm

```text
Login → Group List → Search / Filter → Group Detail
                                          ↓
                                        Apply (gửi introduction)
                                          ↓
                                       PENDING
                                          ↓
                                    Leader Review
                                    ↙           ↘
                              ACCEPTED       REJECTED
                                  ↓
              CHECK current_members < max_members
                                  ↓
              INSERT group_members (role='MEMBER')   ← trigger +1
                                  ↓
        Nếu current_members = max_members → status = COMPLETED
```

**Ràng buộc:**

- Đã là thành viên / đã có đơn `PENDING` → không gửi thêm (violation `UNIQUE(group_id, applicant_id)` → 400)
- Nhóm `CLOSED` / `COMPLETED` → không nhận đơn mới

### 8.2. Leader tạo & quản lý nhóm

```text
Create Group
    ↓
INSERT study_groups (leader_id = current user)
INSERT group_members (leader, role='LEADER')   ← trigger +1 → current_members = 1
INSERT tags / group_tags
    ↓
RECRUITING → Review Applications → Accept / Reject
    ↓                                  ↓
đủ max_members              INSERT group_members (MEMBER)
    ↓
COMPLETED                          ↓
              đủ → COMPLETED · leader đóng → CLOSED
```

**Quy tắc quản lý:**

- Chỉ `leader_id` của nhóm mới được duyệt đơn, xóa thành viên, cập nhật / đóng nhóm (403 nếu là người khác)
- **Không cho xóa leader** khỏi `group_members`
- `DELETE /api/groups/:id` = đóng nhóm (`CLOSED`), giữ dữ liệu; xóa hẳn là thao tác khác (dev có thể chọn 1 trong 2)

---

## Tóm tắt

```text
Frontend (Next.js)  ──HTTP/JSON──►  Flask (routes → services → config)
                                              │
                                              ▼
                              MySQL: users · study_groups · tags
                                     group_tags · applications · group_members

• 17 REST endpoints — 4 module (auth, users, groups, applications + members)
• 6 bảng — quan hệ 1-N và N-N; current_members đồng bộ tự động bằng trigger
• Leader là member với role='LEADER' ngay khi tạo nhóm
• Frontend 3 tầng: page mỏng → domain component → design-system
• Quy ước lỗi: ValueError→400 · LookupError→404 · ConnectionError→500
```
