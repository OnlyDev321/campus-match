import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NotificationStoreState } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import {
  getNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  clearAllNotifications as apiClearAll,
} from "@/services/notificationService";

let latestFetch = 0;
let readRevision = 0;

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      // Đồng bộ thông báo từ Database qua REST API
      fetchNotifications: async () => {
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) {
          latestFetch++;
          readRevision++;
          set({ notifications: [], unreadCount: 0, isLoading: false });
          return;
        }

        const fetchId = ++latestFetch;
        const revisionAtStart = readRevision;
        set({ isLoading: true });
        try {
          const remoteNotifs = await getNotifications();
          if (fetchId === latestFetch && revisionAtStart === readRevision && token === useAuthStore.getState().token && Array.isArray(remoteNotifs)) {
            set({
              notifications: remoteNotifs,
              unreadCount: remoteNotifs.filter((n) => !n.isRead).length,
              isLoading: false,
            });
          }
        } catch {
          // Lỗi mạng giữ trạng thái hiện tại để người dùng thử lại.
        } finally {
          if (fetchId === latestFetch) set({ isLoading: false });
        }
      },

      markAsRead: async (id: string) => {
        if (!get().notifications.some((n) => n.id === id && !n.isRead)) return;
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) return;
        try {
          await apiMarkAsRead(id);
          readRevision++;
          const updated = get().notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
          set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length });
        } catch {
          // Không báo đã đọc nếu backend chưa lưu thành công.
        }
      },

      markAllAsRead: async () => {
        if (get().unreadCount === 0) return;
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) return;
        try {
          await apiMarkAllAsRead();
          readRevision++;
          const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
          set({ notifications: updated, unreadCount: 0 });
        } catch {
          // Giữ trạng thái chưa đọc nếu backend chưa lưu thành công.
        }
      },

      removeNotification: async (id: string) => {
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) return;
        try {
          await apiDeleteNotification(id);
          readRevision++;
          const updated = get().notifications.filter((n) => n.id !== id);
          set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length });
        } catch { /* Giữ dữ liệu hiện tại nếu backend không xóa được. */ }
      },

      clearAll: async () => {
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) return;
        try {
          await apiClearAll();
          readRevision++;
          set({ notifications: [], unreadCount: 0 });
        } catch { /* Giữ dữ liệu hiện tại nếu backend không xóa được. */ }
      },


    }),
    {
      name: "campusmatch_notifications_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.notifications = [];
          state.unreadCount = 0;
        }
      },
    }
  )
);
