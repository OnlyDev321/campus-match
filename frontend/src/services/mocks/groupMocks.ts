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
// PUT /api/applications/{id}/accept | /reject → đặt NEXT_PUBLIC_USE_MOCK_API=false rồi xóa file này.
// Chỉ services/ được import file này. Pages & components KHÔNG BAO GIỜ import trực tiếp.
// ==========================================================================

// TODO replace with real API when backend is ready.
// BFF yêu cầu JWT thật khi NEXT_PUBLIC_USE_MOCK_API=false.
export { USE_MOCK_API as USE_MOCK } from "@/lib/config";

// Độ trễ giả lập mạng để giao diện hiển thị trạng thái loading như khi gọi API thật.
const MOCK_DELAY_MS = 500;
export const mockDelay = () =>
  new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// Người dùng giả "tôi" chỉ dùng làm leader/member trong dữ liệu mock.
// Hồ sơ hiển thị trên My Page luôn lấy từ authStore, không lấy từ đây.
const ME: UserSummary = {
  id: 1, studentId: "20211234", name: "Kim Jinho", department: "Software Dept",
  faculty: "IT College", academicYear: "3", avatarUrl: "/demo/manage/jinho.jpg",
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
    title: "Web Programming Project",
    description: "High-throughput interactive campus marketplace web application. Seeking a specialized frontend developer proficient in React and reactive state architectures.",
    courseCode: "CS301", courseName: "Capstone Studio A", college: "IT College", department: "Software Dept",
    skills: ["React", "TypeScript", "Go"],
    recruitmentEndsAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    status: "RECRUITING", maxMembers: 4, memberCount: 3, myRole: "LEADER", leader: ME,
    members: [
      { userId: 1, name: "Kim Jinho", role: "LEADER", joinedAt: hoursAgo(24 * 30), email: "jinho.k@ssu.ac.kr", department: "Software Dept", projectRole: "Team Leader / PM", avatarUrl: "/demo/manage/jinho.jpg" },
      { userId: 3, name: "Kang Minseo", role: "MEMBER", joinedAt: hoursAgo(24 * 29), email: "minseo.kang@ssu.ac.kr", department: "Computer Science", projectRole: "Backend Developer", avatarUrl: "/demo/manage/minseo.jpg" },
      { userId: 4, name: "Song Yuna", role: "MEMBER", joinedAt: hoursAgo(24 * 28), email: "yuna.song@ssu.ac.kr", department: "Visual Design", projectRole: "UI/UX Designer", avatarUrl: "/demo/manage/yuna.jpg" },
    ],
    pendingApplicationCount: 3,
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
    id: 9001, groupId: 101,
    applicant: { id: 8, studentId: "20221357", name: "Park Minji", department: "Software Department", faculty: "IT College", academicYear: "3", email: "20221357@soongsil.ac.kr", avatarUrl: "/demo/manage/minji.jpg" },
    skills: ["React", "TypeScript", "Tailwind", "Zustand"], isHonorsStudent: true, scheduleMatch: 95,
    githubUrl: "https://github.com/minji-p", portfolioUrl: "https://example.com/minji",
    statement: "I previously built the frontend for the SNU Hackathon winner project. I have 1.5 years experience with React/Next.js and can dedicate 12 hours weekly to this capstone.",
    status: "PENDING", createdAt: hoursAgo(2),
  },
  {
    id: 9002, groupId: 101,
    applicant: { id: 9, studentId: "20212468", name: "Choi Jihoon", department: "Information Systems", faculty: "IT College", academicYear: "4", email: null, avatarUrl: "/demo/manage/jihoon.jpg" },
    skills: ["React", "Next.js", "Redux", "Storybook"], githubUrl: "https://github.com/jihoon-choi",
    statement: "Looking to focus strictly on frontend component architecture and testing. Available for all offline meetups.",
    status: "PENDING", createdAt: hoursAgo(26),
  },
  {
    id: 9003, groupId: 101,
    applicant: { id: 10, studentId: "20232469", name: "Lee Daewon", department: "Computer Science", faculty: "IT College", academicYear: "2", email: null, avatarUrl: "/demo/manage/daewon.jpg" },
    skills: ["JavaScript", "HTML/CSS", "Learning React"],
    statement: "Eager to learn React in a team environment. Hard worker and fast learner!",
    status: "PENDING", createdAt: hoursAgo(48),
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
  if (application.status !== "PENDING") throw new ApiError("CONFLICT", 409);

  if (status === "ACCEPTED") {
    if (group.status !== "RECRUITING" || group.memberCount >= group.maxMembers) throw new ApiError("CONFLICT", 409);
    group.members.push({
      userId: application.applicant.id,
      name: application.applicant.name,
      role: "MEMBER",
      department: application.applicant.department ?? undefined,
      email: application.applicant.email ?? undefined,
      avatarUrl: application.applicant.avatarUrl,
      joinedAt: new Date().toISOString(),
    });
    group.memberCount += 1;
    if (group.memberCount >= group.maxMembers) group.status = "COMPLETED";
  }

  application.status = status;
  group.pendingApplicationCount = Math.max(0, group.pendingApplicationCount - 1);
  return clone(application);
};

/** Cập nhật mock qua service; giữ quyền Leader giống API dự kiến. */
export const mockManageGroup = (groupId: number, change: (group: MyGroupSummary) => void): MyGroupSummary => {
  const group = mockMyGroups.find((g) => g.id === groupId);
  if (!group) throw new ApiError("NOT_FOUND", 404);
  if (group.myRole !== "LEADER") throw new ApiError("FORBIDDEN", 403);
  change(group);
  return clone(group);
};
