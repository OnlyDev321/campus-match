import type { CreateBrowserGroupPayload, GroupCardData, StudentProfile } from "@/lib/types";

// Bản thử nghiệm lưu tại trình duyệt; chưa gửi nhóm lên backend.
const STORAGE_KEY = "campus-match-created-groups";

/** Đọc chuỗi dữ liệu ổn định cho useSyncExternalStore, kể cả khi storage bị chặn. */
export function getBrowserGroupsSnapshot(): string {
  try { return localStorage.getItem(STORAGE_KEY) || "[]"; }
  catch { return "[]"; }
}

/** Theo dõi thay đổi nhóm ở cửa sổ hiện tại và các tab khác. */
export function subscribeBrowserGroups(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("campus-match-groups-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("campus-match-groups-changed", callback);
  };
}

/** Chuẩn hóa dữ liệu cũ để nhóm tương thích với bộ lọc trường, khoa và năm. */
export function parseBrowserGroups(snapshot: string): GroupCardData[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item.id === "string" &&
      typeof item.title === "string" && typeof item.course === "string" &&
      typeof item.description === "string" && typeof item.leaderName === "string" &&
      typeof item.leaderMajor === "string" && Number.isInteger(item.memberCount) &&
      Number.isInteger(item.maxMembers))
      .map(item => ({ ...item,
        college: typeof item.college === "string" ? item.college : "",
        department: typeof item.department === "string" ? item.department : "",
        postYear: typeof item.postYear === "number" ? item.postYear : new Date().getFullYear(),
      }));
  } catch { return []; }
}

/** Lưu nhóm thử nghiệm và lấy thông tin trưởng nhóm từ hồ sơ đăng nhập. */
export function createBrowserGroup(payload: CreateBrowserGroupPayload, user: StudentProfile): void {
  const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(raw)) throw new Error("INVALID_GROUP_STORAGE");
  const group = {
    ...payload, id: crypto.randomUUID(), tags: payload.skills, memberCount: 1,
    leaderName: user.name, leaderMajor: user.department, leaderAvatarUrl: user.avatarUrl,
    college: user.faculty, department: user.department, postYear: new Date().getFullYear(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([group, ...raw]));
  window.dispatchEvent(new Event("campus-match-groups-changed"));
}
