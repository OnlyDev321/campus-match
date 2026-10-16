/**
 * Module hỗ trợ tương tác với cổng trường u-SAINT thông qua usaint-lib.
 * Được sử dụng trong Next.js API Route (BFF).
 */

import { SapSsoClient } from "usaint-lib";
import type { UsaintLoginResult } from "@/lib/types";
export type { UsaintLoginResult };


/**
 * Xác thực thông tin sinh viên với cổng trường Soongsil u-SAINT SSO.
 *
 * @param studentId Mã số sinh viên (VD: "20211234")
 * @param password Mật khẩu u-SAINT
 * @returns Object chứa trạng thái đăng nhập và chuỗi session cookies chứa MYSAPSSO2
 */
export async function authenticateUsaint(
  studentId: string,
  password: string,
): Promise<UsaintLoginResult> {
  if (!studentId || !password) {
    return {
      success: false,
      error: "Student ID and password are required.",
    };
  }

  try {
    const ssoClient = new SapSsoClient();
    const sessionString = await ssoClient.login(studentId, password);

    // Kiểm tra tính hợp lệ của cookie MYSAPSSO2
    if (!sessionString || !sessionString.includes("MYSAPSSO2")) {
      return {
        success: false,
        error: "Invalid student ID or password.",
      };
    }

    return {
      success: true,
      sessionCookies: sessionString,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return {
      success: false,
      error: message || "Failed to communicate with Soongsil u-SAINT server.",
    };
  }
}
