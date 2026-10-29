<div align="center">

# 🎓 CampusMatch (캠퍼스매치)

### Soongsil University Study Group & Project Team Matching Platform

**숭실대학교 전용 스터디 및 프로젝트 팀원 매칭 서비스**

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL_16-blue?logo=postgresql)](https://neon.tech/)
[![Soongsil SSO](https://img.shields.io/badge/SSO-u--SAINT_Verified-004ac6)](https://saint.ssu.ac.kr)

<br />

[📖 What is CampusMatch?](#-what-is-campusmatch) · [💡 Why CampusMatch?](#-why-campusmatch) · [🚀 Key Features](#-key-features) · [🛠️ Tech Stack](#️-tech-stack) · [📑 Technical Documentation](#-technical-documentation)

</div>

---

## 📖 What is CampusMatch?

**CampusMatch** is a dedicated web collaboration platform designed exclusively for students at **Soongsil University (숭실대학교)**. It enables students to discover study partners, assemble project teams for graduation capstones, prepare for coding tests, or collaborate on campus hackathons.

To eliminate fake accounts and ghosting, CampusMatch integrates directly with **Soongsil University's official u-SAINT portal**. Students log in seamlessly using their student credentials without requiring manual registration, automatically synchronizing their verified department, major, and academic standing.

---

## 💡 Why CampusMatch?

When searching for project teammates on open social media, KakaoTalk open chats, or anonymous campus forums (Everytime / 에브리타임), students frequently face severe pain points:

- ❌ **Anonymous & Unverified Profiles:** Uncertainty regarding who teammates truly are, their actual majors, and their real accountability.
- ❌ **Free-Riders & Disappearances:** Members accepting tasks only to abandon them midway, leaving a single student to carry the entire project.
- ❌ **Mismatched Skill Sets:** Projects requiring backend developers often attract only frontend learners, with no structured role quotas.

### 👉 The CampusMatch Solution:

1. **100% Real Student Verification:** Only authenticated Soongsil students can join via direct u-SAINT SSO.
2. **Transparent Academic Standing:** Automatically synchronizes and displays genuine department details (e.g., School of Computer Science, AI Convergence, Software).
3. **Role-Based Quota Management:** Group leaders set explicit member quotas (e.g., 2 Backend, 1 Frontend, 1 UI/UX Designer).
4. **Zero Password Retention:** Student portal credentials are verified in-flight with university SSO servers and are **never stored** in the database.

---

## 🚀 Key Features

| Feature                               | Description                                                                                                                                     |
| :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔐 **1-Click u-SAINT SSO**            | Instant authentication using official student portal credentials. Zero extra accounts to create or passwords to remember.                       |
| 🔍 **Smart Group Discovery**          | Search and filter study groups by course codes (e.g., CS490, Web Programming), tech stack (Spring Boot, React, Python), and recruitment status. |
| 👥 **Team Recruitment Workspace**     | Group leaders can publish recruitment goals, define skill requirements, and set maximum member limits within seconds.                           |
| 📨 **Application & Member Lifecycle** | Students submit personalized statements when applying. Leaders review applications with one-click Accept or Reject actions.                     |
| 🌓 **Adaptive Light & Dark Themes**   | Polished, accessible UI following contemporary Korean tech aesthetics, designed to prevent eye strain during late-night study sessions.         |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Spring Boot
- **Database:** PostgreSQL hosted on Neon.tech (Serverless Cloud, Singapore Region, SSL-enforced)
- **Authentication:** Soongsil University SAP SSO Gateway (`smartid.ssu.ac.kr`)
- **Infrastructure:** Vercel (Frontend Global Edge) & Oracle Cloud Always Free (Backend Compute)

---

## 📑 Technical Documentation

For developers looking for deep-dive technical specifications — including database entity relationship diagrams, RESTful API contracts, SSO sequence flows, and the step-by-step implementation roadmap — please refer to:

👉 **[architecture.md — System Architecture & Implementation Roadmap](architecture.md)**

---

<div align="center">
  <sub>Built by Soongsilians for the Soongsil University community 숭실대학교 💙</sub>
</div>
