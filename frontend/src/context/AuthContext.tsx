"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface StudentProfile {
  studentId: string;
  name: string;
  department: string;
  faculty: string;
  email: string;
  academicYear: string;
}

interface AuthContextType {
  user: StudentProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
  login: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_TOKEN = "campusmatch_token";
const STORAGE_KEY_USER = "campusmatch_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to restore session from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openLoginModal = (redirectTo?: string) => {
    if (redirectTo) {
      setRedirectAfterLogin(redirectTo);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const login = async (studentId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate inputs
      if (!studentId || !password) {
        return { success: false, error: "학번과 비밀번호를 모두 입력해주세요." };
      }

      // Giả lập / Gọi u-SAINT SSO:
      // Trong môi trường dev, chấp nhận tài khoản sinh viên Soongsil
      // Khi nối API backend thật: POST /api/auth/sso/usaint
      await new Promise((resolve) => setTimeout(resolve, 800)); // Nhẹ nhàng mô phỏng handshake SSO

      // Profile sinh viên chuẩn Soongsil University
      const mockProfile: StudentProfile = {
        studentId: studentId.trim(),
        name: studentId === "20211234" ? "홍길동" : `숭실학우 (${studentId.slice(-4)})`,
        department: "컴퓨터학부",
        faculty: "IT대학",
        email: `${studentId}@soongsil.ac.kr`,
        academicYear: "3",
      };

      const mockToken = `mock_jwt_token_${studentId}_${Date.now()}`;

      // Lưu vào state & localStorage
      setUser(mockProfile);
      setToken(mockToken);
      localStorage.setItem(STORAGE_KEY_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockProfile));

      // Đóng modal
      setIsLoginModalOpen(false);

      // Chuyển hướng sau khi login (mặc định vào /groups)
      const target = redirectAfterLogin || "/groups";
      setRedirectAfterLogin(null);
      router.push(target);

      return { success: true };
    } catch (err) {
      return { success: false, error: "u-SAINT 포털 인증에 실패했습니다. 학번과 비밀번호를 확인해주세요." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {}
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
