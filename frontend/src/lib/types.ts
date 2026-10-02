// Type dùng chung cho My Page. Khi có API thật, giữ nguyên các type này
// và thay các biến mock... trong mockData.ts bằng dữ liệu fetch() về.

export interface User {
  // name, studentId, major, cohort, email lấy từ tài khoản trường (chỉ đọc).
  // email, phone, bio, skills, avatarUrl do sinh viên tự chỉnh sửa.
  name: string;
  studentId: string;
  major: string;
  cohort: string;
  email: string;
  phone?: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
}

// Các số còn lại (active groups, applications sent...) được tính từ danh sách
// groups/applications ở trang My Page, nên không lưu riêng ở đây.
export interface UserStats {
  completionRate: number;
}

export interface GroupMember {
  id: string;
  name: string;
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
  members: GroupMember[];
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
