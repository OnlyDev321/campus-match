import { API_BASE_URL } from "@/lib/api";
import { useLanguageStore } from "@/stores/languageStore";
import type { AcademicCatalog } from "@/lib/types";

export async function getAcademicCatalog(signal?: AbortSignal): Promise<AcademicCatalog> {
  const response = await fetch(`${API_BASE_URL}/academic-units`, {
    signal,
    cache: "no-cache",
    headers: { "Accept-Language": useLanguageStore.getState().language },
  });
  if (!response.ok) throw new Error("CATALOG_UNAVAILABLE");
  const data: AcademicCatalog = await response.json();
  if (!data || !Array.isArray(data.colleges) || data.colleges.length === 0 ||
    !data.colleges.every((college) => college && typeof college.name === "string" && college.name.trim() &&
      Array.isArray(college.departments) && college.departments.every((name) => typeof name === "string" && name.trim()))) {
    throw new Error("INVALID_CATALOG");
  }
  return data;
}
