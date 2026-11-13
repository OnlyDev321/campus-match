import { API_BASE_URL } from "@/lib/api";
import { useLanguageStore } from "@/stores/languageStore";
import type { PublicStatistics } from "@/lib/types";

/** API công khai: không gửi token, không chuyển sang số liệu mock nếu backend lỗi. */
export async function getPublicStatistics(signal?: AbortSignal): Promise<PublicStatistics> {
  const response = await fetch(`${API_BASE_URL}/statistics`, {
    signal,
    cache: "no-store",
    headers: { "Accept-Language": useLanguageStore.getState().language },
  });
  if (!response.ok) throw new Error("STATISTICS_UNAVAILABLE");
  const data: PublicStatistics = await response.json();
  if (!data || ![data.verifiedStudents, data.recruitingGroups, data.fullGroups]
    .every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("INVALID_STATISTICS");
  }
  return data;
}
