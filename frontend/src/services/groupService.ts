import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { CreateGroupPayload, GroupCardData, GroupDetailData, GroupDetailResponse, GroupFilterParams, GroupSummaryResponse, MyGroupSummary, SpringPage, UpdateGroupPayload } from "@/lib/types";

const toCard = (group: GroupSummaryResponse): GroupCardData => ({
  id: String(group.id),
  course: group.courseName || group.courseCode || "",
  title: group.title,
  description: group.description,
  college: group.college,
  department: group.department,
  postYear: group.postYear,
  leaderName: group.leader.name,
  leaderId: group.leader.id,
  leaderAvatarUrl: group.leader.avatarUrl ?? undefined,
  leaderMajor: group.leader.department || "",
  memberCount: group.memberCount,
  maxMembers: group.maxMembers,
  status: group.status,
  rolesQuota: group.rolesQuota ?? [],
});

const toDetail = (group: GroupDetailResponse): GroupDetailData => {
  const userId = useAuthStore.getState().userId;
  return {
  ...toCard(group),
  myRole: group.leader.id === userId ? "LEADER" : group.members.some((member) => member.userId === userId) ? "MEMBER" : undefined,
  courseCode: group.courseCode ?? undefined,
  meetingFormat: group.meetingFormat ?? undefined,
  tags: group.tags ?? [],
  longDescription: group.description,
  leaderEmail: group.contactEmail ?? undefined,
  contactPhone: group.contactPhone ?? undefined,
  leaderStudentId: group.leader.studentId,
  createdAt: group.createdAt,
  membersList: group.members.map((member) => ({
    id: String(member.userId),
    name: member.name,
    role: member.role,
    major: member.department || "",
    avatarUrl: member.avatarUrl ?? undefined,
    isLeader: member.role === "LEADER",
    isCurrentUser: member.userId === userId,
  })),
};
};

/** Spring Page dùng chỉ số trang bắt đầu từ 0. */
export async function fetchGroups(params: GroupFilterParams = {}): Promise<SpringPage<GroupCardData>> {
  const query = new URLSearchParams();
  for (const key of ["keyword", "college", "department", "postYear", "status", "page", "size", "sort"] as const) {
    const value = params[key];
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const page = await apiRequest<SpringPage<GroupSummaryResponse>>(`/groups?${query}`);
  return { ...page, content: page.content.map(toCard) };
}

export async function fetchGroupDetail(id: string | number): Promise<GroupDetailData> {
  return toDetail(await apiRequest<GroupDetailResponse>(`/groups/${id}`));
}

export async function fetchAvailableYears(): Promise<number[]> {
  return apiRequest<number[]>("/groups/years");
}

export async function getMyGroups(): Promise<MyGroupSummary[]> {
  return apiRequest<MyGroupSummary[]>("/users/me/groups");
}

export async function createGroup(payload: CreateGroupPayload): Promise<GroupDetailResponse> {
  return apiRequest<GroupDetailResponse>("/groups", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      courseCode: payload.courseCode,
      courseName: payload.courseName,
      meetingFormat: payload.meetingFormat,
      tags: payload.tags,
      maxMembers: payload.maxMembers,
      rolesQuota: payload.rolesQuota,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
    }),
  });
}

export async function updateGroup(groupId: number, payload: UpdateGroupPayload): Promise<GroupDetailResponse> {
  return apiRequest<GroupDetailResponse>(`/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteGroup(groupId: number | string): Promise<void> {
  return apiRequest<void>(`/groups/${groupId}`, { method: "DELETE" });
}
