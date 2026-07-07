"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Store, X, Award, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { BoothMapPicker, type PickerBooth } from "@/components/shared/BoothMapPicker";
import { useStore } from "@/hooks/use-store";
import { useAdminTicketCategories } from "@/hooks/api/useAdmin";
import { useSymposium } from "@/hooks/api/useSymposium";
import {
  usePublicExhibitorPackages,
  useSponsorshipTierPricing,
} from "@/hooks/api/useExhibitor";
import { useBooths } from "@/hooks/api/useBooths";
import { getSession } from "@/lib/auth";
import {
  createOrganizationManually,
  type CreateOrganizationInput,
} from "@/lib/create-organization";
import {
  calculatePackageEstimate,
  defaultTierFromPricing,
  type ApplyParticipationType,
} from "@/lib/exhibitor-sponsor-apply";
import type { OrgType, SponsorshipTier } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParticipation?: ApplyParticipationType;
  actorLabel?: string;
  onCreated?: (applicationId: string) => void;
};

const PARTICIPATION_OPTIONS: {
  value: ApplyParticipationType;
  label: string;
  short: string;
  description: string;
  icon: typeof Store;
}[] = [
  {
    value: "exhibitor",
    label: "Exhibitor",
    short: "Exhibitor",
    description: "Booth package on the floor, staff passes, and exhibitor portal.",
    icon: Store,
  },
  {
    value: "sponsor",
    label: "Sponsor",
    short: "Sponsor",
    description: "Platinum / Gold / Silver tier with booth included, branding, and sponsorship invoice.",
    icon: Award,
  },
];

const empty = (participation: ApplyParticipationType): CreateOrganizationInput => ({
  ticketPlanId: "",
  ticketPlanName: "",
  ticketRequiresVerification: false,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  country: "Rwanda",
  jobTitle: "",
  companyName: "",
  orgType: "company",
  website: "",
  description: "",
  participation,
  sponsorshipTier: "Silver",
  packageId: "",
  staffCount: 2,
  staffEmails: [],
  boothPreference: "",
  preferredBoothId: "",
  boothAssignment: "",
});

function participationMeta(p: ApplyParticipationType) {
  return PARTICIPATION_OPTIONS.find((o) => o.value === p) ?? PARTICIPATION_OPTIONS[0];
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  defaultParticipation = "exhibitor",
  actorLabel,
  onCreated,
}: Props) {
  const store = useStore();
  const countries = store.platformSettings.countries;
  const { symposiumId } = useSymposium();
  const { categories: ticketPlans, isLoading: plansLoading } = useAdminTicketCategories();
  const { packages, isLoading: packagesLoading } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const { booths } = useBooths(symposiumId);

  const [form, setForm] = useState<CreateOrganizationInput>(() => empty(defaultParticipation));
  const [staffEmail, setStaffEmail] = useState("");
  const [pickedBooth, setPickedBooth] = useState<PickerBooth | null>(null);

  const activePackages = useMemo(() => packages.filter((p) => p.isActive), [packages]);
  const resolvedPackageId = form.packageId || activePackages[0]?.id || "";
  const isExhibitor = form.participation === "exhibitor";
  const isSponsor = form.participation === "sponsor";

  useEffect(() => {
    if (!open) return;
    setForm(empty(defaultParticipation));
    setStaffEmail("");
    setPickedBooth(null);
  }, [open, defaultParticipation]);

  useEffect(() => {
    if (!tierPricing.length) return;
    setForm((prev) => ({
      ...prev,
      sponsorshipTier: defaultTierFromPricing(tierPricing, prev.sponsorshipTier),
    }));
  }, [tierPricing, open]);

  useEffect(() => {
    if (!activePackages.length) return;
    setForm((prev) => (prev.packageId ? prev : { ...prev, packageId: activePackages[0].id }));
  }, [activePackages, open]);

  const quote = calculatePackageEstimate({
    participation: form.participation,
    tier: form.sponsorshipTier,
    staffCount: form.staffCount,
    packages: activePackages,
    tierPricing,
    selectedPackageId: resolvedPackageId,
  });

  const addStaffEmail = () => {
    const e = staffEmail.trim().toLowerCase();
    if (!e) return;
    if (form.staffEmails.includes(e)) return toast.error("Email already added");
    setForm((f) => ({ ...f, staffEmails: [...f.staffEmails, e] }));
    setStaffEmail("");
  };

  const handleBoothPick = (b: PickerBooth) => {
    setPickedBooth(b);
    setForm((f) => ({
      ...f,
      preferredBoothId: b.id,
      boothPreference: b.code,
      boothAssignment: b.code,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = ticketPlans.find((t) => t.id === form.ticketPlanId);
    const payload: CreateOrganizationInput = {
      ...form,
      packageId: isExhibitor ? resolvedPackageId : undefined,
      ticketPlanName: selectedPlan?.name ?? form.ticketPlanName,
      ticketRequiresVerification: selectedPlan?.requiresVerification ?? false,
      preferredBoothId: pickedBooth?.id ?? form.preferredBoothId,
      boothAssignment: pickedBooth?.code ?? form.boothAssignment,
      quotedFeeUsd: quote.feeUsd,
      approveImmediately: true,
    };
    const actor = actorLabel ?? getSession()?.name ?? "Staff";
    const result = createOrganizationManually(payload, actor);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${payload.companyName} onboarded as ${participationMeta(payload.participation).short}`);
    onOpenChange(false);
    onCreated?.(result.applicationId);
  };

  const meta = participationMeta(form.participation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add organization — {meta.label.toLowerCase()}</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {isSponsor
              ? "Creates comp registration, approved sponsorship application, sponsorship invoice, booth assignment, and portal access."
              : "Creates comp registration, approved exhibitor application, booth assignment, staff invites, and exhibitor portal access."}
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 1 — Application type
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {PARTICIPATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = form.participation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, participation: opt.value }))}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      selected
                        ? "border-accent bg-accent/10 ring-1 ring-accent"
                        : "border-border hover:border-accent/50 hover:bg-secondary/40",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mb-2", selected ? "text-accent" : "text-muted-foreground")} />
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 2 — Primary contact (delegate pass)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Pass category *</Label>
                <Select
                  value={form.ticketPlanId || ""}
                  onValueChange={(id) => {
                    const plan = ticketPlans.find((t) => t.id === id);
                    setForm((f) => ({
                      ...f,
                      ticketPlanId: id,
                      ticketPlanName: plan?.name ?? "",
                      ticketRequiresVerification: plan?.requiresVerification ?? false,
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={plansLoading ? "Loading pass categories…" : "Select delegate pass for contact"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketPlans.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contact name *</Label>
                <Input
                  required
                  placeholder="e.g. Jane Uwimana"
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
                  placeholder="e.g. contact@company.rw"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  placeholder="e.g. +250 788 000 000"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Job title</Label>
                <Input
                  placeholder="e.g. Head of Partnerships"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 3 — {isSponsor ? "Sponsorship & organisation" : "Booth package & organisation"}
            </h3>
            <ExhibitorPackageEstimator
              participation={form.participation}
              tier={form.sponsorshipTier}
              staffCount={form.staffCount}
              onStaffCountChange={(n) => setForm({ ...form, staffCount: n })}
              packages={activePackages}
              tierPricing={tierPricing}
              selectedPackageId={resolvedPackageId}
            />

            {isExhibitor && (
              <div>
                <Label>Exhibitor booth package *</Label>
                <Select
                  value={resolvedPackageId}
                  onValueChange={(v) => setForm({ ...form, packageId: v })}
                  disabled={packagesLoading || !activePackages.length}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={
                        packagesLoading
                          ? "Loading packages…"
                          : activePackages.length
                            ? "Select a booth package"
                            : "No packages — add under Exhibitors → Booth packages"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activePackages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${Number(p.priceUsd).toLocaleString()} · {p.staffPassQuota} staff passes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isSponsor && (
              <div>
                <Label>Sponsorship tier *</Label>
                <Select
                  value={form.sponsorshipTier ?? "Silver"}
                  onValueChange={(v) => setForm({ ...form, sponsorshipTier: v as SponsorshipTier })}
                  disabled={!tierPricing.length}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={tierPricing.length ? "Select Platinum, Gold, or Silver" : "Tier pricing not configured"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tierPricing.map((t) => (
                      <SelectItem key={t.tier} value={t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}>
                        {t.tier} — ${t.amountUsd.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Company name *</Label>
                <Input
                  required
                  placeholder="e.g. Green Harvest Ltd"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Organization type</Label>
                <Select value={form.orgType} onValueChange={(v) => setForm({ ...form, orgType: v as OrgType })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["startup", "ngo", "university", "research", "company"] as const).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  placeholder="https://company.rw"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                required
                rows={3}
                placeholder="Products, innovations, or sponsorship goals for NAS 2026…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 4 — Booth assignment
            </h3>
            <p className="text-sm text-muted-foreground">
              {isSponsor
                ? "Sponsorship tiers include a booth — assign or pick from the floor map."
                : "Assign a booth code or pick from the available floor map."}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Booth code</Label>
                <Input
                  value={form.boothAssignment ?? ""}
                  onChange={(e) => setForm({ ...form, boothAssignment: e.target.value })}
                  placeholder="e.g. A-12"
                  className="mt-1"
                />
              </div>
            </div>
            <BoothMapPicker booths={booths} mode="pick" selectedId={pickedBooth?.id} onSelect={handleBoothPick} />
            {pickedBooth ? (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                <span>
                  Selected: <strong className="font-mono">{pickedBooth.code}</strong>
                </span>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 5 — Booth staff emails
            </h3>
            <p className="text-xs text-muted-foreground">
              Invited colleagues receive comp check-in passes (not the primary contact email).
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="staff@company.com"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStaffEmail())}
              />
              <Button type="button" variant="outline" onClick={addStaffEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.staffEmails.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {form.staffEmails.map((e) => (
                  <li
                    key={e}
                    className="text-xs flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-mono"
                  >
                    {e}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setForm((f) => ({ ...f, staffEmails: f.staffEmails.filter((x) => x !== e) }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Create & approve {meta.short.toLowerCase()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
