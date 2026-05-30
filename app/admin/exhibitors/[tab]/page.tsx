"use client";

import { useParams, useRouter } from "next/navigation";
import { ExhibitorsPortal } from "@/components/exhibitors/ExhibitorsPortal";
import {
  ADMIN_EXHIBITOR_TABS,
  type AdminExhibitorTab,
} from "@/components/exhibitors/exhibitor-portal-config";

export default function AdminExhibitorsTabPage() {
  const params = useParams();
  const router = useRouter();
  const raw = typeof params.tab === "string" ? params.tab.toLowerCase() : "exhibitors";
  const activeTab: AdminExhibitorTab = ADMIN_EXHIBITOR_TABS.includes(raw as AdminExhibitorTab)
    ? (raw as AdminExhibitorTab)
    : "exhibitors";

  return (
    <ExhibitorsPortal
      basePath="/admin/exhibitors"
      activeTab={activeTab}
      onTabChange={(tab) => router.push(`/admin/exhibitors/${tab}`)}
      variant="admin"
      tabIds={ADMIN_EXHIBITOR_TABS}
    />
  );
}
