import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OrganizationApplication } from "@/lib/store";

export function OrgAppDetailDialog({
  app,
  open,
  onOpenChange,
}: {
  app: OrganizationApplication | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {app.participation === "sponsor" ? "Sponsor" : app.participation === "both" ? "Exhibitor + Sponsor" : "Exhibitor"} — {app.companyName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground uppercase">Contact</div>
              <div>{app.contactName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Email</div>
              <div>{app.contactEmail}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Phone</div>
              <div>{app.contactPhone || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Org type</div>
              <div className="capitalize">{app.orgType}</div>
            </div>
          </div>
          {app.sponsorshipTier && (
            <div>
              <div className="text-xs text-muted-foreground uppercase">Sponsorship tier</div>
              <div>{app.sponsorshipTier}</div>
            </div>
          )}
          {app.boothPreference && (
            <div>
              <div className="text-xs text-muted-foreground uppercase">Booth preference</div>
              <div>{app.boothPreference}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground uppercase">Description</div>
            <p className="mt-1">{app.description}</p>
          </div>
          {app.website && (
            <div>
              <div className="text-xs text-muted-foreground uppercase">Website</div>
              <a href={app.website} className="text-accent hover:underline">
                {app.website}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
