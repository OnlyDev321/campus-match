import { ApiError, apiRequest } from "@/lib/api";
import { USE_MOCK_API } from "@/lib/config";
import type { ManageGroupUpdate, MyGroupSummary } from "@/lib/types";

/** GET /api/users/me/groups — danh sách nhóm, vai trò và thành viên của tôi. */
export async function getMyGroups(): Promise<MyGroupSummary[]> {
  if (USE_MOCK_API) {
    const { mockDelay, mockGetMyGroups } = await import("@/services/mocks/groupMocks");
    await mockDelay();
    return mockGetMyGroups();
  }
  return apiRequest<MyGroupSummary[]>("/users/me/groups");
}

/** PUT /api/groups/{id} — chỉ Leader; UI tải lại dữ liệu sau khi ghi thành công. */
export async function updateManagedGroup(groupId: number, update: ManageGroupUpdate): Promise<void> {
  const payload = { ...update, title: update.title.trim(), description: update.description.trim() };
  if (!payload.title || payload.title.length > 150 || !payload.description || !Number.isInteger(payload.maxMembers) || payload.maxMembers < 1) {
    throw new ApiError("BAD_REQUEST", 400);
  }
  if (USE_MOCK_API) {
    const { mockDelay, mockManageGroup } = await import("@/services/mocks/groupMocks");
    await mockDelay();
    mockManageGroup(groupId, (group) => {
      if (payload.maxMembers < group.memberCount) throw new ApiError("BAD_REQUEST", 400);
      Object.assign(group, payload);
      if (group.status !== "CLOSED") group.status = group.memberCount >= group.maxMembers ? "COMPLETED" : "RECRUITING";
    });
    return;
  }
  await apiRequest<unknown>(`/groups/${groupId}`, { method: "PUT", body: JSON.stringify(payload) });
}

/** DELETE /api/groups/{id} — hợp đồng Manage yêu cầu đóng tuyển mềm, giữ nhóm và thành viên. */
export async function closeGroupRecruitment(groupId: number): Promise<void> {
  if (USE_MOCK_API) {
    const { mockDelay, mockManageGroup } = await import("@/services/mocks/groupMocks");
    await mockDelay();
    mockManageGroup(groupId, (group) => { group.status = "CLOSED"; });
    return;
  }
  await apiRequest<unknown>(`/groups/${groupId}`, { method: "DELETE" });
}
