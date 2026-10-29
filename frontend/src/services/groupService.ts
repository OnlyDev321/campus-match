import { apiRequest } from "@/lib/api";
import type { MyGroupSummary } from "@/lib/types";
import { USE_MOCK, mockDelay, mockGetMyGroups } from "@/services/mocks/groupMocks";

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
