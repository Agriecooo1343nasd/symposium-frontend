"use client";

import { useAuth } from "@/hooks/use-auth";
import { GroupDelegationPanel } from "@/components/group/GroupDelegationPanel";
import { getGroupByRepresentativeEmail } from "@/lib/group-registration";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardGroupPage() {
  const { session, ready } = useAuth();
  const router = useRouter();
  const group = session ? getGroupByRepresentativeEmail(session.email) : undefined;

  useEffect(() => {
    if (!ready) return;
    if (!session || !group) router.replace("/dashboard");
  }, [ready, session, group, router]);

  if (!session || !group) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Delegation</h1>
        <p className="text-muted-foreground">
          Track check-in for every delegate in your group. Each person uses their own e-ticket QR at the venue.
        </p>
      </div>
      <GroupDelegationPanel email={session.email} variant="representative" />
    </div>
  );
}
