import type {
  User,
  UserStats,
  MyGroup,
  MyApplication,
  GroupCardData,
  GroupDetailData,
  GroupRoleQuota,
  GroupMemberDetail,
  ApplicantApplication,
} from "@/lib/types";

// Dữ liệu giả cho trang Groups (GroupCard) và Manage (ApplicationCard).
// Type nằm trong lib/types.ts; khi có API thật chỉ cần thay các biến mock bên dưới.

export const mockGroupCards: GroupCardData[] = [
  {
    id: "wp1",
    course: "Web Programming",
    title: "Web Programming Project",
    description:
      "Build a campus event ticketing and student club portal with Next.js and Go.",
    college: "IT대학",
    department: "소프트웨어학부",
    postYear: 2024,
    leaderName: "Kim Jinho",
    leaderMajor: "소프트웨어학부",
    memberCount: 3,
    maxMembers: 4,
  },
  {
    id: "nlp01",
    course: "Artificial Intelligence",
    title: "AI / NLP Paper Study Group",
    description:
      "Weekly reading and implementation of recent LLM fine-tuning and retrieval-augmented generation architectures.",
    college: "IT대학",
    department: "AI융합학부",
    postYear: 2025,
    leaderName: "Lee Chaewon",
    leaderMajor: "AI융합학부",
    memberCount: 4,
    maxMembers: 5,
  },
  {
    id: "cap01",
    course: "Capstone Design",
    title: "Mobile App Capstone Team",
    description:
      "Developing a peer-to-peer campus ride sharing & commute app with real-time route optimization.",
    college: "IT대학",
    department: "소프트웨어학부",
    postYear: 2025,
    leaderName: "Park Sungmin",
    leaderMajor: "소프트웨어학부",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "algo01",
    course: "Computer Science Core",
    title: "Algorithm & Coding Test Prep",
    description:
      "Targeting Tier Gold/Platinum on Baekjoon and LeetCode Hard. 3 problems weekly with in-depth code reviews.",
    college: "IT대학",
    department: "컴퓨터학부",
    postYear: 2024,
    leaderName: "Choi Woojin",
    leaderMajor: "컴퓨터학부",
    memberCount: 5,
    maxMembers: 6,
  },
  {
    id: "db01",
    course: "Database Systems",
    title: "Database Systems Internals Study",
    description:
      "Deep dive into transaction isolation, WAL, and distributed DB architecture based on PostgreSQL and SQLite.",
    college: "IT대학",
    department: "컴퓨터학부",
    postYear: 2024,
    leaderName: "Jung Dahye",
    leaderMajor: "컴퓨터학부",
    memberCount: 4,
    maxMembers: 4,
  },
  {
    id: "fin01",
    course: "Software Engineering",
    title: "Fintech Backend Capstone",
    description:
      "High-throughput stock trading simulation platform with Spring Boot, Apache Kafka, and Redis caching.",
    college: "IT대학",
    department: "소프트웨어학부",
    postYear: 2024,
    leaderName: "Han Minsoo",
    leaderMajor: "소프트웨어학부",
    memberCount: 3,
    maxMembers: 5,
  },
  {
    id: "is334",
    course: "System Design",
    title: "Microservices Simulator",
    description:
      "A high-load distributed system simulating real-time course registration for 20,000 students.",
    college: "IT대학",
    department: "컴퓨터학부",
    postYear: 2024,
    leaderName: "Duy Anh",
    leaderMajor: "컴퓨터학부",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "se214",
    course: "Software Architecture",
    title: "Campus Event Ticketing WebApp",
    description:
      "Ticketing and QR check-in software for student clubs with a real-time analytics dashboard.",
    college: "IT대학",
    department: "소프트웨어학부",
    postYear: 2025,
    leaderName: "Thao Nguyen",
    leaderMajor: "소프트웨어학부",
    memberCount: 4,
    maxMembers: 4,
  },
  {
    id: "cs490",
    course: "Machine Learning",
    title: "AI Academic Planner & Study Bot",
    description:
      "Smart course recommendation and schedule optimization platform using LLMs and vector search.",
    college: "IT대학",
    department: "AI융합학부",
    postYear: 2025,
    leaderName: "Hau Tran",
    leaderMajor: "AI융합학부",
    memberCount: 2,
    maxMembers: 5,
  },
  {
    id: "cs301",
    course: "Cloud Computing",
    title: "Kubernetes Cluster Management Lab",
    description:
      "Deploy and benchmark multi-tenant microservices clusters on AWS with automated CI/CD pipelines.",
    college: "IT대학",
    department: "전자정보공학부",
    postYear: 2024,
    leaderName: "Minh Tri",
    leaderMajor: "전자정보공학부",
    memberCount: 1,
    maxMembers: 3,
  },
  {
    id: "ds202",
    course: "Robotics Control",
    title: "Autonomous Mobile Robot Navigation",
    description:
      "Designing SLAM and sensor fusion navigation system for campus delivery robot.",
    college: "공과대학",
    department: "기계공학부",
    postYear: 2026,
    leaderName: "Park Minseo",
    leaderMajor: "기계공학부",
    memberCount: 3,
    maxMembers: 4,
  },
  {
    id: "biz101",
    course: "Business Analytics",
    title: "Fintech Venture Market Research",
    description:
      "Analyzing cross-border payment trends and Gen-Z financial literacy in South Korea.",
    college: "경영대학",
    department: "경영학부",
    postYear: 2024,
    leaderName: "Jung Dahye",
    leaderMajor: "경영학부",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "chem01",
    course: "Material Engineering",
    title: "Semiconductor Thin Film Synthesis",
    description:
      "Research on atomic layer deposition (ALD) and oxide semiconductor materials for next-generation displays.",
    college: "공과대학",
    department: "화학공학과",
    postYear: 2025,
    leaderName: "Kang Yuna",
    leaderMajor: "화학공학과",
    memberCount: 3,
    maxMembers: 4,
  },
  {
    id: "eng01",
    course: "Venture Management",
    title: "Global Tech Startup Case Analysis",
    description:
      "Formulating go-to-market strategies and financial projection models for university spin-off startups.",
    college: "경영대학",
    department: "벤처중소기업학과",
    postYear: 2026,
    leaderName: "Shin Dongwook",
    leaderMajor: "벤처중소기업학과",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "media01",
    course: "Interactive Media",
    title: "Metaverse & 3D Spatial Audio",
    description:
      "Designing immersive Unity WebXR campus navigation with binaural spatial audio rendering.",
    college: "IT대학",
    department: "글로벌미디어학부",
    postYear: 2025,
    leaderName: "Bae Suzy",
    leaderMajor: "글로벌미디어학부",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "elec01",
    course: "Embedded Systems",
    title: "Embedded Edge AI Sensor Mesh",
    description:
      "Low-power RISC-V edge computing module for real-time vibration and thermal monitoring.",
    college: "IT대학",
    department: "전자정보공학부",
    postYear: 2024,
    leaderName: "Yoon Sanghyuk",
    leaderMajor: "전자정보공학부",
    memberCount: 3,
    maxMembers: 4,
  },
  {
    id: "stat01",
    course: "Financial Statistics",
    title: "Big Data Financial Risk Modeling",
    description:
      "Quantitative credit risk scoring and value-at-risk simulation using extreme value theory and PySpark.",
    college: "자연과학대학",
    department: "정보통계보험수리학과",
    postYear: 2024,
    leaderName: "Song Minho",
    leaderMajor: "정보통계보험수리학과",
    memberCount: 2,
    maxMembers: 3,
  },
  {
    id: "auto01",
    course: "Electric Mobility",
    title: "EV Battery State-of-Health AI",
    description:
      "Developing neural network models to predict lithium-ion battery degradation cycles under varying loads.",
    college: "공과대학",
    department: "전기공학부",
    postYear: 2026,
    leaderName: "Choi Hyunwoo",
    leaderMajor: "전기공학부",
    memberCount: 2,
    maxMembers: 5,
  },
];

export const mockApplicants: ApplicantApplication[] = [
  {
    id: "ap-1",
    groupId: "cs490",
    name: "Park Minji",
    department: "Software Department · 3rd Year",
    badge: "Honors Student",
    appliedAgo: "2 hours ago",
    skills: ["React", "TypeScript", "Tailwind", "Zustand"],
    scheduleMatch: 95,
    message:
      "I previously built the frontend for the SNU Hackathon winner project. I have 1.5 years experience with React/Next.js and can dedicate 12 hours weekly to this capstone.",
    githubUrl: "github.com/minji-p",
    portfolioUrl: "https://example.com/minji",
  },
  {
    id: "ap-2",
    groupId: "cs490",
    name: "Lee Joon",
    department: "Computer Science · 2nd Year",
    appliedAgo: "1 day ago",
    skills: ["Go", "PostgreSQL", "Docker"],
    scheduleMatch: 78,
    message: "I want to own the backend API and deployment for this project.",
    githubUrl: "github.com/leejoon",
  },
  {
    id: "ap-3",
    groupId: "cs490",
    name: "Nguyen Thu Ha",
    department: "AI Convergence · 3rd Year",
    badge: "Top Match",
    appliedAgo: "3 days ago",
    skills: ["Python", "LangChain", "Vector DB"],
    scheduleMatch: 88,
    message:
      "I built a RAG prototype over our department's course catalog and would love to own the recommendation pipeline.",
    githubUrl: "github.com/thuha-ng",
  },
  {
    id: "ap-4",
    groupId: "is334",
    name: "Kim Dohyun",
    department: "Computer Science · 4th Year",
    appliedAgo: "5 days ago",
    skills: ["Kafka", "Kubernetes"],
    message: "I can help with load testing and the event pipeline.",
  },
];

// Dữ liệu giả cho trang My Page.

export const mockUser: User = {
  name: "Hau Tran",
  studentId: "21520000",
  major: "Software Engineering",
  cohort: "SE K21",
  email: "21520000@gm.uit.edu.vn",
  phone: "0901 234 567",
  bio: "Frontend-leaning fullstack student. Looking for capstone teammates who like shipping early and iterating.",
  skills: ["TypeScript", "Next.js", "Tailwind CSS", "FastAPI", "PostgreSQL"],
};

export const mockStats: UserStats = {
  completionRate: 92,
};

export const mockGroups: MyGroup[] = [
  {
    id: "cs490",
    courseCode: "CS490",
    courseName: "Capstone",
    name: "AI Academic Planner",
    description:
      "A platform that matches students into study groups by free schedule and course, built with LLMs and Next.js.",
    status: "active",
    myRole: "Frontend Lead",
    isLeader: true,
    memberCount: 4,
    maxMembers: 5,
    members: [
      { id: "hau-tran", name: "Hau Tran" },
      { id: "minh-tran", name: "Minh Tran" },
      { id: "lan-vu", name: "Lan Vu" },
      { id: "quoc-bao", name: "Quoc Bao" },
    ],
  },
  {
    id: "is334",
    courseCode: "IS334",
    courseName: "System Design",
    name: "Microservices Simulator",
    description:
      "A high-load distributed system simulating real-time course registration for 20,000 students.",
    status: "recruiting",
    myRole: "Backend",
    isLeader: false,
    memberCount: 3,
    maxMembers: 4,
    members: [
      { id: "duy-anh", name: "Duy Anh" },
      { id: "hau-tran", name: "Hau Tran" },
      { id: "thu-trang", name: "Thu Trang" },
    ],
  },
  {
    id: "se214",
    courseCode: "SE214",
    courseName: "Software Arch",
    name: "Campus Event Ticketing WebApp",
    description:
      "Ticketing and QR check-in software for student clubs with a real-time dashboard.",
    status: "closed",
    myRole: "Frontend",
    isLeader: false,
    memberCount: 4,
    maxMembers: 4,
    members: [
      { id: "thao-nguyen", name: "Thao Nguyen" },
      { id: "khang-le", name: "Khang Le" },
      { id: "hau-tran", name: "Hau Tran" },
      { id: "son-tung", name: "Son Tung" },
    ],
  },
];

export const mockApplications: MyApplication[] = [
  {
    id: "app-1",
    groupId: "cs431",
    courseCode: "CS431",
    courseName: "Deep Learning",
    groupName: "Vietnamese OCR Benchmark",
    appliedRole: "ML Engineer",
    appliedAt: "2026-09-27",
    status: "pending",
    message: "I trained a small CRNN last semester and can own the data pipeline.",
  },
  {
    id: "app-2",
    groupId: "se347",
    courseCode: "SE347",
    courseName: "Web Technologies",
    groupName: "Dorm Marketplace",
    appliedRole: "Frontend (React)",
    appliedAt: "2026-09-24",
    status: "pending",
    message: "Happy to take the listing and chat screens.",
  },
  {
    id: "app-3",
    groupId: "is334",
    courseCode: "IS334",
    courseName: "System Design",
    groupName: "Microservices Simulator",
    appliedRole: "Backend",
    appliedAt: "2026-09-15",
    status: "accepted",
    message: "I have worked with Kafka and Docker Compose in a previous project.",
  },
  {
    id: "app-4",
    groupId: "nt118",
    courseCode: "NT118",
    courseName: "Mobile Development",
    groupName: "Bus Tracker UIT",
    appliedRole: "Mobile (Flutter)",
    appliedAt: "2026-09-10",
    status: "rejected",
    message: "I would like to learn Flutter through this project.",
  },
];

// Chi tiết mở rộng cho trang /groups/[id]
const detailedGroupPresets: Record<string, Partial<GroupDetailData>> = {
  wp1: {
    courseCode: "CSE408",
    semester: "2025 Spring (Semester 1)",
    longDescription:
      "We are building a comprehensive web platform for university student clubs, event ticketing, and seat reservations. The system focuses on high responsiveness, clean component architecture, and frictionless QR pass validation during on-campus festivals. We use Next.js App Router for frontend and Go / Fiber for high-performance microservices, along with PostgreSQL on Neon.",
    objectives: [
      "Targeting A+ grade with completed capstone demonstration before finals.",
      "Ship a production-grade MVP tested with at least 2 campus clubs.",
      "Bi-weekly sprint demos and clean Git Flow branching standards.",
    ],
    meetingSchedule: "Every Tuesday 19:00 (Discord) & Saturday 14:00 (IT Hall 402)",
    meetingFormat: "Hybrid",
    requiredSkills: ["Next.js", "TypeScript", "Tailwind CSS", "Go", "PostgreSQL", "Docker", "Git"],
    rolesQuota: [
      { role: "Frontend Developer", current: 2, max: 2, description: "Next.js 15, UI tokens, responsive design" },
      { role: "Backend Developer", current: 1, max: 1, description: "Go REST API, DB schema, JWT Auth" },
      { role: "Fullstack / DevOps", current: 0, max: 1, description: "Docker, CI/CD, Neon Postgres setup" },
    ],
    leaderEmail: "jinho.kim@soongsil.ac.kr",
    leaderStudentId: "20211842",
    membersList: [
      {
        id: "m-1",
        name: "Kim Jinho",
        role: "Leader & Frontend Lead",
        major: "소프트웨어학부 (3rd Year)",
        isLeader: true,
      },
      {
        id: "m-2",
        name: "Lee Minwoo",
        role: "Backend Developer",
        major: "컴퓨터학부 (3rd Year)",
      },
      {
        id: "m-3",
        name: "Park Seoyun",
        role: "UI/UX & Frontend",
        major: "글로벌미디어학부 (2nd Year)",
      },
    ],
  },
  nlp01: {
    courseCode: "AI502",
    semester: "2025 Spring (Semester 1)",
    longDescription:
      "Weekly reading group and practical implementations focusing on recent Large Language Model reasoning architectures (DeepSeek-R1, Qwen2.5, Llama 3) and advanced Retrieval-Augmented Generation (GraphRAG, Hybrid dense/sparse indexing). We build practical benchmarking scripts using PyTorch and Hugging Face Transformers.",
    objectives: [
      "Present 1 top-tier NLP conference paper (ACL/EMNLP) every two weeks.",
      "Build a working Korean/English multi-turn retrieval QA agent.",
      "Submit an experimental workshop paper or technical tech blog series.",
    ],
    meetingSchedule: "Thursdays 18:30 (Online Zoom / Google Meet)",
    meetingFormat: "Online",
    requiredSkills: ["Python", "PyTorch", "Hugging Face", "LangChain / LlamaIndex", "Vector DB"],
    rolesQuota: [
      { role: "Paper Presenter & Lead", current: 2, max: 2 },
      { role: "ML Engineer (Fine-tuning)", current: 2, max: 2 },
      { role: "Data Pipeline & Eval", current: 0, max: 1 },
    ],
    leaderEmail: "cw.lee@soongsil.ac.kr",
    leaderStudentId: "20220914",
    membersList: [
      { id: "m-10", name: "Lee Chaewon", role: "Leader & Research Lead", major: "AI융합학부", isLeader: true },
      { id: "m-11", name: "Kang Donghyuk", role: "RAG Pipeline", major: "AI융합학부" },
      { id: "m-12", name: "Song Jiwon", role: "Benchmark & Evaluation", major: "소프트웨어학부" },
      { id: "m-13", name: "Hwang Subin", role: "Model Fine-tuning", major: "컴퓨터학부" },
    ],
  },
  cap01: {
    courseCode: "CSE499",
    semester: "2025 Spring (Senior Capstone)",
    longDescription:
      "Developing a peer-to-peer campus ride sharing & commute matching app with real-time route optimization for Soongsil students commuting from Incheon, Suwon, and Gyeonggi. Integrates Kakao Map API, real-time WebSockets, and student identity verification via SSO.",
    objectives: [
      "Complete Senior Capstone Project with potential patent / conference demo.",
      "Deploy cross-platform mobile app on TestFlight & Google Play Beta.",
      "Achieve sub-200ms real-time chat & location ping latency.",
    ],
    meetingSchedule: "Mondays & Fridays 15:00 (Student Union Hall B1)",
    meetingFormat: "Hybrid",
    requiredSkills: ["Flutter / React Native", "Spring Boot", "Redis", "WebSocket", "Figma"],
    rolesQuota: [
      { role: "Team Lead & Architecture", current: 1, max: 1 },
      { role: "Mobile Developer", current: 1, max: 2 },
      { role: "Backend Developer", current: 0, max: 1 },
    ],
    leaderEmail: "sm.park@soongsil.ac.kr",
    leaderStudentId: "20201452",
    membersList: [
      { id: "m-21", name: "Park Sungmin", role: "Team Lead & Mobile", major: "소프트웨어학부", isLeader: true },
      { id: "m-22", name: "Yoon Jinwoo", role: "Mobile Developer", major: "소프트웨어학부" },
    ],
  },
};

export function getGroupDetail(id: string): GroupDetailData | null {
  const baseCard = mockGroupCards.find((g) => g.id === id);
  if (!baseCard) return null;

  const preset = detailedGroupPresets[id] || {};

  // Default values generated if not explicitly present in preset
  const defaultObjectives = [
    "Targeting an A+ grade in this semester's group evaluation.",
    "Active participation in weekly sync-ups and code reviews.",
    "Collaborative and supportive team dynamic with transparent progress tracking.",
  ];

  const defaultRolesQuota: GroupRoleQuota[] = [
    {
      role: "Core Developer",
      current: Math.min(baseCard.memberCount, 2),
      max: 2,
      description: "Feature development & code delivery",
    },
    {
      role: "Collaborator / Researcher",
      current: Math.max(0, baseCard.memberCount - 2),
      max: Math.max(1, baseCard.maxMembers - 2),
      description: "Testing, documentation & implementation",
    },
  ];

  const defaultMembers: GroupMemberDetail[] = [
    {
      id: `m-leader-${baseCard.id}`,
      name: baseCard.leaderName,
      role: "Team Leader",
      major: baseCard.leaderMajor,
      isLeader: true,
    },
  ];

  // Fill in other mock members up to memberCount
  for (let i = 2; i <= baseCard.memberCount; i++) {
    defaultMembers.push({
      id: `m-${baseCard.id}-${i}`,
      name: `Member ${i}`,
      role: i === 2 ? "Frontend / UI" : "Backend / Logic",
      major: baseCard.department,
      isLeader: false,
    });
  }

  return {
    ...baseCard,
    courseCode: preset.courseCode || `${baseCard.college.slice(0, 2).toUpperCase()}${baseCard.postYear % 100}`,
    semester: preset.semester || `${baseCard.postYear} Spring Semester`,
    longDescription: preset.longDescription || `${baseCard.description} We are seeking active and motivated students to join our team for this course. Every member will take ownership of specific modules with mentorship from the leader.`,
    objectives: preset.objectives || defaultObjectives,
    meetingSchedule: preset.meetingSchedule || "Weekly on Wednesday 18:00 (Hybrid / Discord)",
    meetingFormat: preset.meetingFormat || "Hybrid",
    requiredSkills: preset.requiredSkills || ["Git / GitHub", "Team Communication", baseCard.course],
    rolesQuota: preset.rolesQuota || defaultRolesQuota,
    leaderEmail: preset.leaderEmail || `${baseCard.leaderName.toLowerCase().replace(/\s+/g, ".")}@soongsil.ac.kr`,
    leaderStudentId: preset.leaderStudentId || `202${baseCard.postYear % 10}00${(baseCard.id.charCodeAt(0) % 90) + 10}`,
    membersList: preset.membersList || defaultMembers,
    createdAt: preset.createdAt || `${baseCard.postYear}-03-01`,
  };
}
