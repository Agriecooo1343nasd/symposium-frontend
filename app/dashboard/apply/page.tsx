"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { useCreateSubmission, useMySubmissions } from "@/hooks/api/useDashboard";
import { isRegistrationPaid, primaryRegistration } from "@/lib/api/mappers/registration-helpers";
import { filesService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import type { PresentationType } from "@/lib/api/dto";
import {
  patchStore,
  uid,
  calculateOrgPackageFee,
  type OrgType,
  type ParticipationType,
  type SponsorshipTier,
} from "@/lib/store";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { SUB_THEMES } from "@/lib/mock-data";
import { toast } from "sonner";

const UI_TO_API_TYPE: Record<string, PresentationType> = {
  Oral: "oral",
  Keynote: "oral",
  Panel: "oral",
  Workshop: "workshop",
  Poster: "poster",
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function DashboardApplyPage() {
  const router = useRouter();
  const store = useStore();
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { registrations } = useMyRegistrations();
  const { data: mySubmissions = [] } = useMySubmissions();
  const createSubmission = useCreateSubmission();
  const [kind, setKind] = useState<"speaker" | "exhibitor">("speaker");

  const reg = primaryRegistration(registrations);
  const canApplySpeaker = isRegistrationPaid(reg);

  const [speaker, setSpeaker] = useState({
    title: "",
    abstract: "",
    subTheme: "",
    presentationType: "Oral",
    affiliation: "",
    fileUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  const submitSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canApplySpeaker) return toast.error("Paid registration required to apply as speaker.");
    if (!symposiumId) return toast.error("Symposium not loaded — please retry.");
    if (countWords(speaker.abstract) > 300) return toast.error("Abstract must be 300 words or fewer.");
    if (!session?.name) return toast.error("Profile name missing.");

    try {
      setSubmitting(true);
      await createSubmission.mutateAsync({
        symposiumId,
        title: speaker.title.trim(),
        abstract: speaker.abstract.trim(),
        subTheme: speaker.subTheme || undefined,
        presentationType: UI_TO_API_TYPE[speaker.presentationType] ?? "oral",
        authors: [
          {
            name: session.name,
            affiliation: speaker.affiliation || undefined,
            isPrimary: true,
          },
        ],
        fileUrl: speaker.fileUrl || undefined,
      });
      toast.success("Speaker application submitted for review");
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbstractFile = async (file: File | null) => {
    if (!file) return;
    try {
      const res = await filesService.upload(file, "abstract");
      setSpeaker((s) => ({ ...s, fileUrl: res.url }));
      toast.success("Abstract uploaded");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
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
    toast.success("Organization application saved locally — exhibitor API pending");
    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Apply to speak or exhibit</h1>
      <p className="text-muted-foreground mb-6">
        Speaker applications are submitted to the programme committee. Exhibitor applications use local storage until the
        exhibitor API is available.
      </p>

      {!canApplySpeaker && kind === "speaker" && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
          You need a paid registration before applying to speak.{" "}
          <Link href="/register" className="font-semibold underline">
            Register now
          </Link>
        </div>
      )}

      {mySubmissions.length > 0 && kind === "speaker" && (
        <div className="rounded-xl border bg-secondary/40 p-4 mb-6 text-sm">
          <div className="font-semibold mb-2">Your submissions</div>
          <ul className="space-y-1 text-muted-foreground">
            {mySubmissions.map((sub) => (
              <li key={sub.id}>
                {sub.title} — <span className="capitalize">{sub.status.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
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
              <Label>Abstract * (max 300 words)</Label>
              <Textarea
                required
                rows={6}
                placeholder="Abstract summary…"
                value={speaker.abstract}
                onChange={(e) => setSpeaker({ ...speaker, abstract: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">{countWords(speaker.abstract)} / 300 words</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Presentation type *</Label>
                <Select
                  value={speaker.presentationType}
                  onValueChange={(v) => setSpeaker({ ...speaker, presentationType: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Oral", "Workshop", "Poster"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sub-theme</Label>
                <Select value={speaker.subTheme || "_none"} onValueChange={(v) => setSpeaker({ ...speaker, subTheme: v === "_none" ? "" : v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {SUB_THEMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Affiliation</Label>
              <Input
                placeholder="Organization or institution"
                value={speaker.affiliation}
                onChange={(e) => setSpeaker({ ...speaker, affiliation: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Abstract document (PDF, optional)</Label>
              <Input type="file" accept=".pdf" className="mt-1" onChange={(e) => handleAbstractFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button type="submit" disabled={!canApplySpeaker || submitting} className="gradient-blue text-accent-foreground">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="exhibitor">
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3 mb-4">
            Exhibitor/sponsor applications are not yet available via the API — this form saves locally for demo until the
            backend endpoint is ready.
          </div>
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
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Company name *</Label>
                <Input
                  required
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
                <Input value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                required
                rows={4}
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
                  value={org.contactEmail}
                  onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
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
                      {b.code} — capacity {b.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Save application (local)
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
