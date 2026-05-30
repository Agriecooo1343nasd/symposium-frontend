"use client";

import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NetworkingModule } from "@/components/networking/NetworkingModule";

const VALID_TABS = ["directory", "requests", "connections", "messages"] as const;
type TabKey = (typeof VALID_TABS)[number];

export default function AdminNetworkingTabPage() {
  const params = useParams();
  const router = useRouter();
  const session = getSession();
  const rawTab = typeof params.tab === "string" ? params.tab.toLowerCase() : "directory";
  const activeTab: TabKey = VALID_TABS.includes(rawTab as TabKey) ? (rawTab as TabKey) : "directory";

  return (
    <NetworkingModule
      userEmail={session?.email ?? "admin@nas2026.rw"}
      userName={session?.name ?? "Admin"}
      subtitle="Organizer networking — same directory and messaging as delegates."
      activeTab={activeTab}
      onTabChange={(tab) => router.push(`/admin/networking/${tab}`)}
    />
  );
}
