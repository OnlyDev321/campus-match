"use client";

import { use } from "react";
import ManageWorkspace from "@/components/manage/ManageWorkspace";
import type { ManageGroupPageProps } from "@/lib/types";

export default function ManageGroupPage({ params }: ManageGroupPageProps) {
  const { groupId } = use(params);
  return <ManageWorkspace key={groupId} groupId={Number(groupId)} />;
}
