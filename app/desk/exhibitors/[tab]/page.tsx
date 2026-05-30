"use client";

import { useParams, useRouter } from "next/navigation";
import { ExhibitorsPortal } from "@/components/exhibitors/ExhibitorsPortal";
import { DESK_EXHIBITOR_TABS, type DeskExhibitorTab } from "@/components/exhibitors/exhibitor-portal-config";

export default function DeskExhibitorsTabPage() {
  const params = useParams();
  const router = useRouter();
  const raw = typeof params.tab === "string" ? params.tab.toLowerCase() : "exhibitors";
  const activeTab: DeskExhibitorTab = DESK_EXHIBITOR_TABS.includes(raw as DeskExhibitorTab)
    ? (raw as DeskExhibitorTab)
    : "exhibitors";

  return (
    <ExhibitorsPortal
      basePath="/desk/exhibitors"
      activeTab={activeTab}
      onTabChange={(tab) => router.push(`/desk/exhibitors/${tab}`)}
      variant="desk"
      tabIds={DESK_EXHIBITOR_TABS}
    />
  );
}
