import type { SupportedLanguage } from "@/lib/types";

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
