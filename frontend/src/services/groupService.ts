import { apiRequest } from "@/lib/api";
import type { CreateGroupPayload, CreateGroupResponse, MyGroupSummary, StudentProfile } from "@/lib/types";
import { USE_MOCK, mockDelay, mockGetMyGroups, mockCreateGroup } from "@/services/mocks/groupMocks";

// Chỉ bật sau khi backend có API và kiểm tra JWT/quyền Leader phía server.
// Đây là cờ khả năng tích hợp, không phải cơ chế phân quyền.
export const MANAGE_MUTATIONS_AVAILABLE: boolean = false;
export const MANAGE_USES_SAMPLE_DATA = USE_MOCK;

// Các hàm gọi API liên quan tới nhóm học tập (Group module).

/**
 * Lấy danh sách nhóm của người dùng hiện tại, kèm vai trò của tôi trong từng nhóm (myRole).
 * Endpoint dự kiến: GET /api/users/me/groups → MyGroupSummary[]
 */
export async function getMyGroups(): Promise<MyGroupSummary[]> {
  // TODO replace with real API when backend is ready (xem USE_MOCK trong services/mocks/groupMocks.ts).
  // Khi tắt mock, xem lại fallback token giả của BFF trong src/app/api/auth/usaint/route.ts.
  if (USE_MOCK) {
    await mockDelay();
    return mockGetMyGroups();
  }
  return apiRequest<MyGroupSummary[]>("/users/me/groups");
}

/**
 * Tạo một nhóm học tập mới (Yêu cầu JWT Bearer Token, người tạo tự động là Leader).
 * Endpoint: POST /api/groups
 */
export async function createGroup(
  payload: CreateGroupPayload,
  userProfile?: StudentProfile | null,
): Promise<CreateGroupResponse> {
  if (USE_MOCK) {
    await mockDelay();
    return mockCreateGroup(payload, userProfile ? {
      name: userProfile.name,
      faculty: userProfile.faculty,
      department: userProfile.department,
      studentId: userProfile.studentId,
    } : undefined);
  }
  return apiRequest<CreateGroupResponse>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
