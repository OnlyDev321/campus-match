import type { ManageGroupDraft } from "@/lib/types";

/** Kiểm tra ràng buộc model; giao diện dịch lỗi tại thời điểm render. */
export function validateManageGroup(draft: ManageGroupDraft, memberCount: number) {
  return {
    title: !draft.title.trim() || draft.title.trim().length > 150,
    description: !draft.description.trim(),
    maxMembers: !draft.maxMembers.trim() || !Number.isInteger(Number(draft.maxMembers)) ||
      Number(draft.maxMembers) < Math.max(2, memberCount) || Number(draft.maxMembers) > 20,
    courseCode: draft.courseCode.trim().length > 50,
    courseName: draft.courseName.trim().length > 100,
    contactEmail: Boolean(draft.contactEmail.trim()) && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim()) || draft.contactEmail.trim().length > 254),
    contactPhone: Boolean(draft.contactPhone.trim()) && !/^[+0-9() .-]{7,25}$/.test(draft.contactPhone.trim()),
    tags: draft.tags.length > 5 || draft.tags.some((tag) => !tag.trim() || tag.trim().length > 50),
    rolesQuota: draft.rolesQuota.length > 0 && (draft.rolesQuota.some((role) => !role.role.trim() || !Number.isInteger(role.max) || role.max < role.current || role.max < 1 || role.role.trim().length > 100 || (role.description?.length ?? 0) > 500) ||
      new Set(draft.rolesQuota.map((role) => role.role.trim())).size !== draft.rolesQuota.length ||
      draft.rolesQuota.reduce((sum, role) => sum + role.max, 0) !== Number(draft.maxMembers)),
  };
}
