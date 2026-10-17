/**
 * Module hỗ trợ tương tác với cổng trường u-SAINT thông qua usaint-lib.
 * Được sử dụng trong Next.js API Route (BFF).
 *
 * Chức năng:
 * 1. authenticateUsaint: Xác thực tài khoản với cổng trường u-SAINT SSO (MYSAPSSO2).
 * 2. fetchStudentProfileFromSap: Lấy thông tin sinh viên từ ứng dụng SAP WDA (ZCMW1001n).
 */

import { SapSsoClient, SapWdaClient } from "usaint-lib";
import type { UsaintLoginResult, StudentProfile } from "@/lib/types";

export type { UsaintLoginResult };

/**
 * Bảng mã định danh điều khiển (Control IDs) trong ứng dụng SAP ZCMW1001 (Thông tin sinh viên).
 * Nguồn: Cổng trường Soongsil u-SAINT WDA.
 */
export const SAP_STUDENT_INFO_CONTROL_IDS = {
  STUDENT_ID: "ZCMW1001.ID_0001:VIW_DEFAULT.STUDENT12", // Mã số sinh viên (VD: "20211234")
  LAST_NAME: "ZCMW1001.ID_0001:VIW_DEFAULT.NACHN", // Họ tiếng Hàn
  FIRST_NAME: "ZCMW1001.ID_0001:VIW_DEFAULT.VORNA", // Tên tiếng Hàn
  ENGLISH_NAME: "ZCMW1001.ID_0001:VIW_DEFAULT.RUFNM", // Tên tiếng Anh
  HANJA_NAME: "ZCMW1001.ID_0001:VIW_DEFAULT.BIRTHNAME", // Tên chữ Hán (Hanja)
  STATUS: "ZCMW1001.ID_0001:VIW_DEFAULT.STAT", // Trạng thái học vụ (재학, 휴학...)
  FACULTY: "ZCMW1001.ID_0001:VIW_DEFAULT.COLEG_TXT", // Viện / Trường chủ quản (단과대학, VD: "IT대학")
  DEPARTMENT: "ZCMW1001.ID_0001:VIW_DEFAULT.DEPT_TXT", // Khoa / Ngành (학부/학과, VD: "소프트웨어학부")
  CLASS: "ZCMW1001.ID_0001:VIW_DEFAULT.TITEL", // Lớp / Chức danh sinh viên
  YEAR: "ZCMW1001.ID_0001:VIW_DEFAULT.CMSTYEAR", // Năm học hiện tại (1, 2, 3, 4)
  SEMESTER: "ZCMW1001.ID_0001:VIW_DEFAULT.ZSCHTERM", // Học kỳ (1학기, 2학기)
  EMAIL: "ZCMW1001.ID_0001:VIW_DEFAULT.SMTP_ADDR", // Email trường @soongsil.ac.kr
  AVATAR: "ZCMW1001.ID_0001:VIW_DEFAULT.ST_IMAGE", // Ảnh thẻ sinh viên
  ADMISSION_DATE: "ZCMW1001.ID_0001:VIW_DEFAULT.TC_DEFAULT_APPLY_DT", // Ngày nhập học
} as const;

/**
 * Trích xuất giá trị văn bản từ một SAP Control theo ID.
 */
function getControlValue(wda: SapWdaClient, id: string): string {
  try {
    const control = wda.getControlById<any>(id);
    if (!control) return "";
    const val = control.value || control.text || "";
    return String(val).trim();
  } catch {
    return "";
  }
}

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
      errorCode: "MISSING_FIELDS",
      error: "Mã số sinh viên và mật khẩu là bắt buộc.",
    };
  }

  try {
    const ssoClient = new SapSsoClient();
    const sessionString = await ssoClient.login(studentId, password);

    // Kiểm tra tính hợp lệ của cookie MYSAPSSO2
    if (!sessionString || !sessionString.includes("MYSAPSSO2")) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        error: "Sai mã số sinh viên hoặc mật khẩu u-SAINT.",
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
      errorCode: "SERVER_ERROR",
      error: message || "Lỗi kết nối tới máy chủ SSO Soongsil u-SAINT.",
    };
  }
}

/**
 * Bước 4: Lấy hồ sơ thông tin sinh viên từ ứng dụng SAP WDA (ZCMW1001n).
 *
 * @param sessionCookies Chuỗi Cookie chứa MYSAPSSO2 nhận được sau khi đăng nhập thành công
 * @param fallbackStudentId Mã số sinh viên dự phòng nếu SAP không trả về ID
 * @returns Thông tin sinh viên StudentProfile đã được trích xuất và chuẩn hóa
 */
export async function fetchStudentProfileFromSap(
  sessionCookies: string,
  fallbackStudentId?: string,
): Promise<StudentProfile | null> {
  if (!sessionCookies) return null;

  try {
    // 1. Khởi tạo SapWdaClient kết nối tới máy chủ ECC của Soongsil u-SAINT
    const wda = new SapWdaClient(
      "https://ecc.ssu.ac.kr:8443",
      "ZCMW1001n", // Mã ứng dụng thông tin sinh viên
      sessionCookies,
    );

    // 2. Bắt tay (handshake) và khởi tạo session WDA
    const initResult = await wda.initialize();
    if (!initResult.isSuccess) {
      console.warn("Không thể khởi tạo phiên SAP WDA ZCMW1001n:", initResult);
      return null;
    }

    // 3. Trích xuất các trường dữ liệu theo bảng CONTROL_IDS
    const studentId =
      getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.STUDENT_ID) ||
      fallbackStudentId ||
      "";
    const lastName = getControlValue(
      wda,
      SAP_STUDENT_INFO_CONTROL_IDS.LAST_NAME,
    );
    const firstName = getControlValue(
      wda,
      SAP_STUDENT_INFO_CONTROL_IDS.FIRST_NAME,
    );
    const englishName = getControlValue(
      wda,
      SAP_STUDENT_INFO_CONTROL_IDS.ENGLISH_NAME,
    );
    const fullName =
      `${lastName}${firstName}`.trim() ||
      englishName ||
      `숭실학우 (${studentId.slice(-4)})`;

    const department =
      getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.DEPARTMENT) ||
      "소프트웨어학부";
    const faculty =
      getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.FACULTY) || "IT대학";
    const academicYear =
      getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.YEAR) || "1";
    const semester = getControlValue(
      wda,
      SAP_STUDENT_INFO_CONTROL_IDS.SEMESTER,
    );
    const status = getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.STATUS);
    const rawEmail = getControlValue(wda, SAP_STUDENT_INFO_CONTROL_IDS.EMAIL);
    const email = rawEmail || (studentId ? `${studentId}@soongsil.ac.kr` : "");

    // 4. Trích xuất ảnh thẻ sinh viên (Avatar) nếu có
    let avatarUrl: string | undefined;
    try {
      const avatarSelector = `img[id="${SAP_STUDENT_INFO_CONTROL_IDS.AVATAR}"]`;
      const avatarEl = wda.$(avatarSelector);
      if (avatarEl.length > 0) {
        const lsDataStr = avatarEl.attr("lsdata") || "";
        // lsdata thường có dạng: {1:'100px', 2:'110px', 3:'http\x3a\x2f\x2f...', 19:'TOP'}
        const urlMatch = lsDataStr.match(/3:'([^']+)'/);
        if (urlMatch && urlMatch[1]) {
          const rawUrl = urlMatch[1].replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)),
          );

          // Tải ảnh trực tiếp từ server để chuyển thành Base64 Data URL (tránh lỗi CORS)
          const imgRes = await fetch(rawUrl, {
            headers: {
              Cookie: sessionCookies,
            },
          });

          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            const contentType =
              imgRes.headers.get("content-type") || "image/jpeg";
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            avatarUrl = `data:${contentType};base64,${base64}`;
          } else {
            avatarUrl = rawUrl;
          }
        }
      }
    } catch (avatarError) {
      console.warn("Không thể tải ảnh thẻ sinh viên từ u-SAINT:", avatarError);
    }

    const profile: StudentProfile = {
      studentId,
      name: fullName,
      department,
      faculty,
      academicYear,
      email,
      status: status || undefined,
      semester: semester || undefined,
      avatarUrl,
    };

    return profile;
  } catch (error) {
    console.error("Lỗi khi trích xuất thông tin sinh viên từ SAP WDA:", error);
    return null;
  }
}
