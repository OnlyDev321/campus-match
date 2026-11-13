import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppNotification } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import {
  getNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  clearAllNotifications as apiClearAll,
} from "@/services/notificationService";

export interface NotificationStoreState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;

}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      // Đồng bộ thông báo từ Database qua REST API
      fetchNotifications: async () => {
        const { isLoggedIn, token } = useAuthStore.getState();
        if (!isLoggedIn || !token) return;

        set({ isLoading: true });
        try {
          const remoteNotifs = await getNotifications();
          if (Array.isArray(remoteNotifs)) {
            set({
              notifications: remoteNotifs,
              unreadCount: remoteNotifs.filter((n) => !n.isRead).length,
              isLoading: false,
            });
          }
        } catch {
          // Lỗi mạng giữ trạng thái hiện tại để người dùng thử lại.
          set({ isLoading: false });
        }
      },

      markAsRead: (id: string) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });

        // Bất đồng bộ lưu xuống Database
        const { isLoggedIn, token } = useAuthStore.getState();
        if (isLoggedIn && token) {
          apiMarkAsRead(id).catch(() => {});
        }
      },

      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({
          notifications: updated,
          unreadCount: 0,
        });

        // Bất đồng bộ lưu xuống Database
        const { isLoggedIn, token } = useAuthStore.getState();
        if (isLoggedIn && token) {
          apiMarkAllAsRead().catch(() => {});
        }
      },

      removeNotification: (id: string) => {
        const updated = get().notifications.filter((n) => n.id !== id);
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });

        // Bất đồng bộ xóa khỏi Database
        const { isLoggedIn, token } = useAuthStore.getState();
        if (isLoggedIn && token) {
          apiDeleteNotification(id).catch(() => {});
        }
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });

        // Bất đồng bộ dọn sạch Database
        const { isLoggedIn, token } = useAuthStore.getState();
        if (isLoggedIn && token) {
          apiClearAll().catch(() => {});
        }
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
