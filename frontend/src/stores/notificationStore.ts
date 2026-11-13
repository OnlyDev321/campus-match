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

const INITIAL_MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "APPLICATION_RECEIVED",
    title: "Đơn ứng tuyển mới",
    message: "Lee Minho đã nộp đơn ứng tuyển vào vị trí Collaborator / Researcher cho nhóm của bạn.",
    link: "/manage",
    groupId: 1,
    groupTitle: "Robot SLAM Navigation",
    actorName: "Lee Minho",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "notif-2",
    type: "NEW_MEMBER_JOINED",
    title: "Thành viên mới gia nhập",
    message: "Park Jiwon vừa chính thức gia nhập nhóm với vai trò Core Developer.",
    link: "/groups/1",
    groupId: 1,
    groupTitle: "Robot SLAM Navigation",
    actorName: "Park Jiwon",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "notif-3",
    type: "GROUP_UPDATED",
    title: "Cập nhật thông tin nhóm",
    message: "Trưởng nhóm Kim Seojun vừa cập nhật Lịch sinh hoạt định kỳ và Mục tiêu đề tài.",
    link: "/groups/2",
    groupId: 2,
    groupTitle: "Capstone AI & Vision",
    actorName: "Kim Seojun",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export interface NotificationStoreState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (
    notif: Omit<AppNotification, "id" | "createdAt" | "isRead"> & { isRead?: boolean }
  ) => void;
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_MOCK_NOTIFICATIONS,
      unreadCount: INITIAL_MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
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
          // Khi backend offline hoặc chạy mock, giữ nguyên local state mà không phá hỏng UI
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
        if (isLoggedIn && token && !id.startsWith("notif-")) {
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
        if (isLoggedIn && token && !id.startsWith("notif-")) {
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

      addNotification: (notif) => {
        const newNotif: AppNotification = {
          ...notif,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          isRead: notif.isRead ?? false,
        };
        const updated = [newNotif, ...get().notifications];
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });
      },
    }),
    {
      name: "campusmatch_notifications_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        }
      },
    }
  )
);
