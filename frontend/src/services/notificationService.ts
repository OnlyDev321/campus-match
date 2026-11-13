import { apiRequest } from "@/lib/api";
import type { AppNotification } from "@/lib/types";

/**
 * Lấy danh sách toàn bộ thông báo của người dùng hiện tại từ Database.
 * Endpoint: GET /api/notifications
 */
export async function getNotifications(): Promise<AppNotification[]> {
  return apiRequest<AppNotification[]>("/notifications");
}

/**
 * Lấy số lượng thông báo chưa đọc.
 * Endpoint: GET /api/notifications/unread-count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiRequest<{ unreadCount: number }>("/notifications/unread-count");
  return res.unreadCount;
}

/**
 * Đánh dấu 1 thông báo là đã đọc.
 * Endpoint: PATCH /api/notifications/{id}/read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  return apiRequest<void>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

/**
 * Đánh dấu tất cả thông báo là đã đọc.
 * Endpoint: PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  return apiRequest<void>("/notifications/read-all", {
    method: "PATCH",
  });
}

/**
 * Xóa 1 thông báo khỏi lịch sử.
 * Endpoint: DELETE /api/notifications/{id}
 */
export async function deleteNotification(id: string): Promise<void> {
  return apiRequest<void>(`/notifications/${id}`, {
    method: "DELETE",
  });
}

/**
 * Xóa toàn bộ thông báo.
 * Endpoint: DELETE /api/notifications
 */
export async function clearAllNotifications(): Promise<void> {
  return apiRequest<void>("/notifications", {
    method: "DELETE",
  });
}

