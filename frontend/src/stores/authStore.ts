import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentProfile, AuthState, TimetableStatus } from "@/lib/types";
import { normalizeStudentTimetable } from "@/lib/timetableParser";
import { useLanguageStore } from "@/stores/languageStore";

// Khôi phục trạng thái thời khóa biểu từ localStorage:
// phiên cũ (chưa có trường này), trạng thái "loading" bị kẹt hoặc dữ liệu hỏng → "not_fetched" (yêu cầu đăng nhập lại).
const restoreTimetableStatus = (saved: unknown, hasTimetable: boolean): TimetableStatus => {
  if (hasTimetable) return "success";
  return saved === "unavailable" ? "unavailable" : "not_fetched";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      userId: null,
      isLoggedIn: false,
      isLoading: false,
      isLoginModalOpen: false,
      redirectAfterLogin: null,
      timetable: null,
      timetableStatus: "not_fetched",

      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setToken: (token) => set({ token }),

      openLoginModal: (redirectTo?: string) => {
        set({
          isLoginModalOpen: true,
          redirectAfterLogin: redirectTo || null,
        });
      },

      closeLoginModal: () => {
        set({ isLoginModalOpen: false });
      },

      login: async (studentId: string, password: string) => {
        // Đăng nhập (lại) thất bại thì khôi phục đúng trạng thái thời khóa biểu trước đó.
        const previousTimetableStatus = get().timetableStatus;
        try {
          if (!studentId || !password) {
            return {
              success: false,
              errorCode: "MISSING_FIELDS",
            };
          }

          set({ isLoading: true, timetableStatus: "loading" });

          const currentLang = useLanguageStore.getState().language || "ko";

          // Gọi API Route BFF /api/auth/usaint (Xác thực SSO và trích xuất hồ sơ SAP)
          const response = await fetch("/api/auth/usaint", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": currentLang,
            },
            body: JSON.stringify({
              studentId: studentId.trim(),
              password: password,
              language: currentLang,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            set({ isLoading: false, timetableStatus: previousTimetableStatus });
            return {
              success: false,
              errorCode: data.errorCode || "INVALID_CREDENTIALS",
              error: data.error,
            };
          }

          const studentProfile: StudentProfile = data.profile;
          // Kiểm tra lại cấu trúc thời khóa biểu trước khi lưu; dữ liệu không hợp lệ được coi là "unavailable".
          const timetable =
            data.timetableStatus === "success" ? normalizeStudentTimetable(data.timetable) : null;

          // Lưu JWT thật do Spring Boot cấp và ID người dùng trong DB (BFF chuyển tiếp từ /api/auth/sso/usaint)
          set({
            user: studentProfile,
            token: data.token ?? null,
            userId: data.userId ?? null,
            isLoggedIn: true,
            isLoginModalOpen: false,
            isLoading: false,
            timetable,
            timetableStatus: timetable ? "success" : "unavailable",
          });

          return { success: true };
        } catch {
          set({ isLoading: false, timetableStatus: previousTimetableStatus });
          return {
            success: false,
            errorCode: "NETWORK_ERROR",
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          userId: null,
          isLoggedIn: false,
          isLoginModalOpen: false,
          redirectAfterLogin: null,
          timetable: null,
          timetableStatus: "not_fetched",
        });
      },
    }),
    {
      name: "campusmatch_auth_storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu trữ user, token, userId và thời khóa biểu vào localStorage (không lưu mật khẩu / cookie u-SAINT)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userId: state.userId,
        isLoggedIn: state.isLoggedIn,
        timetable: state.timetable,
        timetableStatus: state.timetableStatus,
      }),
      // Kiểm tra lại thời khóa biểu khi khôi phục; phiên cũ không có trường này vẫn hoạt động bình thường.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AuthState>;
        const timetable = normalizeStudentTimetable(saved.timetable);
        return {
          ...current,
          ...saved,
          timetable,
          timetableStatus: restoreTimetableStatus(saved.timetableStatus, timetable !== null),
        };
      },
    }
  )
);

/**
 * Cho biết authStore đã khôi phục phiên từ localStorage hay chưa.
 * Server và lần render hydrate đầu tiên luôn trả về false, tránh lệch HTML giữa server và client
 * cũng như chuyển hướng nhầm sang trang chủ trước khi đọc xong phiên đăng nhập.
 */
export const useAuthHydrated = () =>
  useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
