"use client";

import GroupCard from "@/components/group/GroupCard";
import { mockGroupCards } from "@/lib/mockData";

const GroupPage = () => {
  const groups = mockGroupCards;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        Groups
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default GroupPage;
