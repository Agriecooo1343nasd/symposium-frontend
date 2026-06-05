"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { getExhibitorOrgId, patchStore, uid, type SponsorshipTier } from "@/lib/store";
import { SponsorshipRecordPanel } from "@/components/sponsorship/SponsorshipRecordPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tierStyle = (t: string) =>
  t === "Platinum" ? "bg-slate-800 text-white"
    : t === "Gold" ? "bg-amber-100 text-amber-900 border border-amber-200"
      : "bg-zinc-100 text-zinc-800";

function SponsorshipApplyPanel() {
  const store = useStore();
  const { session } = useAuth();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];

  const existingApp = store.organizationApplications.find(
    (a) => a.contactEmail === session?.email && (a.participation === "sponsor" || a.participation === "both"),
  );

  const [tier, setTier] = useState<SponsorshipTier>("Gold");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState(session?.email ?? "");
  const [submitted, setSubmitted] = useState(false);

  const selectedTier = store.sponsorshipTiers.find((t) => t.tier === tier);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patchStore((s) => ({
      ...s,
      organizationApplications: [
        {
          id: uid("oa"),
          companyName: org?.name ?? "My Organization",
          orgType: "company",
          website: "",
          description: message || `Sponsorship upgrade request from existing exhibitor ${org?.name ?? ""}`,
          contactName: session?.name ?? "",
          contactEmail: contact,
          contactPhone: "",
          participation: "both",
          sponsorshipTier: tier,
          boothPreference: org?.booth ?? "",
          status: "pending",
          paymentStatus: "unpaid",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.organizationApplications,
      ],
    }));
    setSubmitted(true);
    toast.success("Sponsorship application submitted — the secretariat will contact you within 3 business days");
  };

  if (existingApp) {
    const statusColor = existingApp.status === "approved" ? "text-green" : existingApp.status === "rejected" ? "text-destructive" : "text-amber-700";
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif font-bold mb-2">Application on file</h2>
        <p className="text-sm text-muted-foreground mb-3">
          You have a sponsorship application submitted on {existingApp.submittedAt}.
        </p>
        <div className={cn("text-sm font-semibold uppercase tracking-wider", statusColor)}>
          Status: {existingApp.status}
        </div>
        {existingApp.status === "pending" && (
          <p className="text-xs text-muted-foreground mt-2">
            The secretariat is reviewing your application. You will be notified by email.
          </p>
        )}
        {existingApp.reviewMessage && (
          <p className="text-sm mt-3 bg-secondary/60 rounded-lg px-3 py-2">{existingApp.reviewMessage}</p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green/30 bg-green/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold">Application received</h2>
        <p className="text-muted-foreground text-sm mt-2">
          The secretariat will review your {tier} sponsorship request and issue a proforma invoice within 3 business days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Become a sponsor</h1>
        <p className="text-muted-foreground">
          Your package is exhibitor-only. Add Platinum, Gold, or Silver sponsorship to unlock homepage visibility,
          newsletter features, extra staff passes, and a speaking slot.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {store.sponsorshipTiers.map((t) => (
          <button
            key={t.tier}
            type="button"
            onClick={() => setTier(t.tier as SponsorshipTier)}
            className={cn(
              "rounded-2xl border p-5 text-left transition-all hover-lift",
              tier === t.tier ? "border-accent ring-2 ring-accent/20 bg-accent/5" : "border-border bg-card",
            )}
          >
            <div className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-3", tierStyle(t.tier))}>
              {t.tier}
            </div>
            <div className="font-serif text-2xl font-bold">${t.baseFeeUsd.toLocaleString()}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {t.benefits.map((b) => (
                <li key={b} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-4 w-4 text-green flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-serif font-bold">Apply for {tier} sponsorship</h2>
        {selectedTier && (
          <div className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
            Base fee: <span className="font-semibold text-foreground">${selectedTier.baseFeeUsd.toLocaleString()}</span>
            {" "}· {selectedTier.staffPasses} staff passes · {selectedTier.brochureSlots} brochure slots
          </div>
        )}
        <div>
          <Label>Contact email *</Label>
          <Input required type="email" value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Sponsorship tier *</Label>
          <Select value={tier} onValueChange={(v) => setTier(v as SponsorshipTier)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {store.sponsorshipTiers.map((t) => (
                <SelectItem key={t.tier} value={t.tier}>{t.tier} — ${t.baseFeeUsd.toLocaleString()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Message to secretariat (optional)</Label>
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit" className="gradient-blue text-accent-foreground">
          Submit sponsorship application <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </form>
    </div>
  );
}

export default function Page() {
  const store = useStore();
  const { session } = useAuth();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];

  const participation = session?.participation ?? org?.participation ?? "exhibitor";
  const isSponsor = participation === "sponsor" || participation === "both";

  if (!isSponsor || !org) return <SponsorshipApplyPanel />;

  return <SponsorshipRecordPanel org={org} mode="exhibitor" />;
}
