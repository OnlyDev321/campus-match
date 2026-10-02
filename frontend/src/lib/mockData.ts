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
