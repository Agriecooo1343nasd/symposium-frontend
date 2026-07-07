"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useSymposium } from "@/hooks/api/useSymposium";
import { usePublicExhibitorPackages, useSponsorshipTierPricing } from "@/hooks/api/useExhibitor";
import { getSession } from "@/lib/auth";
import { updateOrganizationOnboarding } from "@/lib/update-onboarding";
import type { ApplyParticipationType } from "@/lib/exhibitor-sponsor-apply";
import type { OrganizationApplication, OrgType, SponsorshipTier } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function EditOrganizationDialog({ applicationId, open, onOpenChange, onSaved }: Props) {
  const store = useStore();
  const { symposiumId } = useSymposium();
  const { packages } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const activePackages = packages.filter((p) => p.isActive);
  const app = applicationId
    ? store.organizationApplications.find((a) => a.id === applicationId)
    : undefined;
  const org = applicationId
    ? store.approvedOrganizations.find((o) => o.applicationId === applicationId)
    : undefined;
  const [draft, setDraft] = useState<OrganizationApplication | null>(null);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffEmails, setStaffEmails] = useState<string[]>([]);
  const [speakingSlot, setSpeakingSlot] = useState("");
  const [sponsorshipContractRef, setSponsorshipContractRef] = useState("");

  useEffect(() => {
    if (!open || !app) return;
    setDraft({ ...app });
    setStaffEmails(app.staffMemberEmails ?? []);
    setStaffEmail("");
    setSpeakingSlot(org?.speakingSlot ?? "");
    setSponsorshipContractRef(org?.sponsorshipContractRef ?? "");
  }, [open, app, org]);

  if (!applicationId) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const actor = getSession()?.name ?? "Staff";
    const result = updateOrganizationOnboarding(
      {
        applicationId: draft.id,
        companyName: draft.companyName,
        orgType: draft.orgType,
        website: draft.website,
        description: draft.description,
        contactName: draft.contactName,
        contactEmail: draft.contactEmail,
        contactPhone: draft.contactPhone,
        participation: draft.participation === "both" ? "exhibitor" : draft.participation,
        sponsorshipTier: draft.sponsorshipTier,
        packageId: draft.packageId,
        staffCount: draft.staffCount,
        staffEmails,
        boothAssignment: draft.boothAssignment,
        boothPreference: draft.boothPreference,
        speakingSlot,
        sponsorshipContractRef,
      },
      actor,
    );
    if (!result.ok) return toast.error(result.error);
    toast.success("Organization record updated");
    onOpenChange(false);
    onSaved?.();
  };

  const addStaff = () => {
    const e = staffEmail.trim().toLowerCase();
    if (!e || staffEmails.includes(e)) return;
    setStaffEmails([...staffEmails, e]);
    setStaffEmail("");
  };

  if (!draft) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <p className="text-sm text-muted-foreground">Application not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const isSponsor = draft.participation === "sponsor";
  const isExhibitor = draft.participation === "exhibitor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {draft.companyName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Company</Label>
            <Input
              value={draft.companyName}
              onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Participation</Label>
              <Select
                value={draft.participation === "both" ? "exhibitor" : draft.participation}
                onValueChange={(v) => setDraft({ ...draft, participation: v as ApplyParticipationType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Exhibitor or sponsor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exhibitor">Exhibitor</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isExhibitor && (
              <div>
                <Label>Booth package</Label>
                <Select
                  value={draft.packageId ?? ""}
                  onValueChange={(v) => setDraft({ ...draft, packageId: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePackages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isSponsor && (
              <div>
                <Label>Tier</Label>
                <Select
                  value={draft.sponsorshipTier ?? "Silver"}
                  onValueChange={(v) => setDraft({ ...draft, sponsorshipTier: v as SponsorshipTier })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tierPricing.length
                      ? tierPricing.map((t) => (
                          <SelectItem key={t.tier} value={t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}>
                            {t.tier}
                          </SelectItem>
                        ))
                      : store.sponsorshipTiers.map((t) => (
                          <SelectItem key={t.tier} value={t.tier}>
                            {t.tier}
                          </SelectItem>
                        )))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Organisation showcase description…"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact</Label>
              <Input
                placeholder="Contact name"
                value={draft.contactName}
                onChange={(e) => setDraft({ ...draft, contactName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="contact@company.rw"
                value={draft.contactEmail}
                onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Booth</Label>
            <Input
              placeholder="e.g. A-12"
              value={draft.boothAssignment ?? ""}
              onChange={(e) => setDraft({ ...draft, boothAssignment: e.target.value })}
              className="mt-1"
            />
          </div>
          {isSponsor && (
            <>
              <div>
                <Label>Speaking slot</Label>
                <Input
                  value={speakingSlot}
                  onChange={(e) => setSpeakingSlot(e.target.value)}
                  placeholder="e.g. Day 1 · Exhibitor showcase (14:30, Hall B)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Sponsorship contract ref</Label>
                <Input
                  value={sponsorshipContractRef}
                  onChange={(e) => setSponsorshipContractRef(e.target.value)}
                  placeholder="e.g. NAS26-SP-AGRI-0042"
                  className="mt-1"
                />
              </div>
            </>
          )}
          <div>
            <Label>Staff count</Label>
            <Input
              type="number"
              min={1}
              value={draft.staffCount ?? 2}
              onChange={(e) => setDraft({ ...draft, staffCount: parseInt(e.target.value, 10) || 1 })}
              className="mt-1 max-w-[100px]"
            />
          </div>
          <div>
            <Label>Staff emails</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStaff())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addStaff}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="flex flex-wrap gap-1.5 mt-2">
              {staffEmails.map((e) => (
                <li key={e} className="text-[10px] font-mono bg-secondary rounded-full px-2 py-0.5 flex items-center gap-1">
                  {e}
                  <button type="button" onClick={() => setStaffEmails(staffEmails.filter((x) => x !== e))}>
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
