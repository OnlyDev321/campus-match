<div align="center">

# 🎓 CampusMatch

### Campus Study Group & Project Matching Platform

Discover teammates. Build study groups. Collaborate on campus projects.

A campus-focused platform that helps university students discover groups, connect with teammates, and manage study or project collaboration in one place.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#getting-started) · [API Overview](#-api-overview)

</div>

---

## 📌 Overview

**CampusMatch** is a web platform designed to simplify how university students find and organize study groups and project teams.

Students can explore recruiting groups, review group details, and submit join requests. Group leaders can create and manage groups, review applications, and organize members through a centralized workspace.

## ✨ Features

| Feature               | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| 🔐 Authentication     | Student registration and login with JWT authentication        |
| 🔎 Group Discovery    | Browse, search, and filter study or project groups            |
| 🏷️ Smart Filtering    | Filter by subject, technology tag, and recruiting status      |
| 👥 Group Details      | View group descriptions, leaders, members, and open positions |
| ➕ Group Management   | Create, edit, and close study/project groups                  |
| 📨 Applications       | Apply to join groups and track application status             |
| ✅ Application Review | Leaders can accept or reject applicants                       |
| 🧑‍🤝‍🧑 Member Management  | View and manage official group members                        |

## 🧰 Tech Stack

| Layer               | Technologies                                         |
| ------------------- | ---------------------------------------------------- |
| **Frontend**        | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| **Backend**         | Python · Flask · Flask Blueprints · REST API         |
| **Database**        | MySQL                                                |
| **Authentication**  | JWT · bcrypt password hashing                        |
| **Package Manager** | pnpm                                                 |

## 🏗️ Architecture

CampusMatch follows a client–server architecture. The frontend communicates with the Flask backend through HTTP/JSON, while the backend handles business logic, authentication, and database operations.

```text
┌─────────────────────────────────────────┐
│                Frontend                 │
│ Next.js 16 · React 19 · TypeScript      │
│              Tailwind CSS v4            │
└────────────────────┬────────────────────┘
                     │ HTTP / JSON
                     ▼
┌─────────────────────────────────────────┐
│                 Backend                 │
│        Python · Flask · REST API        │
│       Authentication · Business Logic   │
└────────────────────┬────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────┐
│                 Database                │
│                  MySQL                  │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```text
campus-match/
├── frontend/                      # Next.js application
│   ├── app/                       # App Router
│   │   ├── groups/
│   │   │   ├── page.tsx           # Group search
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Group details
│   │   ├── manage/                # Create/manage groups
│   │   └── mypage/                # Profile & applications
│   ├── components/                # Reusable UI components
│   ├── public/
│   └── package.json
│
├── backend/                       # Flask REST API
│   ├── app.py
│   ├── config/
│   │   └── database.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── groups.py
│   │   ├── applications.py
│   │   └── members.py
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── requirements.txt
│   └── .env                       # Local secrets (never commit)
│
└── README.md
```

> **Note:** This tree represents the planned organization. Actual file and route names may differ as development progresses.

## 🖥️ Application Pages

The application uses a shared dashboard layout (Header + Sidebar), with page content rendered according to the current route.

| Page                | Route          | Description                                         |
| ------------------- | -------------- | --------------------------------------------------- |
| **Group Search**    | `/groups`      | Browse, search, and filter groups                   |
| **Group Detail**    | `/groups/[id]` | Review group information and apply to join          |
| **Create / Manage** | `/manage`      | Create groups and manage members/applications       |
| **My Page**         | `/mypage`      | View profile, joined groups, and application status |

## 🔄 Core User Flows

### Find and Join a Group

```text
Login → Group List → Search / Filter → Group Detail
                                      ↓
                                    Apply
                                      ↓
                                   PENDING
                                      ↓
                                Leader Review
                                ↙           ↘
                           ACCEPTED       REJECTED
                               ↓
                       Added to the group
```

### Create and Manage a Group

```text
Create Group → Recruiting → Review Applications
                                  ↓
                            Accept / Reject
```

When a group reaches its member limit, its status can change to `COMPLETED`. A leader can also stop recruitment by closing the group, changing its status to `CLOSED`.

## 🗃️ Database Design

CampusMatch is designed around six core tables:

| Table           | Responsibility                                    |
| --------------- | ------------------------------------------------- |
| `users`         | Student account information                       |
| `study_groups`  | Study/project details and group leader            |
| `tags`          | Technology or skill tags                          |
| `group_tags`    | Many-to-many relationship between groups and tags |
| `applications`  | Join requests and their review status             |
| `group_members` | Official group membership                         |

### Data Integrity & Business Rules

- `users.student_num` and `users.email` should be unique.
- `group_tags` uses a composite primary key: `(group_id, tag_id)`.
- `group_members` uses a composite primary key: `(group_id, user_id)`.
- `applications` should enforce `UNIQUE(group_id, applicant_id)` to prevent duplicate applications to the same group.
- Calculate the current member count from `group_members` rather than maintaining a separate count, helping avoid inconsistent data.
- When an application is accepted, the backend adds the applicant to `group_members`.

### Status Values

| Entity          | Statuses                              |
| --------------- | ------------------------------------- |
| **Group**       | `RECRUITING` · `COMPLETED` · `CLOSED` |
| **Application** | `PENDING` · `ACCEPTED` · `REJECTED`   |

## 🔌 API Overview

**Local base URL:** `http://localhost:5000`

> The endpoints below describe the planned API interface and may change during implementation.

### Authentication & User

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| `POST` | `/api/auth/register` | Register a student      |
| `POST` | `/api/auth/login`    | Log in                  |
| `POST` | `/api/auth/logout`   | Log out                 |
| `GET`  | `/api/users/me`      | Get the current user    |
| `PUT`  | `/api/users/me`      | Update the current user |

### Groups

| Method   | Endpoint          | Description                     |
| -------- | ----------------- | ------------------------------- |
| `GET`    | `/api/groups`     | List, search, and filter groups |
| `GET`    | `/api/groups/:id` | Get group details               |
| `POST`   | `/api/groups`     | Create a group                  |
| `PUT`    | `/api/groups/:id` | Update a group                  |
| `DELETE` | `/api/groups/:id` | Close or delete a group         |

### Applications

| Method   | Endpoint                       | Description                     |
| -------- | ------------------------------ | ------------------------------- |
| `POST`   | `/api/groups/:id/applications` | Apply to join a group           |
| `GET`    | `/api/groups/:id/applications` | List applications (leader only) |
| `PUT`    | `/api/applications/:id/accept` | Accept an application           |
| `PUT`    | `/api/applications/:id/reject` | Reject an application           |
| `DELETE` | `/api/applications/:id`        | Withdraw an application         |

### Members

| Method   | Endpoint                          | Description        |
| -------- | --------------------------------- | ------------------ |
| `GET`    | `/api/groups/:id/members`         | List group members |
| `DELETE` | `/api/groups/:id/members/:userId` | Remove a member    |

### Group Search & Filtering

The group listing endpoint supports query parameters such as `search`, `subject`, `tag`, and `status`.

```http
GET /api/groups?search=web&subject=WebProgramming&tag=React&status=RECRUITING
```

<a id="getting-started"></a>

## ⚙️ Getting Started

Follow these steps to run CampusMatch locally.

### Prerequisites

Make sure the following tools are installed:

- **Git**
- **Python 3.9+**
- **Node.js** (a version supported by the installed Next.js 16 release)
- **pnpm**
- **MySQL Server**, or MySQL via Docker / XAMPP / MAMP

> If installation reports a Node.js engine-version error, upgrade Node.js to the version required by the project.

### 1. Clone the Repository

```bash
git clone https://github.com/OnlyDev321/campus-match.git
cd campus-match
```

### 2. Set Up the Backend

Open **Terminal 1**.

**macOS / Linux**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows PowerShell**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

When the virtual environment is active, `(venv)` should appear in your terminal prompt.

### 3. Configure Environment Variables

Create `backend/.env` and add your local configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campusmatch_db
JWT_SECRET_KEY=replace_with_a_secure_random_secret
```

> 🔒 **Security:** Never commit `.env` files or real credentials to GitHub. Use a strong, unique `JWT_SECRET_KEY` for each environment. Provide teammates with a `.env.example` containing placeholder values only.

Create the database in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS campusmatch_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Ensure MySQL is running and that the credentials in `backend/.env` match your local configuration.

### 4. Test the Database Connection

From the `backend/` directory, with the virtual environment activated:

```bash
python config/database.py
```

Expected success message (if the connection test is implemented in this file):

```text
Connect MYSQL successfully!
```

If the project uses migrations or a separate schema file, run that setup as well.

### 5. Start the Flask Backend

Still in **Terminal 1**, from `backend/`:

```bash
python app.py
```

Backend: **http://localhost:5000**

If a root route is configured, visit `http://localhost:5000/`. A sample response may look like:

```json
{
  "message": "Flask server is running successfully!",
  "status": "success"
}
```

### 6. Set Up and Start the Frontend

Open **Terminal 2** at the repository root:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend: **http://localhost:3000**

If pnpm is not installed:

```bash
npm install -g pnpm
```

Then run `pnpm install` and `pnpm dev` from the `frontend/` directory.

## 🧪 Quick Command Reference

| Task                                 | Command                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| Start backend (macOS/Linux)          | `cd backend && source venv/bin/activate && python app.py` |
| Start frontend                       | `cd frontend && pnpm dev`                                 |
| Test DB connection (from `backend/`) | `python config/database.py`                               |

> Run the backend and frontend in separate terminals. Keep the backend terminal running while using the frontend.

## 🛠️ Troubleshooting

<details>
<summary><strong>ModuleNotFoundError: No module named ...</strong></summary>

Activate the backend virtual environment and install dependencies:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

On Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

</details>

<details>
<summary><strong>Unknown database 'campusmatch_db'</strong></summary>

Create the database using the SQL command in the environment configuration section. Verify that `DB_NAME` in `backend/.env` is set to `campusmatch_db`.

</details>

<details>
<summary><strong>Access denied for user 'root'@'localhost'</strong></summary>

Check `DB_USER` and `DB_PASSWORD` in `backend/.env`. Confirm that MySQL is running and that the configured user has permission to access the database.

</details>

<details>
<summary><strong>Frontend cannot connect to the backend</strong></summary>

- Confirm Flask is running at `http://localhost:5000`.
- Check the frontend API base URL / environment configuration.
- Verify that Flask CORS settings allow requests from the frontend origin (`http://localhost:3000`).

</details>
