import { apiRequest } from "@/lib/api";
import type { GroupApplication } from "@/lib/types";
import {
  USE_MOCK,
  mockDelay,
  mockGetGroupApplications,
  mockUpdateApplicationStatus,
} from "@/services/mocks/groupMocks";

// Các hàm gọi API liên quan tới đơn ứng tuyển (Application module).
// TODO replace with real API when backend is ready (xem USE_MOCK trong services/mocks/groupMocks.ts).
// Khi tắt mock, xem lại fallback token giả của BFF trong src/app/api/auth/usaint/route.ts.

/**
 * Lấy toàn bộ đơn ứng tuyển của một nhóm (chỉ Leader nhóm).
 * Endpoint: GET /api/groups/{id}/applications → GroupApplication[]
 */
export async function getGroupApplications(groupId: number): Promise<GroupApplication[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetGroupApplications(groupId);
  }
  return apiRequest<GroupApplication[]>(`/groups/${groupId}/applications`);
}

/**
 * Chấp thuận một đơn ứng tuyển (Backend tự động thêm ứng viên vào group_members).
 * Endpoint: PUT /api/applications/{id}/accept → GroupApplication
 */
export async function acceptApplication(applicationId: number): Promise<GroupApplication> {
  if (USE_MOCK) {
    await mockDelay();
    return mockUpdateApplicationStatus(applicationId, "ACCEPTED");
  }
  return apiRequest<GroupApplication>(`/applications/${applicationId}/accept`, {
    method: "PUT",
  });
}

/**
 * Từ chối một đơn ứng tuyển.
 * Endpoint: PUT /api/applications/{id}/reject → GroupApplication
 */
export async function rejectApplication(applicationId: number): Promise<GroupApplication> {
  if (USE_MOCK) {
    await mockDelay();
    return mockUpdateApplicationStatus(applicationId, "REJECTED");
  }
  return apiRequest<GroupApplication>(`/applications/${applicationId}/reject`, {
    method: "PUT",
  });
}
