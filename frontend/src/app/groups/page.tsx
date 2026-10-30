"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { GroupCardData } from "@/lib/types";
import GroupCard from "@/components/group/GroupCard";
import { mockGroupCards } from "@/lib/mockData";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getSnapshot = () => {
  try { return localStorage.getItem("campus-match-created-groups") || "[]"; }
  catch { return "[]"; }
};
const GroupPage = () => {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const groups = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(stored);
      const local = Array.isArray(parsed) ? parsed.filter((item): item is GroupCardData =>
        item && typeof item.id === "string" && typeof item.title === "string" &&
        typeof item.course === "string" && typeof item.description === "string" &&
        typeof item.leaderName === "string" && typeof item.leaderMajor === "string" &&
        typeof item.memberCount === "number" && typeof item.maxMembers === "number" &&
        Array.isArray(item.tags) && item.tags.every((tag: unknown) => typeof tag === "string")
      ) : [];
      return [...local, ...mockGroupCards];
    } catch { return mockGroupCards; }
  }, [stored]);

  return (
    <div className="@container w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Groups
        </h1>
      </div>
      <div className="responsive-card-grid">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default GroupPage;
