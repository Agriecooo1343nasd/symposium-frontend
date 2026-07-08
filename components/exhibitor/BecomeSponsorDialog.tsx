"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useCreateSponsorshipApplication, useSponsorshipTierPricing } from "@/hooks/api/useExhibitor";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import type { ExhibitorProfileDto } from "@/lib/api/dto";

type DesiredTier = "platinum" | "gold" | "silver";
const TIER_ORDER: DesiredTier[] = ["platinum", "gold", "silver"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ExhibitorProfileDto | null | undefined;
  onSubmitted?: () => void;
};

export function BecomeSponsorDialog({ open, onOpenChange, profile, onSubmitted }: Props) {
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { pricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const createApplication = useCreateSponsorshipApplication();

  const [form, setForm] = useState({
    organizationName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    desiredTier: "gold" as DesiredTier,
    message: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      organizationName: profile?.companyName ?? profile?.sponsorName ?? "",
      contactName: session?.name ?? "",
      contactEmail: session?.email ?? "",
      contactPhone: "",
      desiredTier: "gold",
      message: "",
    });
  }, [open, profile?.companyName, profile?.sponsorName, session?.name, session?.email]);

  const tierOptions: DesiredTier[] =
    pricing.length > 0
      ? (pricing
          .map((p) => p.tier.toLowerCase())
          .filter((t): t is DesiredTier => TIER_ORDER.includes(t as DesiredTier)))
      : TIER_ORDER;
  const tierAmount = (tier: DesiredTier) =>
    pricing.find((p) => p.tier.toLowerCase() === tier)?.amountUsd ?? null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded — please retry.");
    if (!form.organizationName.trim()) return toast.error("Organisation name is required");
    if (!form.contactName.trim()) return toast.error("Contact name is required");
    if (!form.contactEmail.trim()) return toast.error("Contact email is required");
    try {
      await createApplication.mutateAsync({
        symposiumId,
        organizationName: form.organizationName.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        desiredTier: form.desiredTier,
        message: form.message.trim() || undefined,
        wantsExhibitorBooth: true,
        staffCount: profile?.staffPassQuota,
      });
      toast.success("Sponsorship application submitted — the secretariat will review it shortly.");
      onOpenChange(false);
      onSubmitted?.();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to become a sponsor</DialogTitle>
          <DialogDescription>
            Upgrade your participation to a sponsorship. The secretariat reviews your application and issues a proforma
            invoice once approved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Sponsorship tier *</Label>
            <Select value={form.desiredTier} onValueChange={(v) => setForm({ ...form, desiredTier: v as DesiredTier })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((tier) => {
                  const amt = tierAmount(tier);
                  return (
                    <SelectItem key={tier} value={tier} className="capitalize">
                      <span className="capitalize">{tier}</span>
                      {amt != null ? ` — $${amt.toLocaleString()}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Organisation name *</Label>
            <Input
              required
              value={form.organizationName}
              onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              className="mt-1"
              placeholder="Your organisation"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Contact name *</Label>
              <Input
                required
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Contact email *</Label>
              <Input
                required
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Contact phone</Label>
            <Input
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="mt-1"
              placeholder="+250 7XX XXX XXX"
            />
          </div>

          <div>
            <Label>Message to the secretariat</Label>
            <Textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1"
              placeholder="Tell us about your sponsorship goals, deliverables, or questions (optional)."
            />
          </div>

          <p className="text-sm rounded-lg border bg-secondary/40 px-3 py-2 text-muted-foreground">
            Your sponsorship tier includes an exhibitor booth on the floor
            {profile?.boothNumber ? ` (you currently hold booth ${profile.boothNumber})` : ""}.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createApplication.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={createApplication.isPending}>
              {createApplication.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" /> Submitting…
                </>
              ) : (
                "Submit application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
