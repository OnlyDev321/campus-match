"use client";

import { useEffect, useState } from "react";
import { Card } from "@/design-system";
import { ScrambleText } from "@/design-system/components/ScrambleText";
import { getPublicStatistics } from "@/services/statisticsService";
import { useLanguageStore } from "@/stores/languageStore";
import type { PublicStatistics as PublicStatisticsData } from "@/lib/types";

const REFRESH_INTERVAL = 60_000;
const REQUEST_TIMEOUT = 8_000;

export default function PublicStatistics() {
  const { t, language } = useLanguageStore();
  const [data, setData] = useState<PublicStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    let activeRequest: AbortController | null = null;

    const refresh = async () => {
      if (document.visibilityState === "hidden" || activeRequest) return;
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      try {
        const result = await getPublicStatistics(controller.signal);
        if (!disposed) setData(result);
      } catch {
        if (!disposed) setData(null);
      } finally {
        window.clearTimeout(timeout);
        activeRequest = null;
        if (!disposed) setLoading(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      disposed = true;
      activeRequest?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const formatter = new Intl.NumberFormat(language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US");
  const metrics = [
    { value: data?.verifiedStudents, label: t.landing.statsStudents, color: "text-(--primary)" },
    { value: data?.recruitingGroups, label: t.landing.statsGroups, color: "text-(--success)" },
    { value: data?.fullGroups, label: t.landing.statsFullGroups, color: "text-[color-mix(in_srgb,var(--primary)_65%,var(--error))]" },
  ];

  return (
    <section aria-label={t.landing.statsTitle} aria-busy={loading} className="w-full border-t border-(--border) bg-(--surface-container-low) px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="space-y-2 p-6 text-center">
              <div className={`flex min-h-10 items-center justify-center font-mono text-3xl font-extrabold tabular-nums sm:min-h-11 sm:text-4xl ${metric.color}`}>
                {loading ? (
                  <span aria-hidden="true" className="h-9 w-28 rounded-md bg-(--surface-container-high) motion-safe:animate-pulse" />
                ) : metric.value === undefined ? "—" : formatter.format(metric.value)}
              </div>
              <p className="text-xs font-semibold leading-relaxed text-(--text-secondary)">
                <ScrambleText text={metric.label} />
              </p>
            </Card>
          ))}
        </div>
        {loading && <p className="sr-only" role="status">{t.landing.statsLoading}</p>}
        {!loading && !data && (
          <p role="status" className="text-center text-xs leading-relaxed text-(--text-secondary)">
            <ScrambleText text={t.landing.statsUnavailable} />
          </p>
        )}
      </div>
    </section>
  );
}
