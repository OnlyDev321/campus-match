import React from "react";

/* ==========================================================================
   CAMPUSMATCH — CENTRAL TYPE DEFINITIONS (lib/types.ts)
   Tập trung toàn bộ interface và type của ứng dụng tại một file duy nhất
   giúp dễ dàng quản lý, tái sử dụng và đồng bộ dữ liệu với Backend Spring Boot.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. USER & AUTHENTICATION TYPES (Người dùng & Xác thực u-SAINT SSO)
   -------------------------------------------------------------------------- */

/**
 * Hồ sơ sinh viên đầy đủ (Dùng cho trang My Page & Cập nhật thông tin cá nhân).
 * - Các trường studentId, major, cohort được đồng bộ tự động từ tài khoản trường u-SAINT.
 * - Các trường email, phone, bio, skills, avatarUrl do sinh viên chủ động tùy chỉnh.
 */
export interface User {
  name: string;             // Họ và tên sinh viên (VD: "Hau Tran")
  studentId: string;        // Mã số sinh viên (VD: "20211234")
  major: string;            // Chuyên ngành / Khoa (VD: "소프트웨어학부")
  cohort: string;           // Khóa học / Niên khóa (VD: "K21")
  email: string;            // Email liên lạc (ưu tiên email trường @soongsil.ac.kr)
  phone?: string;           // Số điện thoại liên hệ (tùy chọn)
  bio: string;              // Giới thiệu bản thân ngắn gọn
  skills: string[];         // Danh sách kỹ năng lập trình / thế mạnh
  avatarUrl?: string;       // Đường dẫn ảnh đại diện (URL hoặc base64 preview)
}

/**
 * Thông tin sinh viên nhận về từ hệ thống SSO u-SAINT của trường Soongsil.
 * Được lưu trong AuthContext & localStorage sau khi đăng nhập thành công.
 */
export interface StudentProfile {
  studentId: string;        // Mã số sinh viên u-SAINT
  name: string;             // Họ tên chuẩn theo hồ sơ trường
  department: string;       // Khoa / Ngành đào tạo (학부/학과, VD: "소프트웨어학부")
  faculty: string;          // Trường / Viện chủ quản (단과대학, VD: "IT대학")
  email: string;            // Email sinh viên Soongsil
  academicYear: string;     // Năm học hiện tại (1, 2, 3, 4)
}

/**
 * Thống kê hoạt động của sinh viên (hiển thị trên My Page).
 */
export interface UserStats {
  completionRate: number;   // Tỷ lệ hoàn thành các nhóm đồ án tham gia (%)
}

/**
 * Context quản lý trạng thái phiên đăng nhập toàn ứng dụng (AuthContext).
 */
export interface AuthContextType {
  user: StudentProfile | null;                                    // Thông tin sinh viên đang đăng nhập
  token: string | null;                                           // JWT Bearer Token gửi kèm Header API
  isLoggedIn: boolean;                                            // Trạng thái đã đăng nhập hay chưa
  isLoading: boolean;                                             // Trạng thái đang khôi phục phiên từ storage
  isLoginModalOpen: boolean;                                      // Trạng thái mở modal đăng nhập SSO
  openLoginModal: (redirectTo?: string) => void;                  // Mở modal đăng nhập (hỗ trợ chuyển hướng tiếp)
  closeLoginModal: () => void;                                    // Đóng modal đăng nhập
  login: (studentId: string, password: string) => Promise<{       // Hàm xử lý đăng nhập qua SSO
    success: boolean;
    error?: string;
  }>;
  logout: () => void;                                             // Đăng xuất và xóa session
}

/**
 * Props cho component ProfileCard tại trang My Page (Chế độ chỉ đọc từ u-SAINT SSO).
 */
export interface ProfileCardProps {
  user: User;                                                     // Dữ liệu người dùng hiển thị
}


/* --------------------------------------------------------------------------
   2. GROUP CORE & LISTING TYPES (Nhóm học tập & Danh sách nhóm)
   -------------------------------------------------------------------------- */

/**
 * Trạng thái tuyển dụng của một nhóm học tập:
 * - active: Nhóm đang hoạt động bình thường
 * - recruiting: Nhóm đang mở đơn ứng tuyển tìm thành viên
 * - closed: Nhóm đã đủ người hoặc đã đóng đợt tuyển
 */
export type GroupStatus = "active" | "recruiting" | "closed";

/**
 * Thông tin thành viên cơ bản trong nhóm (danh sách tóm tắt).
 */
export interface GroupMember {
  id: string;               // ID định danh thành viên
  name: string;             // Tên thành viên
}

/**
 * Dữ liệu nhóm của tôi (Hiển thị trong tab "My Groups" tại trang My Page).
 */
export interface MyGroup {
  id: string;               // ID nhóm
  courseCode: string;       // Mã học phần (VD: "CSE408")
  courseName: string;       // Tên môn học (VD: "Web Programming")
  name: string;             // Tiêu đề / Tên đề tài của nhóm
  description: string;      // Mô tả ngắn gọn về nhóm
  status: GroupStatus;      // Trạng thái nhóm (active/recruiting/closed)
  myRole: string;           // Vai trò của tôi trong nhóm (Frontend, Backend...)
  isLeader: boolean;        // Tôi có phải là nhóm trưởng hay không
  memberCount: number;      // Số thành viên hiện có
  maxMembers: number;       // Số thành viên tối đa
  members: GroupMember[];   // Danh sách tên các thành viên
}

/**
 * Dữ liệu hiển thị cho một thẻ nhóm trên trang danh sách `/groups` (GroupCard).
 */
export interface GroupCardData {
  id: string;               // ID nhóm (dùng cho routing `/groups/[id]`)
  course: string;           // Tên học phần (VD: "Web Programming")
  title: string;            // Tiêu đề bài đăng tuyển nhóm
  description: string;      // Mô tả đề tài nhóm
  college: string;          // Trường / Viện (단과대, VD: "IT대학")
  department: string;       // Khoa / Ngành (학부/학과, VD: "소프트웨어학부")
  postYear: number;         // Năm đăng bài (VD: 2024, 2025)
  leaderName: string;       // Tên trưởng nhóm
  leaderAvatarUrl?: string; // Ảnh đại diện của trưởng nhóm
  leaderMajor: string;      // Ngành học của trưởng nhóm
  memberCount: number;      // Số thành viên hiện tại
  maxMembers: number;       // Sĩ số tối đa của nhóm
}

/**
 * Props cho component GroupCard.
 */
export interface GroupCardProps {
  group: GroupCardData;             // Thông tin nhóm hiển thị
  onJoin?: (id: string) => void;    // Sự kiện khi bấm nút "Join" (mở Quick Apply Modal)
}


/* --------------------------------------------------------------------------
   3. GROUP DETAIL & PAGE PROPS (Trang chi tiết nhóm `/groups/[id]`)
   -------------------------------------------------------------------------- */

/**
 * Props cho dynamic route `frontend/src/app/groups/[id]/page.tsx` (Next.js 15+).
 */
export interface GroupDetailPageProps {
  params: Promise<{
    id: string;             // ID nhóm truyền từ URL dynamic route
  }>;
}

/**
 * Thông tin chi tiết của một thành viên trong trang chi tiết nhóm.
 */
export interface GroupMemberDetail {
  id: string;               // ID thành viên
  name: string;             // Tên thành viên
  role: string;             // Vai trò đảm nhiệm (VD: "Leader & Frontend Lead")
  major: string;            // Ngành học & năm học
  avatarUrl?: string;       // Ảnh đại diện
  isLeader?: boolean;       // Có phải là trưởng nhóm không
}

/**
 * Chỉ tiêu và hạn mức phân bổ theo vai trò trong nhóm (Role Quota).
 */
export interface GroupRoleQuota {
  role: string;             // Tên vị trí (VD: "Frontend Developer")
  current: number;          // Số lượng hiện có
  max: number;              // Số lượng cần tuyển tối đa
  description?: string;     // Yêu cầu chi tiết cho vị trí đó
}

/**
 * Dữ liệu đầy đủ hiển thị trên trang chi tiết nhóm `/groups/[id]`.
 * Kế thừa các trường cơ bản từ GroupCardData và mở rộng thêm mô tả dài, mục tiêu, thành viên.
 */
export interface GroupDetailData extends GroupCardData {
  courseCode?: string;                  // Mã môn học chi tiết (VD: "CSE408")
  semester?: string;                    // Học kỳ (VD: "2025 Spring Semester")
  longDescription?: string;             // Bài giới thiệu đề tài chi tiết
  objectives?: string[];                // Danh sách mục tiêu & cam kết của nhóm
  meetingSchedule?: string;             // Lịch sinh hoạt / họp nhóm hàng tuần
  meetingFormat?: "Online" | "Offline" | "Hybrid"; // Hình thức họp
  requiredSkills?: string[];            // Danh sách kỹ năng / công nghệ yêu cầu
  rolesQuota?: GroupRoleQuota[];        // Phân bổ chỉ tiêu các vị trí cần tuyển
  leaderEmail?: string;                 // Email liên hệ của trưởng nhóm
  leaderStudentId?: string;             // MSSV của trưởng nhóm
  membersList?: GroupMemberDetail[];    // Danh sách thành viên chính thức
  createdAt?: string;                   // Ngày tạo nhóm
}


/* --------------------------------------------------------------------------
   4. APPLICATION & MODAL TYPES (Đơn ứng tuyển & Modal nộp đơn)
   -------------------------------------------------------------------------- */

/**
 * Trạng thái của đơn xin gia nhập nhóm:
 * - pending: Chờ nhóm trưởng xem xét duyệt
 * - accepted: Đã được nhóm trưởng chấp thuận (gia nhập nhóm)
 * - rejected: Đã bị từ chối
 */
export type ApplicationStatus = "pending" | "accepted" | "rejected";

/**
 * Đơn ứng tuyển của bản thân (hiển thị trong tab "My Applications" tại My Page).
 */
export interface MyApplication {
  id: string;                   // ID đơn ứng tuyển
  groupId: string;              // ID nhóm ứng tuyển
  courseCode: string;           // Mã môn học
  courseName: string;           // Tên môn học
  groupName: string;            // Tên nhóm ứng tuyển
  appliedRole: string;          // Vị trí đã ứng tuyển
  appliedAt: string;            // Ngày nộp đơn (YYYY-MM-DD)
  status: ApplicationStatus;    // Trạng thái đơn (pending/accepted/rejected)
  message: string;              // Lời nhắn / Nguyện vọng gửi nhóm trưởng
}

/**
 * Thông tin ứng viên gửi tới nhóm (Hiển thị cho Leader duyệt tại trang `/manage`).
 */
export interface ApplicantApplication {
  id: string;                   // ID đơn
  name: string;                 // Tên ứng viên
  avatarUrl?: string;           // Ảnh đại diện
  department: string;           // Khoa / Ngành của ứng viên
  badge?: string;               // Huy hiệu nổi bật (VD: "Top Match", "Fast Learner")
  appliedAgo: string;           // Thời gian nộp (VD: "2 hours ago")
  skills: string[];             // Danh sách kỹ năng ứng viên có
  scheduleMatch?: number;       // Độ trùng khớp lịch rảnh (%)
  message: string;              // Lời giới thiệu & lý do ứng tuyển
  githubUrl?: string;           // Đường dẫn GitHub
  portfolioUrl?: string;        // Đường dẫn Portfolio
}

/**
 * Props cho component ApplicationCard (dành cho Leader duyệt đơn).
 */
export interface ApplicationCardProps {
  application: ApplicantApplication;            // Dữ liệu đơn ứng tuyển
  onAccept?: (id: string) => void;              // Callback khi duyệt chấp thuận
  onReject?: (id: string) => void;              // Callback khi từ chối
}

/**
 * Props cho component cửa sổ ứng tuyển nhanh (ApplyModal).
 */
export interface ApplyModalProps {
  isOpen: boolean;                              // Trạng thái hiển thị modal
  onClose: () => void;                          // Hàm đóng modal
  group: (GroupCardData & {                     // Dữ liệu nhóm đang được ứng tuyển
    rolesQuota?: GroupRoleQuota[];
  }) | null;
  onSuccess?: (groupId: string) => void;        // Callback kích hoạt sau khi nộp đơn thành công
}


/* --------------------------------------------------------------------------
   5. NAVIGATION & COMMON UI TYPES (Thanh điều hướng & Thành phần giao diện chung)
   -------------------------------------------------------------------------- */

/**
 * Cấu trúc mục điều hướng trong thanh Sidebar (`src/components/layout/Sidebar.tsx`).
 */
export interface NavItem {
  label: string;                                // Tiêu đề mục điều hướng
  shortLabel?: string;                          // Tiêu đề rút gọn khi thu hẹp thanh bên
  href: string;                                 // Đường dẫn chuyển trang
  icon: React.ComponentType<{ className?: string }>; // Component biểu tượng Lucide
}

/**
 * Khóa chuyển tab trên trang My Page (`groups` hoặc `applications`).
 */
export type MyPageTabKey = "groups" | "applications";

/**
 * Props cho nút dịch thuật đa ngữ TranslateButton.
 */
export interface TranslateButtonProps {
  originalText: string;                                 // Đoạn văn bản gốc cần dịch
  onTranslated: (translated: string | null) => void;    // Callback nhận về bản dịch (hoặc null khi hoàn tác)
  className?: string;                                   // Class CSS tùy chỉnh
}

/**
 * Các ngôn ngữ giao diện được hỗ trợ trong hệ thống:
 * - en: English (Tiếng Anh - Mặc định)
 * - ko: 한국어 (Tiếng Hàn)
 * - vi: Tiếng Việt
 */
export type SupportedLanguage = "en" | "ko" | "vi";

