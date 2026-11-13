import type { SupportedLanguage } from "@/lib/types";

// Chỉ hiển thị 4 số cuối MSSV trên giao diện nhóm công khai, giữ nguyên số 0 đầu phần đuôi.
export const maskStudentId = (studentId: string): string =>
  studentId.replace(/.(?=.{4})/g, "*");

// So sánh toàn bộ MSSV, không dùng tên hoặc 4 số cuối để nhận diện chủ tài khoản.
export const visibleStudentId = (studentId: string, viewerStudentId?: string): string =>
  viewerStudentId && studentId === viewerStudentId ? studentId : maskStudentId(studentId);

// Ẩn cả liên kết email nếu địa chỉ chứa nguyên MSSV của người khác.
export const visibleStudentEmail = (
  email?: string | null,
  studentId?: string | null,
  viewerStudentId?: string,
): string | undefined => {
  if (!email) return undefined;
  if (studentId && email.includes(studentId) && studentId !== viewerStudentId) return undefined;
  // Backend có thể đã che MSSV; vẫn kiểm tra email dạng <MSSV>@soongsil.ac.kr.
  const localPart = email.split("@")[0];
  if (/^\d{8}$/.test(localPart) && localPart !== viewerStudentId) return undefined;
  return email;
};

// Tiện ích định dạng chuỗi hiển thị theo ngôn ngữ hiện tại (i18n).

const LOCALES: Record<SupportedLanguage, string> = {
  en: "en-US",
  ko: "ko-KR",
  vi: "vi-VN",
};

// Thay các token {key} trong chuỗi từ điển. VD: formatMessage("Year {year}", { year: 3 }) → "Year 3".
export const formatMessage = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "week", seconds: 60 * 60 * 24 * 7 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
];

// ISO-8601 → ngày giờ theo múi giờ Asia/Seoul (VD: "Nov 4, 2026, 9:30 AM"). Giữ nguyên chuỗi nếu không parse được.
export const formatSeoulDateTime = (iso: string, language: SupportedLanguage): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[language], {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

// ISO-8601 → "2 hours ago" / "2시간 전" / "2 giờ trước". Giữ nguyên chuỗi nếu không parse được.
export const formatRelativeTime = (iso: string, language: SupportedLanguage): string => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return iso;

  const diffSeconds = Math.round((time - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(LOCALES[language], { numeric: "auto" });
  for (const { unit, seconds } of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return formatter.format(diffSeconds, "second");
};
