"use client";

import { useState } from "react";
import ApplicationCard from "@/components/application/ApplicationCard";
import { mockApplicants } from "@/lib/mockData";

const ManagePage = () => {
  const [applicants, setApplicants] = useState(mockApplicants);

  // Khi có API thật: gọi API accept/reject rồi mới cập nhật danh sách.
  const removeApplicant = (id: string) =>
    setApplicants((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        Manage Applications
      </h1>
      {applicants.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No pending applications.</p>
      ) : (
        <div className="space-y-4">
          {applicants.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAccept={removeApplicant}
              onReject={removeApplicant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePage;
