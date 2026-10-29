import { NextRequest, NextResponse } from "next/server";
import { authenticateUsaint, fetchStudentProfileFromSap } from "@/lib/usaint";
import type { SupportedLanguage, StudentProfile } from "@/lib/types";

const MESSAGES = {
  MISSING_FIELDS: {
    ko: "학번과 비밀번호를 모두 입력해주세요.",
    en: "Please enter both student ID and password.",
    vi: "Mã số sinh viên và mật khẩu u-SAINT là bắt buộc.",
  },
  INVALID_CREDENTIALS: {
    ko: "학번 또는 u-SAINT 비밀번호가 올바르지 않습니다.",
    en: "Invalid student ID or u-SAINT password.",
    vi: "Sai mã số sinh viên hoặc mật khẩu u-SAINT.",
  },
  SERVER_ERROR: {
    ko: "u-SAINT 포털 서버와 통신 중 오류가 발생했습니다.",
    en: "Failed to connect to the u-SAINT portal server.",
    vi: "Đã xảy ra lỗi máy chủ trong quá trình xác thực u-SAINT.",
  },
  SUCCESS: {
    ko: "u-SAINT 포털 인증에 성공했습니다.",
    en: "u-SAINT login successful.",
    vi: "Đăng nhập u-SAINT thành công.",
  },
};

function getLanguage(
  req: NextRequest,
  bodyLanguage?: string,
): SupportedLanguage {
  if (bodyLanguage === "vi" || bodyLanguage === "en" || bodyLanguage === "ko") {
    return bodyLanguage;
  }
  const headerLang = req.headers.get("accept-language")?.toLowerCase() || "";
  if (headerLang.startsWith("vi")) return "vi";
  if (headerLang.startsWith("en")) return "en";
  return "ko";
}

/**
 * API ROUTE: /api/auth/usaint (Phương thức POST)
 * Cổng xác thực BFF (Backend-For-Frontend) đăng nhập với hệ thống u-SAINT SSO.
 */
export async function POST(req: NextRequest) {
  let lang: SupportedLanguage = "ko";
  try {
    // 1. Tiếp nhận Request & bóc tách studentId và password
    const body = await req.json();
    const { studentId, password, language } = body || {};
    lang = getLanguage(req, language);

    // 2. Kiểm tra đầu vào (Validation)
    if (!studentId || !password) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "MISSING_FIELDS",
          error: MESSAGES.MISSING_FIELDS[lang],
        },
        { status: 400 },
      );
    }

    // 3. Gọi hàm xác thực qua usaint-lib
    const authResult = await authenticateUsaint(
      String(studentId).trim(),
      String(password),
    );

    // 4. Kiểm tra kết quả (Nếu không có vé MYSAPSSO2 hoặc sai thông tin)
    if (!authResult.success) {
      const code =
        (authResult.errorCode as keyof typeof MESSAGES) ||
        "INVALID_CREDENTIALS";
      const message = MESSAGES[code]
        ? MESSAGES[code][lang]
        : MESSAGES.INVALID_CREDENTIALS[lang];

      return NextResponse.json(
        {
          success: false,
          errorCode: code,
          error: message,
        },
        { status: 401 },
      );
    }

    // 5. Xác thực thành công: Lấy thông tin sinh viên từ SAP WDA
    let profile: StudentProfile | null = null;
    if (authResult.sessionCookies) {
      profile = await fetchStudentProfileFromSap(
        authResult.sessionCookies,
        String(studentId).trim(),
      );
    }

    // Fallback profile nếu WDA không lấy được thông tin chi tiết
    if (!profile) {
      profile = {
        studentId: String(studentId).trim(),
        name: `숭실학우 (${String(studentId).trim().slice(-4)})`,
        department: "소프트웨어학부",
        faculty: "IT대학",
        academicYear: "3",
        email: `${String(studentId).trim()}@soongsil.ac.kr`,
      };
    }

    // BÀN GIAO THÔNG TIN SANG SPRING BOOT BACKEND ĐỂ LƯU VÀ LẤY JWT ---
    let backendToken: string | null = null;
    try {
      const backendUrl =
        process.env.SPRING_BOOT_API_URL || "http://localhost:8080";
      const springBootRes = await fetch(`${backendUrl}/api/auth/sso/usaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.studentId,
          name: profile.name,
          department: profile.department,
          faculty: profile.faculty,
          email: profile.email,
          academicYear: profile.academicYear,
          phoneNumber: profile.phone || "",
          avatarUrl: profile.avatarUrl || "",
        }),
      });

      if (springBootRes.ok) {
        const springBootData = await springBootRes.json();
        backendToken = springBootData.token;
      } else {
        console.warn("Spring Boot phản hồi mã lỗi HTTP:", springBootRes.status);
      }
    } catch (backendError) {
      console.warn(
        "Không kết nối được Spring Boot (server chưa bật hoặc lỗi mạng):",
        backendError,
      );
      // Token dự phòng nếu Spring Boot chưa bật trong lúc phát triển frontend độc lập
      backendToken = `jwt_usaint_${profile.studentId}_${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS[lang],
      studentId: String(studentId).trim(),
      profile,
      token: backendToken,
    });
  } catch (error) {
    console.error("Lỗi hệ thống khi xử lý xác thực u-SAINT:", error);
    return NextResponse.json(
      {
        success: false,
        errorCode: "SERVER_ERROR",
        error: MESSAGES.SERVER_ERROR[lang],
      },
      { status: 500 },
    );
  }
}
