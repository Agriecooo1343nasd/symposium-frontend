"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import {
  patchStore,
  uid,
  calculateOrgPackageFee,
  type PresentationType,
  type OrgType,
  type ParticipationType,
  type SponsorshipTier,
} from "@/lib/store";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { toast } from "sonner";

export default function DashboardApplyPage() {
  const router = useRouter();
  const store = useStore();
  const { session } = useAuth();
  const [kind, setKind] = useState<"speaker" | "exhibitor">("speaker");

  const paidReg = store.registrations.find((r) => r.email === session?.email && r.status === "paid");
  const canApplySpeaker = !!paidReg;

  const [speaker, setSpeaker] = useState({
    name: session?.name ?? "",
    email: session?.email ?? "",
    phone: "",
    country: "Rwanda",
    about: "",
    title: "",
    summary: "",
    presentationType: "Panel" as PresentationType,
    photoUrl: "",
    documentName: "",
    documentDataUrl: "",
  });

  const [org, setOrg] = useState({
    companyName: "",
    orgType: "company" as OrgType,
    website: "",
    description: "",
    contactName: session?.name ?? "",
    contactEmail: session?.email ?? "",
    contactPhone: "",
    participation: "exhibitor" as ParticipationType,
    sponsorshipTier: "Silver" as SponsorshipTier,
    boothPreference: "",
    preferredBoothId: "" as string,
  });
  const [staffCount, setStaffCount] = useState(2);
  const availableBooths = store.booths.filter((b) => b.status === "available");

  const readFile = (file: File, cb: (name: string, dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(file.name, reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApplySpeaker) return toast.error("Paid registration required to apply as speaker.");
    patchStore((s) => ({
      ...s,
      speakerApplications: [
        {
          id: uid("sa"),
          ...speaker,
          status: "pending",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.speakerApplications,
      ],
    }));
    toast.success("Speaker application submitted for review");
    router.push("/dashboard");
  };

  const submitOrg = (e: React.FormEvent) => {
    e.preventDefault();
    const quote = calculateOrgPackageFee(org.participation, org.sponsorshipTier, staffCount, store);
    patchStore((s) => ({
      ...s,
      organizationApplications: [
        {
          id: uid("oa"),
          ...org,
          staffCount,
          quotedFeeUsd: quote.feeUsd,
          status: "pending",
          paymentStatus: "unpaid",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.organizationApplications,
      ],
    }));
    toast.success("Organization application submitted");
    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Apply to speak or exhibit</h1>
      <p className="text-muted-foreground mb-6">
        Speaker applications are reviewed by the registration desk. Exhibitor and sponsor applications go to the admin
        team.
      </p>

      {!canApplySpeaker && kind === "speaker" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
          You need a paid registration before applying to speak.{" "}
          <a href="/register" className="font-semibold underline">
            Register now
          </a>
        </div>
      )}

      <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
        <TabsList className="mb-6">
          <TabsTrigger value="speaker">
            <Mic className="h-3.5 w-3.5 mr-1" /> Speaker
          </TabsTrigger>
          <TabsTrigger value="exhibitor">
            <Store className="h-3.5 w-3.5 mr-1" /> Exhibitor / Sponsor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="speaker">
          <form onSubmit={submitSpeaker} className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full name *</Label>
                <Input
                  required
                  placeholder="e.g. Jean Uwimana"
                  value={speaker.name}
                  onChange={(e) => setSpeaker({ ...speaker, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="name@organization.org"
                  value={speaker.email}
                  onChange={(e) => setSpeaker({ ...speaker, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  placeholder="+250 788 000 000"
                  value={speaker.phone}
                  onChange={(e) => setSpeaker({ ...speaker, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  required
                  placeholder="Rwanda"
                  value={speaker.country}
                  onChange={(e) => setSpeaker({ ...speaker, country: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Profile photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f, (_name, dataUrl) => setSpeaker({ ...speaker, photoUrl: dataUrl }));
                }}
              />
            </div>
            <div>
              <Label>About you *</Label>
              <Textarea
                required
                rows={3}
                placeholder="Brief professional background for the programme committee..."
                value={speaker.about}
                onChange={(e) => setSpeaker({ ...speaker, about: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Presentation title *</Label>
              <Input
                required
                placeholder="Proposed presentation title"
                value={speaker.title}
                onChange={(e) => setSpeaker({ ...speaker, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Summary *</Label>
              <Textarea
                required
                rows={4}
                placeholder="Abstract summary (max 300 words in production)..."
                value={speaker.summary}
                onChange={(e) => setSpeaker({ ...speaker, summary: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Presentation type *</Label>
              <Select
                value={speaker.presentationType}
                onValueChange={(v) => setSpeaker({ ...speaker, presentationType: v as PresentationType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Keynote", "Panel", "Workshop", "Poster"] as const).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Abstract document (PDF) *</Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                required
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f, (name, dataUrl) => setSpeaker({ ...speaker, documentName: name, documentDataUrl: dataUrl }));
                }}
              />
            </div>
            <Button type="submit" disabled={!canApplySpeaker} className="gradient-blue text-accent-foreground">
              Submit application
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="exhibitor">
          <form onSubmit={submitOrg} className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <ExhibitorPackageEstimator
              store={store}
              participation={org.participation}
              tier={org.sponsorshipTier}
              staffCount={staffCount}
              onStaffCountChange={setStaffCount}
            />
            <div>
              <Label>Participation type *</Label>
              <Select value={org.participation} onValueChange={(v) => setOrg({ ...org, participation: v as ParticipationType })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exhibitor">Exhibitor only</SelectItem>
                  <SelectItem value="sponsor">Sponsor only</SelectItem>
                  <SelectItem value="both">Exhibitor + Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(org.participation === "sponsor" || org.participation === "both") && (
              <div>
                <Label>Sponsorship tier *</Label>
                <Select value={org.sponsorshipTier} onValueChange={(v) => setOrg({ ...org, sponsorshipTier: v as SponsorshipTier })}>
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
                <div className="mt-2 rounded-lg bg-secondary/60 p-3 text-xs">
                  {store.sponsorshipTiers
                    .find((t) => t.tier === org.sponsorshipTier)
                    ?.benefits.map((b) => (
                      <div key={b}>- {b}</div>
                    ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Company name *</Label>
                <Input
                  required
                  placeholder="Organization legal name"
                  value={org.companyName}
                  onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Organization type</Label>
                <Select value={org.orgType} onValueChange={(v) => setOrg({ ...org, orgType: v as OrgType })}>
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
                  placeholder="https://www.example.org"
                  value={org.website}
                  onChange={(e) => setOrg({ ...org, website: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                required
                rows={4}
                placeholder="What products or services will you showcase at NAS 2026?"
                value={org.description}
                onChange={(e) => setOrg({ ...org, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact name *</Label>
                <Input
                  required
                  placeholder="Primary contact name"
                  value={org.contactName}
                  onChange={(e) => setOrg({ ...org, contactName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="contact@company.com"
                  value={org.contactEmail}
                  onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Contact phone</Label>
                <Input
                  placeholder="+250 788 000 000"
                  value={org.contactPhone}
                  onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Preferred booth (optional)</Label>
              <Select
                value={org.preferredBoothId || "_none"}
                onValueChange={(v) => {
                  const booth = store.booths.find((b) => b.id === v);
                  setOrg({
                    ...org,
                    preferredBoothId: v === "_none" ? "" : v,
                    boothPreference: booth ? booth.code : org.boothPreference,
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a booth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">No preference</SelectItem>
                  {availableBooths.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.code} - capacity {b.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={org.boothPreference}
                onChange={(e) => setOrg({ ...org, boothPreference: e.target.value })}
                className="mt-2"
                placeholder="Notes: near entrance, digital zone..."
              />
            </div>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Submit application
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
