import type {
  User,
  UserStats,
  MyGroup,
  MyApplication,
} from "@/lib/types";
import type { GroupCardData } from "@/components/group/GroupCard";
import type { ApplicantApplication } from "@/components/application/ApplicationCard";

// Dữ liệu giả cho trang Groups (GroupCard) và Manage (ApplicationCard).
// Type nằm cạnh component; khi có API thật chỉ cần thay các biến mock bên dưới.

export const mockGroupCards: GroupCardData[] = [
  {
    id: "wp1",
    course: "Web Programming",
    title: "Web Programming Project",
    description:
      "Build a campus event ticketing and student club portal with Next.js and Go.",
    tags: ["NextJS", "TypeScript", "Tailwind", "Go"],
    leaderName: "Kim Jinho",
    leaderMajor: "Software",
    memberCount: 3,
    maxMembers: 4,
  },
  {
    id: "is334",
    course: "System Design",
    title: "Microservices Simulator",
    description:
      "A high-load distributed system simulating real-time course registration for 20,000 students.",
    tags: ["Kafka", "Docker", "Go"],
    leaderName: "Duy Anh",
    leaderMajor: "Information Systems",
    memberCount: 2,
    maxMembers: 4,
  },
  {
    id: "se214",
    course: "Software Arch",
    title: "Campus Event Ticketing WebApp",
    description:
      "Ticketing and QR check-in software for student clubs with a real-time dashboard.",
    tags: ["React", "FastAPI", "PostgreSQL"],
    leaderName: "Thao Nguyen",
    leaderMajor: "Software",
    memberCount: 4,
    maxMembers: 4,
  },
];

export const mockApplicants: ApplicantApplication[] = [
  {
    id: "ap-1",
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
    name: "Lee Joon",
    department: "Computer Science · 2nd Year",
    appliedAgo: "1 day ago",
    skills: ["Go", "PostgreSQL", "Docker"],
    scheduleMatch: 78,
    message: "I want to own the backend API and deployment for this project.",
    githubUrl: "github.com/leejoon",
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
