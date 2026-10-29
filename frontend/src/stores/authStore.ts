import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentProfile, AuthState } from "@/lib/types";
import { useLanguageStore } from "@/stores/languageStore";

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
        try {
          if (!studentId || !password) {
            return {
              success: false,
              errorCode: "MISSING_FIELDS",
            };
          }

          set({ isLoading: true });

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
            set({ isLoading: false });
            return {
              success: false,
              errorCode: data.errorCode || "INVALID_CREDENTIALS",
              error: data.error,
            };
          }

          const studentProfile: StudentProfile = data.profile;

          // Lưu JWT thật do Spring Boot cấp và ID người dùng trong DB (BFF chuyển tiếp từ /api/auth/sso/usaint)
          set({
            user: studentProfile,
            token: data.token ?? null,
            userId: data.userId ?? null,
            isLoggedIn: true,
            isLoginModalOpen: false,
            isLoading: false,
          });

          return { success: true };
        } catch {
          set({ isLoading: false });
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
        });
      },
    }),
    {
      name: "campusmatch_auth_storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu trữ user, token và userId vào localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        userId: state.userId,
        isLoggedIn: state.isLoggedIn,
      }),
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
