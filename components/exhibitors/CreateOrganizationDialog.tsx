"use client";

import { useEffect, useState } from "react";
import { Plus, Store, X, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { useStore } from "@/hooks/use-store";
import { getSession } from "@/lib/auth";
import {
  createOrganizationManually,
  type CreateOrganizationInput,
} from "@/lib/create-organization";
import type { OrgType, ParticipationType, SponsorshipTier, TicketPlan } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParticipation?: ParticipationType;
  actorLabel?: string;
  onCreated?: (applicationId: string) => void;
};

const PARTICIPATION_OPTIONS: {
  value: ParticipationType;
  label: string;
  short: string;
  description: string;
  icon: typeof Store;
}[] = [
  {
    value: "exhibitor",
    label: "Exhibitor booth",
    short: "Exhibitor",
    description: "Floor booth, staff passes, and exhibitor portal — no sponsorship tier.",
    icon: Store,
  },
  {
    value: "sponsor",
    label: "Sponsorship only",
    short: "Sponsor",
    description: "Branding package and sponsorship invoice — no booth assignment.",
    icon: Award,
  },
  {
    value: "both",
    label: "Exhibitor + sponsor",
    short: "Both",
    description: "Combined booth and sponsorship tier with full deliverables.",
    icon: Store,
  },
];

const empty = (participation: ParticipationType): CreateOrganizationInput => ({
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
  staffCount: 2,
  staffEmails: [],
  boothPreference: "",
  preferredBoothId: "",
  boothAssignment: "",
});

function participationMeta(p: ParticipationType) {
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
  const [picked, setPicked] = useState<TicketPlan | null>(null);
  const [form, setForm] = useState<CreateOrganizationInput>(() => empty(defaultParticipation));
  const [staffEmail, setStaffEmail] = useState("");
  const availableBooths = store.booths.filter((b) => b.status === "available");

  useEffect(() => {
    if (!open) return;
    setForm(empty(defaultParticipation));
    setPicked(null);
    setStaffEmail("");
  }, [open, defaultParticipation]);

  const addStaffEmail = () => {
    const e = staffEmail.trim().toLowerCase();
    if (!e) return;
    if (form.staffEmails.includes(e)) return toast.error("Email already added");
    setForm((f) => ({ ...f, staffEmails: [...f.staffEmails, e] }));
    setStaffEmail("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateOrganizationInput = {
      ...form,
      ticketPlanId: picked?.id ?? form.ticketPlanId,
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
  const isSponsor = form.participation === "sponsor" || form.participation === "both";
  const isExhibitor = form.participation === "exhibitor" || form.participation === "both";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add organization — {meta.label.toLowerCase()}</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {form.participation === "sponsor"
              ? "Creates comp registration, approved sponsorship application, sponsorship invoice, and portal access."
              : form.participation === "exhibitor"
                ? "Creates comp registration, approved booth application, booth assignment, staff invites, and exhibitor portal access."
                : "Creates comp registration, booth + sponsorship package, invoice, staff invites, and full portal access."}
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 1 — Choose package type
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
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
                  value={picked?.id ?? ""}
                  onValueChange={(id) => {
                    const plan = store.ticketPlans.find((t) => t.id === id) ?? null;
                    setPicked(plan);
                    setForm((f) => ({ ...f, ticketPlanId: id }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Delegate pass for contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {store.ticketPlans.map((t) => (
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
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Step 3 — {isSponsor && isExhibitor ? "Booth & sponsorship" : isSponsor ? "Sponsorship details" : "Booth details"}
            </h3>
            <ExhibitorPackageEstimator
              store={store}
              participation={form.participation}
              tier={form.sponsorshipTier}
              staffCount={form.staffCount}
              onStaffCountChange={(n) => setForm({ ...form, staffCount: n })}
            />
            {isSponsor && (
              <div>
                <Label>Sponsorship tier *</Label>
                <Select
                  value={form.sponsorshipTier ?? "Silver"}
                  onValueChange={(v) => setForm({ ...form, sponsorshipTier: v as SponsorshipTier })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {store.sponsorshipTiers.map((t) => (
                      <SelectItem key={t.tier} value={t.tier}>
                        {t.tier}
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
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Organization type</Label>
                <Select value={form.orgType} onValueChange={(v) => setForm({ ...form, orgType: v as OrgType })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>
            {isExhibitor && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Booth to assign</Label>
                  <Input
                    value={form.boothAssignment ?? ""}
                    onChange={(e) => setForm({ ...form, boothAssignment: e.target.value })}
                    placeholder="A-01"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Or pick available booth</Label>
                  <Select
                    value={form.preferredBoothId || "_none"}
                    onValueChange={(v) => {
                      const booth = store.booths.find((b) => b.id === v);
                      setForm({
                        ...form,
                        preferredBoothId: v === "_none" ? "" : v,
                        boothAssignment: booth?.code ?? form.boothAssignment,
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">—</SelectItem>
                      {availableBooths.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </section>

          {isExhibitor && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Step 4 — Booth staff emails
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
          )}

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
