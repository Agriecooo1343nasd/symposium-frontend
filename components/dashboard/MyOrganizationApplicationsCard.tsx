"use client";

import Link from "next/link";
import { Store, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyExhibitorApplications } from "@/hooks/api/useExhibitor";
import { useMySponsorProfile } from "@/hooks/api/useExhibitor";
import { cn } from "@/lib/utils";

function statusClass(status: string) {
  if (status === "approved" || status === "invoiced") return "bg-green/15 text-green";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800";
}

export function MyOrganizationApplicationsCard() {
  const { applications: exhibitorApps, isLoading } = useMyExhibitorApplications();
  const { sponsor } = useMySponsorProfile();

  const hasExhibitorApps = exhibitorApps.length > 0;
  const hasSponsorProfile = Boolean(sponsor);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 text-sm text-muted-foreground">
        Loading your exhibitor / sponsor applications…
      </div>
    );
  }

  if (!hasExhibitorApps && !hasSponsorProfile) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold">Exhibit or sponsor</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Apply for a booth package or a sponsorship tier for NAS 2026.
          </p>
        </div>
        <Button asChild className="gradient-blue text-accent-foreground shrink-0">
          <Link href="/dashboard/apply-exhibit">Apply now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif font-bold">Your organization applications</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/apply-exhibit">New application</Link>
        </Button>
      </div>
      <ul className="space-y-3">
        {exhibitorApps.map((app) => (
          <li key={app.id} className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3">
            <div className="flex items-start gap-3">
              <Store className="h-4 w-4 text-amber-700 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Exhibitor — {app.organizationName}</div>
                <div className="text-xs text-muted-foreground">
                  Submitted {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0", statusClass(app.status))}>
              {app.status}
            </span>
          </li>
        ))}
        {hasSponsorProfile && sponsor && (
          <li className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3">
            <div className="flex items-start gap-3">
              <Award className="h-4 w-4 text-amber-700 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Sponsor — {sponsor.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{sponsor.tier} tier</div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green/15 text-green shrink-0">
              Active
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
