"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useAdminTicketCategories, useCreateExhibitor, useRoles } from "@/hooks/api/useAdmin";
import { useSymposium } from "@/hooks/api/useSymposium";
import {
  usePublicExhibitorPackages,
  useSponsorshipTierPricing,
} from "@/hooks/api/useExhibitor";
import { useBooths, useUpdateBooth } from "@/hooks/api/useBooths";
import { sponsorsService, usersService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import {
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

type OrganizationFormState = {
  ticketPlanId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  jobTitle: string;
  companyName: string;
  orgType: OrgType;
  website: string;
  description: string;
  participation: ApplyParticipationType;
  sponsorshipTier: SponsorshipTier;
  packageId: string;
  staffCount: number;
  staffEmails: string[];
  boothPreference: string;
  preferredBoothId: string;
  boothAssignment: string;
};

const empty = (participation: ApplyParticipationType): OrganizationFormState => ({
  ticketPlanId: "",
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
  onCreated,
}: Props) {
  const store = useStore();
  const countries = store.platformSettings.countries;
  const { symposiumId } = useSymposium();
  const queryClient = useQueryClient();
  const { categories: ticketPlans, isLoading: plansLoading } = useAdminTicketCategories();
  const createExhibitor = useCreateExhibitor();
  const roles = useRoles();
  const { packages, isLoading: packagesLoading } = usePublicExhibitorPackages(symposiumId || undefined);
  const { pricing: tierPricing } = useSponsorshipTierPricing(symposiumId || undefined);
  const { booths } = useBooths(symposiumId);
  const updateBooth = useUpdateBooth();

  const [form, setForm] = useState<OrganizationFormState>(() => empty(defaultParticipation));
  const [staffEmail, setStaffEmail] = useState("");
  const [pickedBooth, setPickedBooth] = useState<PickerBooth | null>(null);

  const createSponsor = useMutation({
    mutationFn: (dto: {
      symposiumId: string;
      name: string;
      tier: "platinum" | "gold" | "silver";
      websiteUrl?: string;
      description?: string;
    }) => sponsorsService.create(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
  });

  const activePackages = useMemo(() => packages.filter((p) => p.isActive), [packages]);
  const exhibitorRoleId = useMemo(
    () => roles.data?.find((r) => r.name.toLowerCase() === "exhibitor")?.id,
    [roles.data],
  );
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

  function splitNameParts(fullName: string) {
    const clean = fullName.trim().replace(/\s+/g, " ");
    if (!clean) return { firstName: "Contact", lastName: "User" };
    const [firstName, ...rest] = clean.split(" ");
    return { firstName, lastName: rest.join(" ") || "User" };
  }

  function randomTempPassword() {
    return `Temp!${Math.random().toString(36).slice(-8)}A1`;
  }

  function resolveBoothId(): string | undefined {
    if (pickedBooth?.id) return pickedBooth.id;
    const code = form.boothAssignment.trim();
    if (!code) return undefined;
    return booths.find((b) => b.code.toLowerCase() === code.toLowerCase())?.id;
  }

  async function markBoothOccupied(boothId: string | undefined) {
    if (!boothId) return;
    const booth = booths.find((b) => b.id === boothId);
    if (booth?.status === "occupied") return;
    try {
      await updateBooth.mutateAsync({ id: boothId, dto: { status: "occupied" } });
    } catch {
      toast.warning("Organization saved, but the booth map status couldn't be synced automatically.");
    }
  }

  async function ensureContactUserId(email: string, contactName: string) {
    const normalized = email.trim().toLowerCase();
    const listed = await usersService.list({ search: normalized, limit: 50 });
    const existing = listed.items.find((u) => u.email?.toLowerCase() === normalized);
    if (existing) return existing.id;

    const { firstName, lastName } = splitNameParts(contactName);
    const created = await usersService.createAdmin({
      email: normalized,
      password: randomTempPassword(),
      firstName,
      lastName,
      roleId: exhibitorRoleId,
      symposiumId: symposiumId ?? undefined,
      sendInvitationEmail: true,
    });
    return created.id;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded yet.");
    if (!form.contactName.trim()) return toast.error("Contact name is required.");
    if (!form.contactEmail.trim()) return toast.error("Contact email is required.");
    if (!form.contactPhone.trim()) return toast.error("Contact phone is required.");
    if (!form.companyName.trim()) return toast.error("Company name is required.");
    if (!form.description.trim()) return toast.error("Description is required.");
    if (isExhibitor && !resolvedPackageId) return toast.error("Select an exhibitor booth package.");
    if (isSponsor && !tierPricing.length) return toast.error("Sponsorship tier pricing is not configured.");

    try {
      const boothId = resolveBoothId();

      if (isExhibitor) {
        const contactUserId = await ensureContactUserId(form.contactEmail, form.contactName);
        await createExhibitor.mutateAsync({
          symposiumId,
          contactUserId,
          packageId: resolvedPackageId || undefined,
          companyName: form.companyName.trim(),
          boothNumber: (pickedBooth?.code ?? form.boothAssignment ?? "").trim() || undefined,
          staffPassQuota: form.staffCount,
        });
        await markBoothOccupied(boothId);
      } else {
        const sponsor = await createSponsor.mutateAsync({
          symposiumId,
          name: form.companyName.trim(),
          tier: form.sponsorshipTier.toLowerCase() as "platinum" | "gold" | "silver",
          websiteUrl: form.website.trim() || undefined,
          description: form.description.trim() || undefined,
        });

        // Sponsorship tiers include a booth — mirror the approved-application flow by
        // creating the linked exhibitor/booth record when a booth was assigned.
        if (boothId || form.boothAssignment.trim()) {
          const contactUserId = await ensureContactUserId(form.contactEmail, form.contactName);
          await createExhibitor.mutateAsync({
            symposiumId,
            contactUserId,
            sponsorId: sponsor.id,
            companyName: form.companyName.trim(),
            boothNumber: (pickedBooth?.code ?? form.boothAssignment ?? "").trim() || undefined,
            staffPassQuota: form.staffCount,
          });
          await markBoothOccupied(boothId);
        }
      }

      toast.success(`${form.companyName.trim()} created as ${participationMeta(form.participation).short}`);
      onOpenChange(false);
      onCreated?.("created");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const meta = participationMeta(form.participation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add organization — {meta.label.toLowerCase()}</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {isSponsor
              ? "Creates a sponsor record in the backend sponsor directory."
              : "Creates an exhibitor record in the backend exhibitor directory."}
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
              Kept in the form for future staff-invite backend support.
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
            <Button
              type="submit"
              className="gradient-blue text-accent-foreground"
              disabled={createExhibitor.isPending || createSponsor.isPending}
            >
              Create & approve {meta.short.toLowerCase()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
