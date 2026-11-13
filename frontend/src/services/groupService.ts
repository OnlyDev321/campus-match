import { apiRequest } from "@/lib/api";
import type { CreateGroupPayload, CreateGroupResponse, GroupDetailData, MyGroupSummary, StudentProfile } from "@/lib/types";
import { getGroupDetail } from "@/lib/mockData";
import { USE_MOCK, mockDelay, mockGetMyGroups, mockCreateGroup, mockGetJoinedGroupDetail } from "@/services/mocks/groupMocks";
import { mockGroupCards } from "@/lib/mockData";

/** Nối trang chi tiết hiện tại với nhóm mẫu ở Manage; chỉ bật vai trò mẫu khi USE_MOCK. */
export function getGroupDetailForView(id: string, profile?: StudentProfile | null): GroupDetailData | null {
  return (USE_MOCK ? mockGetJoinedGroupDetail(id, profile) : null) ?? getGroupDetail(id);
}

// Chỉ bật sau khi backend có API và kiểm tra JWT/quyền Leader phía server.
// Đây là cờ khả năng tích hợp, không phải cơ chế phân quyền.
export const MANAGE_MUTATIONS_AVAILABLE: boolean = false;
export const MANAGE_USES_SAMPLE_DATA = USE_MOCK;

/**
 * Lấy danh sách năm có nhóm tồn tại (cho Year filter dropdown).
 * - Khi backend sẵn sàng: GET /api/groups/years → [2026, 2025, 2024]
 * - Fallback (mock): Dynamic tính từ năm hiện tại + data mock
 */
export async function fetchAvailableYears(): Promise<number[]> {
  if (!USE_MOCK) {
    return apiRequest<number[]>("/groups/years");
  }

  // Hybrid fallback: dynamic theo năm hiện tại, merge với mock data
  await mockDelay();
  const currentYear = new Date().getFullYear();
  const dataYears = new Set(mockGroupCards.map((g) => g.postYear));
  const merged = new Set([currentYear, currentYear - 1, currentYear - 2, ...dataYears]);
  return Array.from(merged).sort((a, b) => b - a);
}

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
