"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getSession } from "@/lib/auth";
import { isSponsorOrg } from "@/lib/sponsorship-records";
import { SponsorshipRecordPanel } from "@/components/sponsorship/SponsorshipRecordPanel";
import { EditOrganizationDialog } from "@/components/exhibitors/EditOrganizationDialog";

export default function AdminSponsorshipRecordPage() {
  const params = useParams();
  const orgId = typeof params.orgId === "string" ? params.orgId : "";
  const store = useStore();
  const session = getSession();
  const [editOpen, setEditOpen] = useState(false);
  const [, setTick] = useState(0);

  const org = store.approvedOrganizations.find((o) => o.id === orgId);
  if (!org || !isSponsorOrg(org)) notFound();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/exhibitors/sponsors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to sponsorship records
        </Link>
      </Button>

      <SponsorshipRecordPanel
        org={org}
        mode="admin"
        actorName={session?.name ?? "Admin"}
        onEdit={() => setEditOpen(true)}
        onChanged={() => setTick((n) => n + 1)}
      />

      <EditOrganizationDialog
        applicationId={org.applicationId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => setTick((n) => n + 1)}
      />
    </div>
  );
}
