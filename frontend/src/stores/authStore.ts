import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentProfile, AuthState } from "@/lib/types";


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
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
            return { success: false, error: "학번과 비밀번호를 모두 입력해주세요." };
          }

          set({ isLoading: true });

          // Mô phỏng / Gọi API xác thực u-SAINT SSO
          await new Promise((resolve) => setTimeout(resolve, 800));

          const mockProfile: StudentProfile = {
            studentId: studentId.trim(),
            name: studentId === "20211234" ? "홍길동" : `숭실학우 (${studentId.slice(-4)})`,
            department: "컴퓨터학부",
            faculty: "IT대학",
            email: `${studentId}@soongsil.ac.kr`,
            academicYear: "3",
          };

          const mockToken = `mock_jwt_token_${studentId}_${Date.now()}`;

          set({
            user: mockProfile,
            token: mockToken,
            isLoggedIn: true,
            isLoginModalOpen: false,
            isLoading: false,
          });

          return { success: true };
        } catch {
          set({ isLoading: false });
          return {
            success: false,
            error: "u-SAINT 포털 인증에 실패했습니다. 학번과 비밀번호를 확인해주세요.",
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          isLoginModalOpen: false,
          redirectAfterLogin: null,
        });
      },
    }),
    {
      name: "campusmatch_auth_storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu trữ user và token vào localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

// Hook tiện ích tương thích với code cũ
export const useAuth = () => useAuthStore();
