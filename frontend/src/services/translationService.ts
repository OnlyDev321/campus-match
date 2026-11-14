import { useLanguageStore } from "@/stores/languageStore";
import type { GroupTranslationContent, TranslationErrorCode } from "@/lib/types";

const translationErrorCodes: ReadonlySet<string> = new Set<TranslationErrorCode>([
  "TRANSLATION_BUSY",
  "TRANSLATION_NOT_CONFIGURED",
  "TRANSLATION_RATE_LIMITED",
  "TRANSLATION_CREDITS_EXHAUSTED",
  "TRANSLATION_ACCESS_DENIED",
  "TRANSLATION_FAILED",
]);

const isTranslationErrorCode = (value: unknown): value is TranslationErrorCode =>
  typeof value === "string" && translationErrorCodes.has(value);

export class TranslationError extends Error {
  constructor(readonly code: TranslationErrorCode) { super(code); }
}

export async function translateGroupContent(
  content: GroupTranslationContent,
  targetLang: string,
  signal?: AbortSignal,
): Promise<GroupTranslationContent> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": useLanguageStore.getState().language },
      body: JSON.stringify({ content, targetLang }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new TranslationError(isTranslationErrorCode(data.errorCode) ? data.errorCode : "TRANSLATION_FAILED");
    }
    if (typeof data.content?.title !== "string" || !data.content.title.trim() ||
      typeof data.content?.description !== "string" || !data.content.description.trim()) throw new TranslationError("TRANSLATION_FAILED");
    return {
      title: data.content.title,
      description: data.content.description,
      objectives: Array.isArray(data.content.objectives)
        ? data.content.objectives.filter((s: unknown): s is string => typeof s === "string")
        : undefined,
      meetingSchedule: typeof data.content.meetingSchedule === "string"
        ? data.content.meetingSchedule
        : undefined,
      rolesQuota: Array.isArray(data.content.rolesQuota)
        ? data.content.rolesQuota
            .filter(
              (r: unknown): r is { role: string; description?: string } =>
                Boolean(r && typeof r === "object" && typeof (r as { role?: unknown }).role === "string")
            )
            .map((r: { role: string; description?: string }) => ({
              role: String(r.role),
              description: typeof r.description === "string" ? r.description : undefined,
            }))
        : undefined,
    };
  } catch (error) {
    if (error instanceof TranslationError) throw error;
    throw new TranslationError("TRANSLATION_FAILED");
  }
}
