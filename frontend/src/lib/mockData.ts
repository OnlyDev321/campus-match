// Dữ liệu giả cho My Page. Khi có API thật, giữ nguyên các type bên dưới
// và thay các biến mock... bằng dữ liệu fetch() về.

export interface User {
  name: string;
  studentId: string;
  major: string;
  cohort: string;
  email: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
}

export interface UserStats {
  activeGroups: number;
  groupsLed: number;
  groupsLedName: string;
  applicationsSent: number;
  applicationsInReview: number;
  completionRate: number;
}

export type GroupStatus = "active" | "recruiting" | "closed";

export interface MyGroup {
  id: string;
  courseCode: string;
  courseName: string;
  name: string;
  description: string;
  status: GroupStatus;
  myRole: string;
  isLeader: boolean;
  memberCount: number;
  maxMembers: number;
  members: string[];
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface MyApplication {
  id: string;
  groupId: string;
  courseCode: string;
  courseName: string;
  groupName: string;
  appliedRole: string;
  appliedAt: string;
  status: ApplicationStatus;
  message: string;
}

export const mockUser: User = {
  name: "Hau Tran",
  studentId: "21520000",
  major: "Software Engineering",
  cohort: "SE K21",
  email: "21520000@gm.uit.edu.vn",
  bio: "Frontend-leaning fullstack student. Looking for capstone teammates who like shipping early and iterating.",
  skills: ["TypeScript", "Next.js", "Tailwind CSS", "FastAPI", "PostgreSQL"],
};

export const mockStats: UserStats = {
  activeGroups: 3,
  groupsLed: 1,
  groupsLedName: "AI Academic Planner",
  applicationsSent: 4,
  applicationsInReview: 2,
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
    members: ["Hau Tran", "Minh Tran", "Lan Vu", "Quoc Bao"],
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
    members: ["Duy Anh", "Hau Tran", "Thu Trang"],
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
    members: ["Thao Nguyen", "Khang Le", "Hau Tran", "Son Tung"],
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
