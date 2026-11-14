import { apiRequest } from "@/lib/api";
import type { GroupApplication } from "@/lib/types";

/** Gửi lời giới thiệu và vai trò đã chọn từ chỉ tiêu thực của nhóm. */
export async function applyToGroup(groupId: string | number, statement: string, desiredRole?: string): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/groups/${groupId}/applications`, {
    method: "POST",
    body: JSON.stringify({ statement, desiredRole }),
  });
}

export async function getGroupApplications(groupId: number): Promise<GroupApplication[]> {
  return apiRequest<GroupApplication[]>(`/groups/${groupId}/applications`);
}

export async function getMyApplications(): Promise<GroupApplication[]> {
  return apiRequest<GroupApplication[]>("/users/me/applications");
}

export async function acceptApplication(applicationId: number): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/applications/${applicationId}/accept`, { method: "PUT" });
}

export async function rejectApplication(applicationId: number): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/applications/${applicationId}/reject`, { method: "PUT" });
}
