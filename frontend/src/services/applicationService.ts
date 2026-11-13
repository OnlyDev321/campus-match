import { apiRequest } from "@/lib/api";
import type { GroupApplication } from "@/lib/types";
import { USE_MOCK_API } from "@/lib/config";

/**
 * Lấy toàn bộ đơn ứng tuyển của một nhóm (chỉ Leader nhóm).
 * Endpoint: GET /api/groups/{id}/applications → GroupApplication[]
 */
export async function getGroupApplications(groupId: number): Promise<GroupApplication[]> {
  if (USE_MOCK_API) {
    const { mockDelay, mockGetGroupApplications } = await import("@/services/mocks/groupMocks");
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
  if (USE_MOCK_API) {
    const { mockDelay, mockUpdateApplicationStatus } = await import("@/services/mocks/groupMocks");
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
  if (USE_MOCK_API) {
    const { mockDelay, mockUpdateApplicationStatus } = await import("@/services/mocks/groupMocks");
    await mockDelay();
    return mockUpdateApplicationStatus(applicationId, "REJECTED");
  }
  return apiRequest<GroupApplication>(`/applications/${applicationId}/reject`, {
    method: "PUT",
  });
}
