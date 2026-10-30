import { ApiError } from "@/lib/api";
import type {
  ApplicationStatusCode,
  GroupApplication,
  MyGroupSummary,
  UserSummary,
} from "@/lib/types";

// ==========================================================================
// DỮ LIỆU GIẢ TẠM THỜI (TEMPORARY MOCK) cho groupService / applicationService.
// TODO replace with real API when backend is ready: khi Backend có các endpoint
// GET /api/users/me/groups, GET /api/groups/{id}/applications,
// PUT /api/applications/{id}/accept | /reject → đặt USE_MOCK = false rồi xóa file này.
// Chỉ services/ được import file này. Pages & components KHÔNG BAO GIỜ import trực tiếp.
// ==========================================================================

// TODO replace with real API when backend is ready.
// Khi đặt USE_MOCK = false, phải xem lại cả fallback token giả trong
// src/app/api/auth/usaint/route.ts (khi Spring Boot không phản hồi): token đó sẽ bị Backend từ chối.
export const USE_MOCK = true;

// Độ trễ giả lập mạng để giao diện hiển thị trạng thái loading như khi gọi API thật.
const MOCK_DELAY_MS = 500;
export const mockDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// Người dùng giả "tôi" chỉ dùng làm leader/member trong dữ liệu mock.
// Hồ sơ hiển thị trên My Page luôn lấy từ authStore, không lấy từ đây.
const ME: UserSummary = {
  id: 1,
  studentId: "20211234",
  name: "홍길동",
  department: "컴퓨터학부",
  faculty: "IT대학",
  academicYear: "3",
};

const KIM: UserSummary = {
  id: 2,
  studentId: "20201111",
  name: "Kim Seojun",
  department: "소프트웨어학부",
  faculty: "IT대학",
  academicYear: "4",
};

const mockMyGroups: MyGroupSummary[] = [
  {
    id: 101,
    title: "AI Academic Planner",
    description:
      "A platform that matches students into study groups by free schedule and course, built with LLMs and Next.js.",
    courseCode: "CS490",
    courseName: "Capstone",
    college: "IT대학",
    department: "컴퓨터학부",
    status: "RECRUITING",
    maxMembers: 5,
    memberCount: 3,
    myRole: "LEADER",
    leader: ME,
    members: [
      { userId: 1, name: "홍길동", role: "LEADER", joinedAt: hoursAgo(24 * 30) },
      { userId: 3, name: "Lee Minho", role: "MEMBER", joinedAt: hoursAgo(24 * 20) },
      { userId: 4, name: "Nguyen Lan", role: "MEMBER", joinedAt: hoursAgo(24 * 12) },
    ],
    pendingApplicationCount: 2,
    createdAt: hoursAgo(24 * 30),
  },
  {
    id: 102,
    title: "Algorithm Study (Coding Test)",
    description: "Weekly problem solving for coding tests, two sessions per week.",
    courseCode: null,
    courseName: null,
    college: "IT대학",
    department: "컴퓨터학부",
    status: "COMPLETED",
    maxMembers: 3,
    memberCount: 3,
    myRole: "LEADER",
    leader: ME,
    members: [
      { userId: 1, name: "홍길동", role: "LEADER", joinedAt: hoursAgo(24 * 60) },
      { userId: 5, name: "Choi Yuna", role: "MEMBER", joinedAt: hoursAgo(24 * 50) },
      { userId: 6, name: "Park Jisoo", role: "MEMBER", joinedAt: hoursAgo(24 * 45) },
    ],
    pendingApplicationCount: 0,
    createdAt: hoursAgo(24 * 60),
  },
  {
    id: 201,
    title: "Microservices Simulator",
    description:
      "A high-load distributed system simulating real-time course registration for 20,000 students.",
    courseCode: "IS334",
    courseName: "System Design",
    college: "IT대학",
    department: "소프트웨어학부",
    status: "RECRUITING",
    maxMembers: 4,
    memberCount: 3,
    myRole: "MEMBER",
    leader: KIM,
    members: [
      { userId: 2, name: "Kim Seojun", role: "LEADER", joinedAt: hoursAgo(24 * 40) },
      { userId: 1, name: "홍길동", role: "MEMBER", joinedAt: hoursAgo(24 * 35) },
      { userId: 7, name: "Tran Duc", role: "MEMBER", joinedAt: hoursAgo(24 * 30) },
    ],
    pendingApplicationCount: 0,
    createdAt: hoursAgo(24 * 40),
  },
];

const mockApplications: GroupApplication[] = [
  {
    id: 9001,
    groupId: 101,
    applicant: {
      id: 8,
      studentId: "20221357",
      name: "Park Minji",
      department: "소프트웨어학부",
      faculty: "IT대학",
      academicYear: "3",
      email: "20221357@soongsil.ac.kr",
    },
    statement:
      "I built the frontend for a hackathon project last semester and have 1.5 years of React/Next.js experience. I can dedicate 12 hours weekly.",
    status: "PENDING",
    createdAt: hoursAgo(2),
  },
  {
    id: 9002,
    groupId: 101,
    applicant: {
      id: 9,
      studentId: "20232468",
      name: "Lee Joon",
      department: "컴퓨터학부",
      faculty: "IT대학",
      academicYear: "2",
      email: null,
    },
    statement: "I want to own the backend API and deployment for this project.",
    status: "PENDING",
    createdAt: hoursAgo(26),
  },
  {
    id: 9003,
    groupId: 101,
    applicant: {
      id: 4,
      studentId: "20211999",
      name: "Nguyen Lan",
      department: "글로벌미디어학부",
      faculty: "IT대학",
      academicYear: "3",
      email: "20211999@soongsil.ac.kr",
    },
    statement: "Happy to take the UI design and user testing.",
    status: "ACCEPTED",
    createdAt: hoursAgo(24 * 13),
  },
];

const clone = <T>(value: T): T => structuredClone(value);

export const mockGetMyGroups = (): MyGroupSummary[] => clone(mockMyGroups);

// Giống Backend: chỉ Leader của nhóm mới xem được danh sách đơn (403 nếu không phải).
export const mockGetGroupApplications = (groupId: number): GroupApplication[] => {
  const group = mockMyGroups.find((g) => g.id === groupId);
  if (!group) throw new ApiError("NOT_FOUND", 404);
  if (group.myRole !== "LEADER") throw new ApiError("FORBIDDEN", 403);
  return clone(mockApplications.filter((a) => a.groupId === groupId));
};

// Giống nghiệp vụ Backend (architecture.md §7, Giai đoạn 4):
// Accept → thêm vào thành viên, nhóm đủ người thì chuyển COMPLETED. Reject → chỉ đổi trạng thái.
export const mockUpdateApplicationStatus = (
  applicationId: number,
  status: Exclude<ApplicationStatusCode, "PENDING">,
): GroupApplication => {
  const application = mockApplications.find((a) => a.id === applicationId);
  if (!application) throw new ApiError("NOT_FOUND", 404);
  const group = mockMyGroups.find((g) => g.id === application.groupId);
  if (!group || group.myRole !== "LEADER") throw new ApiError("FORBIDDEN", 403);
  if (application.status !== "PENDING") throw new ApiError("SERVER_ERROR", 400);

  if (status === "ACCEPTED") {
    if (group.memberCount >= group.maxMembers) throw new ApiError("SERVER_ERROR", 400);
    group.members.push({
      userId: application.applicant.id,
      name: application.applicant.name,
      role: "MEMBER",
      joinedAt: new Date().toISOString(),
    });
    group.memberCount += 1;
    if (group.memberCount >= group.maxMembers) group.status = "COMPLETED";
  }

  application.status = status;
  group.pendingApplicationCount = Math.max(0, group.pendingApplicationCount - 1);
  return clone(application);
};
