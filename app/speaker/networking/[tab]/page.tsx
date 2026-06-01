"use client";

import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NetworkingModule } from "@/components/networking/NetworkingModule";

const VALID_TABS = ["directory", "requests", "connections", "messages"] as const;
type TabKey = (typeof VALID_TABS)[number];

export default function SpeakerNetworkingTabPage() {
  const params = useParams();
  const router = useRouter();
  const session = getSession();
  const rawTab = typeof params.tab === "string" ? params.tab.toLowerCase() : "directory";
  const activeTab: TabKey = VALID_TABS.includes(rawTab as TabKey) ? (rawTab as TabKey) : "directory";

  return (
    <NetworkingModule
      userEmail={session?.email ?? ""}
      userName={session?.name ?? ""}
      subtitle="Discover delegates, connect, and chat after acceptance. Set directory visibility in Profile."
      activeTab={activeTab}
      onTabChange={(tab) => router.push(`/speaker/networking/${tab}`)}
    />
  );
}
