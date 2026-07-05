"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore, appendAudit, type PlatformSettings, type FeatureFlags } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";
import { useSymposiumSettings, useUpdateSymposiumSettings } from "@/hooks/api/useEngage";
import { apiErrorMessage } from "@/lib/api/client";
import type { UpdateSymposiumSettingsDto } from "@/lib/api/dto";


const PHASE_GROUPS: { phase: string; keys: (keyof FeatureFlags)[]; labels: Record<string, string> }[] = [
  {
    phase: "Phase 1 — Registration & payments",
    keys: ["registration", "payments", "ticketPlans"],
    labels: { registration: "Registration open", payments: "Payment processing", ticketPlans: "Ticket plans visible" },
  },
  {
    phase: "Phase 2 — Programme & portals",
    keys: ["abstracts", "speakerPortal", "exhibitorPortal", "programmePublished"],
    labels: {
      abstracts: "Abstract / speaker applications",
      speakerPortal: "Speaker portal",
      exhibitorPortal: "Exhibitor portal",
      programmePublished: "Public programme published",
    },
  },
  {
    phase: "Phase 3 — Live event",
    keys: ["liveStream", "remoteQueue", "checkIn", "networking"],
    labels: {
      liveStream: "Live streaming",
      remoteQueue: "Remote Q&A queue",
      checkIn: "QR check-in",
      networking: "Networking directory",
    },
  },
  {
    phase: "Phase 4 — Post-event",
    keys: ["certificates", "survey", "resourceRepository"],
    labels: {
      certificates: "Certificates",
      survey: "Post-event survey",
      resourceRepository: "Resource repository",
    },
  },
];

export default function Page() {
  const store = useStore();
  const [settings, setSettings] = useState<PlatformSettings>(store.platformSettings);
  const [countryInput, setCountryInput] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    patchStore((s) => ({ ...s, platformSettings: settings }));
    appendAudit(getSession()?.name ?? "Admin", "Updated platform settings", settings.eventName);
    toast.success("Settings saved — countdown and feature gates updated");
  };

  const toggleFeature = (key: keyof FeatureFlags, v: boolean) => {
    setSettings((s) => ({ ...s, features: { ...s.features, [key]: v } }));
  };

  const addCountry = () => {
    const c = countryInput.trim();
    if (!c || settings.countries.includes(c)) return;
    setSettings((s) => ({ ...s, countries: [...s.countries, c] }));
    setCountryInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Platform settings</h1>
        <p className="text-muted-foreground">Event dates drive the homepage countdown. Feature flags match SRS delivery phases.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-serif font-bold">Event details</h2>
          <div><Label>Event name</Label><Input value={settings.eventName} onChange={(e) => setSettings({ ...settings, eventName: e.target.value })} className="mt-1" /></div>
          <div><Label>Theme</Label><Input value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="mt-1" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Start date</Label><Input type="date" value={settings.startDate} onChange={(e) => setSettings({ ...settings, startDate: e.target.value })} className="mt-1" /></div>
            <div><Label>End date</Label><Input type="date" value={settings.endDate} onChange={(e) => setSettings({ ...settings, endDate: e.target.value })} className="mt-1" /></div>
          </div>
          <div><Label>Venue</Label><Input value={settings.venue} onChange={(e) => setSettings({ ...settings, venue: e.target.value })} className="mt-1" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>USD → RWF rate</Label><Input type="number" value={settings.exchangeRate} onChange={(e) => setSettings({ ...settings, exchangeRate: Number(e.target.value) })} className="mt-1" /></div>
            <div><Label>Timezone</Label><Input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="mt-1" /></div>
          </div>
        </section>

        <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="font-serif font-bold">Registration countries</h2>
          <div className="flex gap-2">
            <Input placeholder="Add country" value={countryInput} onChange={(e) => setCountryInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCountry())} />
            <Button type="button" variant="outline" onClick={addCountry}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.countries.map((c) => (
              <span key={c} className="text-xs px-2 py-1 rounded-full bg-secondary flex items-center gap-1">
                {c}
                <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setSettings((s) => ({ ...s, countries: s.countries.filter((x) => x !== c) }))}>×</button>
              </span>
            ))}
          </div>
        </section>

        {PHASE_GROUPS.map((g) => (
          <section key={g.phase} className="rounded-2xl bg-card border border-border p-6 space-y-3">
            <h2 className="font-serif font-bold text-sm">{g.phase}</h2>
            {g.keys.map((key) => (
              <div key={key} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium">{g.labels[key] ?? key}</span>
                <Switch checked={settings.features[key]} onCheckedChange={(v) => toggleFeature(key, v)} />
              </div>
            ))}
          </section>
        ))}

        <section className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Maintenance mode</div>
              <div className="text-xs text-muted-foreground">Shows banner on public site; blocks most features</div>
            </div>
            <Switch checked={settings.features.maintenanceMode} onCheckedChange={(v) => toggleFeature("maintenanceMode", v)} />
          </div>
        </section>

        <Button type="submit" className="gradient-blue text-accent-foreground">Save all changes</Button>
      </form>

      <BackendSettingsSection />
    </div>
  );
}

const BACKEND_GROUPS: {
  group: keyof UpdateSymposiumSettingsDto;
  title: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    group: "registration",
    title: "Registration",
    fields: [
      { key: "enableRegistration", label: "Registration open" },
      { key: "enableWaitlist", label: "Waitlist enabled" },
      { key: "allowTicketTransfer", label: "Allow ticket transfer" },
      { key: "allowRefundRequests", label: "Allow refund requests" },
    ],
  },
  {
    group: "payments",
    title: "Payments",
    fields: [
      { key: "enableMomo", label: "Mobile money" },
      { key: "enableBankTransfer", label: "Bank transfer" },
      { key: "enableOnSitePayment", label: "On-site payment" },
      { key: "enableOnSiteCash", label: "On-site cash" },
    ],
  },
  {
    group: "notifications",
    title: "Notifications",
    fields: [
      { key: "emailOnRegistration", label: "Email on registration" },
      { key: "emailOnPayment", label: "Email on payment" },
      { key: "emailOnCheckIn", label: "Email on check-in" },
    ],
  },
  {
    group: "desk",
    title: "Registration desk",
    fields: [
      { key: "enableOnSiteRegistration", label: "On-site registration" },
      { key: "enableBadgePrinting", label: "Badge printing" },
    ],
  },
  {
    group: "sponsorship",
    title: "Sponsorship (FR-5.1)",
    fields: [
      { key: "enableApplications", label: "Public sponsorship applications" },
    ],
  },
];

function BackendSettingsSection() {
  const { settings, isLoading, isError } = useSymposiumSettings();
  const update = useUpdateSymposiumSettings();
  const [draft, setDraft] = useState<UpdateSymposiumSettingsDto | null>(null);

  const merged = draft ?? settings;

  const toggle = (group: keyof UpdateSymposiumSettingsDto, key: string, value: boolean) => {
    const base = (draft ?? settings ?? {}) as UpdateSymposiumSettingsDto;
    setDraft({
      ...base,
      [group]: { ...(base[group] as Record<string, boolean> | undefined), [key]: value },
    });
  };

  const updateTierPricing = (
    tier: "platinum" | "gold" | "silver",
    field: "amountUsd" | "amountRwf",
    value: number,
  ) => {
    const base = (draft ?? settings ?? {}) as UpdateSymposiumSettingsDto;
    const existing = base.sponsorship?.tierPricing ?? settings?.sponsorship?.tierPricing ?? [];
    const tiers: Array<{ tier: string; amountUsd: number; amountRwf: number }> = [
      { tier: "platinum", amountUsd: 25000, amountRwf: 30000000 },
      { tier: "gold", amountUsd: 10000, amountRwf: 12000000 },
      { tier: "silver", amountUsd: 5000, amountRwf: 6000000 },
    ].map((defaultTier) => {
      const row = existing.find((e) => e.tier === defaultTier.tier) ?? defaultTier;
      return row.tier === tier ? { ...row, [field]: value } : row;
    });
    setDraft({
      ...base,
      sponsorship: {
        ...base.sponsorship,
        tierPricing: tiers,
      },
    });
  };

  const updateSponsorshipField = (key: "bankTransferInstructions" | "defaultInvoiceCurrency", value: string) => {
    const base = (draft ?? settings ?? {}) as UpdateSymposiumSettingsDto;
    setDraft({
      ...base,
      sponsorship: {
        ...base.sponsorship,
        [key]: value,
      },
    });
  };

  const save = async () => {
    if (!draft) return;
    try {
      await update.mutateAsync(draft);
      setDraft(null);
      toast.success("Platform settings saved to backend");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const tierPricing = merged?.sponsorship?.tierPricing ?? settings?.sponsorship?.tierPricing ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-bold">Backend platform settings</h2>
        <p className="text-muted-foreground text-sm">
          Live toggles persisted to the symposium configuration API.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-card border border-border p-6 text-sm text-muted-foreground">
          Loading settings…
        </div>
      ) : isError || !merged ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-6 text-sm text-muted-foreground">
          Backend settings unavailable for this symposium.
        </div>
      ) : (
        <>
          {BACKEND_GROUPS.map((g) => (
            <section key={g.group} className="rounded-2xl bg-card border border-border p-6 space-y-3">
              <h3 className="font-serif font-bold text-sm">{g.title}</h3>
              {g.fields.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium">{f.label}</span>
                  <Switch
                    checked={Boolean((merged[g.group] as Record<string, boolean> | undefined)?.[f.key])}
                    onCheckedChange={(v) => toggle(g.group, f.key, v)}
                  />
                </div>
              ))}
            </section>
          ))}

          <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif font-bold text-sm">Sponsorship tier pricing</h3>
            <p className="text-xs text-muted-foreground">
              Amounts shown on the public apply form via GET /symposiums/:id/sponsorship-tier-pricing.
            </p>
            {(["platinum", "gold", "silver"] as const).map((tier) => {
              const row = tierPricing.find((t) => t.tier === tier);
              return (
                <div key={tier} className="grid sm:grid-cols-3 gap-3 items-end border-b border-border pb-4 last:border-0">
                  <div className="font-medium capitalize text-sm">{tier}</div>
                  <div>
                    <Label className="text-xs">USD</Label>
                    <Input
                      type="number"
                      min={0}
                      className="mt-1"
                      value={row?.amountUsd ?? 0}
                      onChange={(e) => updateTierPricing(tier, "amountUsd", Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">RWF</Label>
                    <Input
                      type="number"
                      min={0}
                      className="mt-1"
                      value={row?.amountRwf ?? 0}
                      onChange={(e) => updateTierPricing(tier, "amountRwf", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              );
            })}
            <div>
              <Label>Default invoice currency</Label>
              <Select
                value={merged.sponsorship?.defaultInvoiceCurrency ?? "USD"}
                onValueChange={(v) => updateSponsorshipField("defaultInvoiceCurrency", v)}
              >
                <SelectTrigger className="mt-1 max-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bank transfer instructions</Label>
              <Textarea
                rows={4}
                className="mt-1"
                value={merged.sponsorship?.bankTransferInstructions ?? ""}
                onChange={(e) => updateSponsorshipField("bankTransferInstructions", e.target.value)}
              />
            </div>
          </section>

          <Button
            onClick={save}
            disabled={!draft || update.isPending}
            className="gradient-blue text-accent-foreground"
          >
            {update.isPending ? "Saving…" : "Save backend settings"}
          </Button>
        </>
      )}
    </div>
  );
}
