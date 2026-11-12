import type { ManageGroupDraft } from "@/lib/types";

/** Kiểm tra ràng buộc model; giao diện dịch lỗi tại thời điểm render. */
export function validateManageGroup(draft: ManageGroupDraft, memberCount: number) {
  return {
    title: !draft.title.trim() || draft.title.trim().length > 150,
    description: !draft.description.trim(),
    maxMembers: !draft.maxMembers.trim() || !Number.isInteger(Number(draft.maxMembers)) ||
      Number(draft.maxMembers) < Math.max(1, memberCount) || Number(draft.maxMembers) > 2147483647,
    status: !["RECRUITING", "COMPLETED", "CLOSED"].includes(draft.status) ||
      (draft.status === "RECRUITING" && Number(draft.maxMembers) <= memberCount) ||
      (draft.status === "COMPLETED" && Number(draft.maxMembers) !== memberCount),
  };
}
