"use client";

import GroupCard from "@/components/group/GroupCard";
import { mockGroupCards } from "@/lib/mockData";

const GroupPage = () => {
  const groups = mockGroupCards;

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
