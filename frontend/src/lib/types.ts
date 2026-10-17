import React from "react";
import type { TranslationDict } from "@/i18n/dictionaries/en";

/* ==========================================================================
   CAMPUSMATCH — CENTRAL TYPE DEFINITIONS (lib/types.ts)
   Tập trung toàn bộ interface và type của ứng dụng tại một file duy nhất
   giúp dễ dàng quản lý, tái sử dụng, đồng bộ dữ liệu với Backend Spring Boot
   và hỗ trợ mở rộng các module frontend (Stores, Services, Components).
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. USER & PROFILE (Người dùng & Hồ sơ sinh viên)
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
 * Được lưu trong Zustand Store (authStore) & localStorage sau khi đăng nhập thành công.
 */
export interface StudentProfile {
  studentId: string;        // Mã số sinh viên u-SAINT
  name: string;             // Họ tên chuẩn theo hồ sơ trường
  department: string;       // Khoa / Ngành đào tạo (학부/학과, VD: "소프트웨어학부")
  faculty: string;          // Trường / Viện chủ quản (단과대학, VD: "IT대학")
  email: string;            // Email sinh viên Soongsil
  academicYear: string;     // Năm học hiện tại (1, 2, 3, 4)
  phone?: string;           // Số điện thoại liên lạc
  status?: string;          // Trạng thái học vụ (재학, 휴학, 졸업...)
  semester?: string;        // Học kỳ hiện tại (1학기, 2학기...)
  avatarUrl?: string;       // Ảnh đại diện / ảnh thẻ sinh viên (Base64 data URL)
}

/**
 * Thống kê hoạt động của sinh viên (hiển thị trên My Page).
 */
export interface UserStats {
  completionRate: number;   // Tỷ lệ hoàn thành các nhóm đồ án tham gia (%)
}

/**
 * Props cho component ProfileCard tại trang My Page (Chế độ chỉ đọc từ u-SAINT SSO).
 */
export interface ProfileCardProps {
  user: User;               // Dữ liệu người dùng hiển thị
}


/* --------------------------------------------------------------------------
   2. ZUSTAND STORES (Quản lý trạng thái toàn cục - State & Actions)
   -------------------------------------------------------------------------- */

/**
 * Kết quả trả về sau khi thực thi hàm login trong AuthStore.
 */
export interface AuthLoginResult {
  success: boolean;         // Đăng nhập thành công hay thất bại
  errorCode?: "MISSING_FIELDS" | "INVALID_CREDENTIALS" | "SERVER_ERROR" | "NETWORK_ERROR" | string; // Mã lỗi phân loại cho i18n
  error?: string;           // Thông báo lỗi chi tiết khi thất bại
}

/**
 * Interface định nghĩa toàn bộ State và Actions cho AuthStore (Zustand).
 * Quản lý phiên làm việc sinh viên, JWT token và điều khiển Modal đăng nhập.
 */
export interface AuthState {
  user: StudentProfile | null;                                    // Dữ liệu sinh viên đang đăng nhập
  token: string | null;                                           // JWT Bearer Token gửi kèm Header API
  isLoggedIn: boolean;                                            // Trạng thái đã đăng nhập
  isLoading: boolean;                                             // Trạng thái đang khôi phục phiên từ storage
  isLoginModalOpen: boolean;                                      // Trạng thái đóng/mở modal đăng nhập SSO
  redirectAfterLogin: string | null;                              // Đường dẫn cần chuyển đến sau khi đăng nhập

  // Actions
  setUser: (user: StudentProfile | null) => void;                 // Cập nhật thông tin sinh viên
  setToken: (token: string | null) => void;                       // Cập nhật chuỗi token
  openLoginModal: (redirectTo?: string) => void;                  // Mở modal đăng nhập kèm link chuyển tiếp
  closeLoginModal: () => void;                                    // Đóng modal đăng nhập
  login: (studentId: string, password: string) => Promise<AuthLoginResult>; // Xác thực đăng nhập qua SSO
  logout: () => void;                                             // Đăng xuất và dọn sạch session
}

/**
 * Interface định nghĩa State và Actions cho LanguageStore (Zustand).
 * Hỗ trợ chuyển đổi đa ngữ (Tiếng Anh, Tiếng Hàn, Tiếng Việt) kèm từ điển t.
 */
export interface LanguageState {
  language: SupportedLanguage;                                    // Mã ngôn ngữ hiện tại
  t: TranslationDict;                                             // Từ điển đối chiếu chuỗi văn bản
  setLanguage: (lang: SupportedLanguage) => void;                 // Hành động thay đổi ngôn ngữ giao diện
}


/* --------------------------------------------------------------------------
   3. U-SAINT SSO & AUTHENTICATION (Xác thực cổng trường Soongsil u-SAINT)
   -------------------------------------------------------------------------- */

/**
 * Cặp thông tin đăng nhập sinh viên cổng u-SAINT.
 */
export interface UsaintLoginCredentials {
  studentId: string;        // Mã số sinh viên
  password: string;         // Mật khẩu cổng trường u-SAINT
}

/**
 * Kết quả trả về từ hàm xác thực u-SAINT backend helper (`lib/usaint.ts`).
 */
export interface UsaintLoginResult {
  success: boolean;         // Xác thực thành công hay không
  sessionCookies?: string;  // Chuỗi cookie phiên trường chứa token MYSAPSSO2
  errorCode?: string;       // Mã lỗi định danh (VD: INVALID_CREDENTIALS, MISSING_FIELDS)
  error?: string;           // Lỗi trả về từ thư viện / cổng trường
}

/**
 * Dữ liệu phản hồi từ Next.js API Route BFF `/api/auth/usaint`.
 */
export interface UsaintLoginApiResponse {
  success: boolean;         // Trạng thái phản hồi
  profile?: StudentProfile; // Hồ sơ sinh viên đã bóc tách từ u-SAINT
  token?: string;           // Token phiên làm việc
  errorCode?: string;       // Mã lỗi định danh (VD: INVALID_CREDENTIALS, MISSING_FIELDS)
  error?: string;           // Thông báo lỗi nếu thất bại
}


/* --------------------------------------------------------------------------
   4. API CLIENT & HTTP SERVICE TYPES (Giao thức mạng & Phản hồi Backend Spring Boot)
   -------------------------------------------------------------------------- */

/**
 * Cấu trúc Response chuẩn hóa từ Backend Spring Boot API (`/api/*`).
 */
export interface ApiResponse<T = unknown> {
  success: boolean;         // Trạng thái nghiệp vụ thành công
  data?: T;                 // Dữ liệu trả về (payload)
  message?: string;         // Thông điệp từ server
  statusCode?: number;      // HTTP Status code
  timestamp?: string;       // Thời gian phản hồi ISO-8601
}

/**
 * Cấu trúc lỗi trả về từ API Backend.
 */
export interface ApiErrorResponse {
  success: false;           // Luôn là false khi gặp lỗi
  error: string;            // Tên mã lỗi hoặc tóm tắt lỗi
  message: string;          // Chi tiết lỗi thân thiện cho người dùng
  statusCode: number;       // Mã HTTP (400, 401, 403, 404, 500...)
  fieldErrors?: Record<string, string>; // Chi tiết lỗi validation theo từng trường
}

/**
 * Dữ liệu phân trang kèm theo danh sách dữ liệu từ Backend.
 */
export interface PaginationMeta {
  page: number;             // Trang hiện tại (1-indexed hoặc 0-indexed)
  size: number;             // Số lượng phần tử mỗi trang
  totalElements: number;    // Tổng số phần tử
  totalPages: number;       // Tổng số trang
  hasMore: boolean;         // Còn trang tiếp theo hay không
}

/**
 * Cấu trúc danh sách dữ liệu có hỗ trợ phân trang.
 */
export interface PaginatedResponse<T> {
  items: T[];               // Danh sách dữ liệu của trang hiện tại
  pagination: PaginationMeta; // Metadata phân trang
}


/* --------------------------------------------------------------------------
   5. GROUP CORE & LISTING TYPES (Nhóm học tập & Danh sách nhóm)
   -------------------------------------------------------------------------- */

/**
 * Trạng thái tuyển dụng của một nhóm học tập:
 * - active: Nhóm đang hoạt động bình thường
 * - recruiting: Nhóm đang mở đơn ứng tuyển tìm thành viên
 * - closed: Nhóm đã đủ người hoặc đã đóng đợt tuyển
 */
export type GroupStatus = "active" | "recruiting" | "closed";

/**
 * Hình thức sinh hoạt và làm việc của nhóm.
 */
export type MeetingFormat = "Online" | "Offline" | "Hybrid";

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

/**
 * Tham số truy vấn / bộ lọc tìm kiếm nhóm học tập (`src/services/groupService.ts`).
 */
export interface GroupFilterParams {
  keyword?: string;         // Từ khóa tìm kiếm (tên môn, đề tài, kỹ năng...)
  college?: string;         // Lọc theo Trường / Viện (VD: "IT대학")
  department?: string;      // Lọc theo Khoa / Ngành (VD: "소프트웨어학부")
  postYear?: number;        // Lọc theo năm đăng
  status?: GroupStatus;     // Lọc theo trạng thái tuyển
  page?: number;            // Số trang yêu cầu
  limit?: number;           // Số phần tử mỗi trang
}


/* --------------------------------------------------------------------------
   6. GROUP DETAIL & PAGE PROPS (Trang chi tiết nhóm `/groups/[id]`)
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
  meetingFormat?: MeetingFormat;        // Hình thức họp (Online/Offline/Hybrid)
  requiredSkills?: string[];            // Danh sách kỹ năng / công nghệ yêu cầu
  rolesQuota?: GroupRoleQuota[];        // Phân bổ chỉ tiêu các vị trí cần tuyển
  leaderEmail?: string;                 // Email liên hệ của trưởng nhóm
  leaderStudentId?: string;             // MSSV của trưởng nhóm
  membersList?: GroupMemberDetail[];    // Danh sách thành viên chính thức
  createdAt?: string;                   // Ngày tạo nhóm
}


/* --------------------------------------------------------------------------
   7. APPLICATION & MODAL TYPES (Đơn ứng tuyển & Modal nộp đơn)
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
 * Payload gửi lên Server khi sinh viên nộp đơn ứng tuyển qua modal.
 */
export interface ApplyGroupPayload {
  groupId: string;              // ID nhóm cần ứng tuyển
  appliedRole: string;          // Vị trí mong muốn
  relevantSkills?: string;      // Kỹ năng liên quan nhập tự do
  message: string;              // Giới thiệu & lý do ứng tuyển
  contactEmail?: string;        // Email liên hệ
  contactPhone?: string;        // Số điện thoại liên hệ
  githubUrl?: string;           // Link GitHub
  portfolioUrl?: string;        // Link Portfolio
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
   8. NAVIGATION, UI & I18N TYPES (Thanh điều hướng, Giao diện & Đa ngôn ngữ)
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
 * Thông tin nhóm đồ án được ghim trong thanh bên Sidebar.
 */
export interface PinnedGroup {
  id: string;                                   // ID nhóm
  code: string;                                 // Mã môn viết gọn (VD: "CS490")
  name: string;                                 // Tên nhóm đồ án
  status: string;                               // Trạng thái hoạt động
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

/**
 * Cấu trúc tùy chọn ngôn ngữ hiển thị trong LanguageSwitcher.
 */
export interface LanguageOption {
  code: SupportedLanguage;                      // Mã ngôn ngữ
  label: string;                                // Tên tiếng Anh
  flag: string;                                 // Emoji cờ quốc gia
  native: string;                               // Tên bản địa (VD: "한국어", "Tiếng Việt")
}

// Re-export type từ điển đa ngữ để tiện dùng toàn ứng dụng
export type { TranslationDict };
