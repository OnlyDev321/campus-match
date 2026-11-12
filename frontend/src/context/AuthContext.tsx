"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { StudentProfile, TimetableStatus, StudentTimetable } from "@/lib/types";

export interface AuthContextType {
  user: StudentProfile | null;
  token: string | null;
  userId: number | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  timetable: StudentTimetable | null;
  timetableStatus: TimetableStatus;
  login: (studentId: string, password: string) => Promise<{ success: boolean; errorCode?: string; error?: string }>;
  logout: () => void;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  const value: AuthContextType = {
    user: store.user,
    token: store.token,
    userId: store.userId,
    isLoggedIn: store.isLoggedIn,
    isLoading: store.isLoading,
    isLoginModalOpen: store.isLoginModalOpen,
    timetable: store.timetable,
    timetableStatus: store.timetableStatus,
    login: store.login,
    logout: store.logout,
    openLoginModal: store.openLoginModal,
    closeLoginModal: store.closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Nếu được gọi ngoài AuthProvider, fallback sang dùng trực tiếp Zustand store
    const store = useAuthStore();
    return {
      user: store.user,
      token: store.token,
      userId: store.userId,
      isLoggedIn: store.isLoggedIn,
      isLoading: store.isLoading,
      isLoginModalOpen: store.isLoginModalOpen,
      timetable: store.timetable,
      timetableStatus: store.timetableStatus,
      login: store.login,
      logout: store.logout,
      openLoginModal: store.openLoginModal,
      closeLoginModal: store.closeLoginModal,
    };
  }
  return context;
}

export { AuthContext };

