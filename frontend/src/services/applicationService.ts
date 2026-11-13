import { apiRequest } from "@/lib/api";
import type { GroupApplication } from "@/lib/types";

/** Backend hiện chỉ nhận trường statement trong ApplyRequest. */
export async function applyToGroup(groupId: string | number, statement: string): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/groups/${groupId}/applications`, {
    method: "POST",
    body: JSON.stringify({ statement }),
  });
}

export async function getGroupApplications(groupId: number): Promise<GroupApplication[]> {
  return apiRequest<GroupApplication[]>(`/groups/${groupId}/applications`);
}

export async function acceptApplication(applicationId: number): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/applications/${applicationId}/accept`, { method: "PUT" });
}

export async function rejectApplication(applicationId: number): Promise<GroupApplication> {
  return apiRequest<GroupApplication>(`/applications/${applicationId}/reject`, { method: "PUT" });
}
