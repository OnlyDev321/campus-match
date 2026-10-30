/**
 * Module hỗ trợ tương tác với cổng trường u-SAINT thông qua usaint-lib.
 * Được sử dụng trong Next.js API Route (BFF).
 *
 * Chức năng:
 * 1. authenticateUsaint: Xác thực tài khoản với cổng trường u-SAINT SSO (MYSAPSSO2).
 * 2. fetchStudentProfileFromSap: Lấy thông tin sinh viên từ ứng dụng SAP WDA (ZCMW1001n).
 * 3. fetchTimetableWithTimeout: Lấy thời khóa biểu học kỳ hiện tại từ ứng dụng SAP WDA (ZCMW2102).
 */

import { SapSsoClient, SapWdaClient, type SapComboBox } from "usaint-lib";
import {
  TERM_KEYS,
  TIMETABLE_CONTROL_IDS,
  extractRawTimetable,
  parseTimetable,
  resolveSemesterTarget,
  termFromKey,
  unavailableTimetable,
} from "@/lib/timetable";
import type {
  UsaintLoginResult,
  StudentProfile,
  StudentTimetable,
  TimetableSemesterTarget,
} from "@/lib/types";

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
    // Luôn chuẩn hóa email theo đúng mã số sinh viên Soongsil: <studentId>@soongsil.ac.kr
    const email = studentId ? `${studentId}@soongsil.ac.kr` : (rawEmail || "");

    // 4. Trích xuất số điện thoại (휴대전화)
    let phoneNumber: string | undefined;

    const phoneRegex = /(01[016789][-\s]?\d{3,4}[-\s]?\d{4})/;
    const formatPhone = (raw: string): string => {
      const match = raw.match(phoneRegex);
      if (!match) return raw.trim();
      const digits = match[1].replace(/[^\d]/g, "");
      if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return match[1];
    };

    // Bước 4.1: Kiểm tra các Control ID thông dụng trong view mặc định
    const candidatePhoneControlIds = [
      "ZCMW1001.ID_0001:VIW_DEFAULT.HP_NO",
      "ZCMW1001.ID_0001:VIW_DEFAULT.TELNO",
      "ZCMW1001.ID_0001:VIW_DEFAULT.MOB_NUMBER",
      "ZCMW1001.ID_0001:VIW_DEFAULT.TC_DEFAULT_HP_NO",
      "ZCMW1001.ID_0001:VIW_DEFAULT.TC_DEFAULT_TELNO",
      "ZCMW1001.ID_0001:VIW_DEFAULT.TC_DEFAULT_HP",
    ];

    for (const cid of candidatePhoneControlIds) {
      const val = getControlValue(wda, cid);
      if (val && phoneRegex.test(val)) {
        phoneNumber = formatPhone(val);
        break;
      }
    }

    // Bước 4.2: Quét toàn bộ phần tử trong DOM view hiện tại
    if (!phoneNumber) {
      wda.$("input, span, td, div, p").each((_, el) => {
        if (phoneNumber) return;
        const rawVal = wda.$(el).val();
        const text = String(Array.isArray(rawVal) ? rawVal.join(" ") : (rawVal || wda.$(el).text() || "")).trim();
        if (phoneRegex.test(text)) {
          phoneNumber = formatPhone(text);
        }
      });
    }

    // Bước 4.3: Nếu chưa tìm thấy, kích hoạt chuyển sang tab "신상정보" (Personal Info / Liên lạc)
    if (!phoneNumber) {
      try {
        let targetTabId = "";
        let targetTsId = "";

        wda.$('[ct="TAB"], [role="tab"], .urSTTItem').each((_, el) => {
          if (targetTabId) return;
          const text = wda.$(el).text() || "";
          if (text.includes("신상") || text.includes("연락")) {
            targetTabId = wda.$(el).attr("id") || "";
            const tsParent = wda.$(el).closest('[ct="TS"]');
            if (tsParent.length > 0) {
              targetTsId = tsParent.attr("id") || "";
            }
          }
        });

        if (!targetTabId) {
          wda.$("[id]").each((_, el) => {
            if (targetTabId) return;
            const text = wda.$(el).text() || "";
            const id = wda.$(el).attr("id") || "";
            if ((text.includes("신상정보") || text.includes("신상")) && id.includes("TAB")) {
              targetTabId = id;
            }
          });
        }

        if (targetTabId) {
          const { SapEventQueue } = require("usaint-lib/dist/core/event-queue");
          const queue = new SapEventQueue();
          queue.addEvent(
            "ClientInspector_Notify",
            { Id: "WD01", Data: "CssMatchesHtmlVersion:TRUE" },
            { ResponseData: "delta", EnqueueCardinality: "single" },
          );
          queue.addEvent(
            "TabStrip_TabSelect",
            {
              Id: targetTsId || targetTabId,
              Item: targetTabId,
            },
            { ResponseData: "delta", ClientAction: "submit" },
          );
          queue.addFormRequest(`@{"sFocussedId":"${targetTabId}"}`);

          await (wda as any).dispatchEvents(queue);

          wda.$("input, span, td, div, p").each((_, el) => {
            if (phoneNumber) return;
            const rawVal = wda.$(el).val();
            const text = String(Array.isArray(rawVal) ? rawVal.join(" ") : (rawVal || wda.$(el).text() || "")).trim();
            if (phoneRegex.test(text)) {
              phoneNumber = formatPhone(text);
            }
          });
        }
      } catch (tabError) {
        console.warn("Không thể chuyển tab 신상정보 trong SAP WDA:", tabError);
      }
    }

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
      phone: phoneNumber,
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

/** Thời gian chờ tối đa cho việc lấy thời khóa biểu; quá hạn thì trả về trạng thái unavailable (TIMEOUT). */
const TIMETABLE_TIMEOUT_MS = 8000;

/**
 * Đọc năm học / học kỳ đang chọn trên màn hình ZCMW2102 từ 2 dropdown PERYR, PERID.
 * Trả về null nếu không tìm thấy dropdown.
 */
function readSelectedSemester(
  wda: SapWdaClient,
): { target: TimetableSemesterTarget | null; label: string | null } | null {
  const yearBox = wda.getControlById<SapComboBox>(TIMETABLE_CONTROL_IDS.YEAR);
  const termBox = wda.getControlById<SapComboBox>(TIMETABLE_CONTROL_IDS.SEMESTER);
  if (!yearBox || !termBox || !("selectByKey" in yearBox) || !("selectByKey" in termBox)) {
    return null;
  }
  const year = Number(yearBox.selectedKey);
  const term = termFromKey(termBox.selectedKey);
  const label = [yearBox.selectedText, termBox.selectedText].filter(Boolean).join(" ") || null;
  return {
    target: Number.isInteger(year) && year > 0 && term ? { year, term } : null,
    label,
  };
}

/** Chọn một giá trị trên dropdown (gửi đúng 1 sự kiện ComboBox_Select). */
async function selectComboKey(wda: SapWdaClient, id: string, key: string): Promise<boolean> {
  const box = wda.getControlById<SapComboBox>(id);
  if (!box || !("selectByKey" in box)) return false;
  const result = await box.selectByKey(key);
  return result.isSuccess;
}

/**
 * Lấy thời khóa biểu học kỳ hiện tại từ ứng dụng SAP WDA ZCMW2102 (개인수업시간표).
 * - Dùng lại cookie phiên MYSAPSSO2 của lần đăng nhập hiện tại, chỉ chạy phía server (BFF).
 * - Chỉ chọn năm học / học kỳ khi màn hình đang hiển thị học kỳ khác (tối đa 2 sự kiện ComboBox_Select),
 *   không lặp, không thử lại.
 * - Không ném lỗi: mọi lỗi được chuyển thành trạng thái unavailable kèm mã lý do.
 */
export async function fetchTimetableFromSap(
  sessionCookies: string,
  now: Date = new Date(),
): Promise<StudentTimetable> {
  const fetchedAt = now.toISOString();
  try {
    const wda = new SapWdaClient("https://ecc.ssu.ac.kr:8443", "ZCMW2102", sessionCookies);
    const initResult = await wda.initialize();
    if (!initResult.isSuccess) return unavailableTimetable("SCREEN_UNAVAILABLE", fetchedAt);

    const shown = readSelectedSemester(wda);
    if (!shown) return unavailableTimetable("SEMESTER_SELECT_FAILED", fetchedAt);

    // Học kỳ mặc định là "học kỳ xem gần nhất" nên phải so với học kỳ mục tiêu và chọn lại nếu khác.
    const target = resolveSemesterTarget(now, shown.target);
    if (shown.target?.year !== target.year) {
      const ok = await selectComboKey(wda, TIMETABLE_CONTROL_IDS.YEAR, String(target.year));
      if (!ok) return unavailableTimetable("SEMESTER_SELECT_FAILED", fetchedAt);
    }
    if (readSelectedSemester(wda)?.target?.term !== target.term) {
      const ok = await selectComboKey(wda, TIMETABLE_CONTROL_IDS.SEMESTER, TERM_KEYS[target.term]);
      if (!ok) return unavailableTimetable("SEMESTER_SELECT_FAILED", fetchedAt);
    }

    const selected = readSelectedSemester(wda);
    if (selected?.target?.year !== target.year || selected.target.term !== target.term) {
      return unavailableTimetable("SEMESTER_SELECT_FAILED", fetchedAt);
    }

    const semester = { year: target.year, term: target.term, semesterLabel: selected.label };
    const raw = extractRawTimetable(wda.$);
    if (!raw) return { ...unavailableTimetable("TABLE_NOT_FOUND", fetchedAt), ...semester };

    const parsed = parseTimetable(raw);
    return {
      status: parsed.status,
      ...(parsed.reason ? { reason: parsed.reason } : {}),
      ...semester,
      courses: parsed.courses,
      fetchedAt,
    };
  } catch {
    return unavailableTimetable("SCREEN_UNAVAILABLE", fetchedAt);
  }
}

/**
 * Lấy thời khóa biểu với giới hạn thời gian TIMETABLE_TIMEOUT_MS. Promise này không bao giờ bị reject,
 * nên có thể chạy song song với việc lấy hồ sơ mà không ảnh hưởng tới đăng nhập.
 * usaint-lib không hỗ trợ hủy request: khi quá hạn, các request còn lại tự kết thúc ở nền và bị bỏ qua.
 * Chỉ ghi log mã lý do, không bao giờ ghi log nội dung thời khóa biểu hay thông tin đăng nhập.
 */
export async function fetchTimetableWithTimeout(
  sessionCookies: string | undefined,
): Promise<StudentTimetable> {
  if (!sessionCookies) return unavailableTimetable("SCREEN_UNAVAILABLE");

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<StudentTimetable>((resolve) => {
    timer = setTimeout(() => resolve(unavailableTimetable("TIMEOUT")), TIMETABLE_TIMEOUT_MS);
  });
  const work = fetchTimetableFromSap(sessionCookies).catch(() =>
    unavailableTimetable("SCREEN_UNAVAILABLE"),
  );

  const timetable = await Promise.race([work, timeout]);
  clearTimeout(timer);
  if (timetable.status === "unavailable") {
    console.warn(`[timetable] unavailable: ${timetable.reason ?? "UNKNOWN"}`);
  }
  return timetable;
}
