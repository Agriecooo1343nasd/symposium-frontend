"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import { useCreateSubmission, useMySubmissions } from "@/hooks/api/useDashboard";
import { isRegistrationPaid, primaryRegistration } from "@/lib/api/mappers/registration-helpers";
import { filesService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import type { PresentationType } from "@/lib/api/dto";
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
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { registrations } = useMyRegistrations();
  const { data: mySubmissions = [] } = useMySubmissions();
  const createSubmission = useCreateSubmission();

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

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Apply to speak</h1>
      <p className="text-muted-foreground mb-6">
        Submit an abstract to the programme committee. Exhibitor and sponsorship applications use a separate flow.
      </p>

      <div className="rounded-xl border bg-secondary/40 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Store className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Want to exhibit or sponsor?</div>
            <p className="text-muted-foreground mt-0.5">
              Booth packages and sponsorship tiers are on the exhibit &amp; sponsor page.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/apply-exhibit">Apply to exhibit / sponsor</Link>
        </Button>
      </div>

      {!canApplySpeaker && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
          You need a paid registration before applying to speak.{" "}
          <Link href="/register" className="font-semibold underline">
            Register now
          </Link>
        </div>
      )}

      {mySubmissions.length > 0 && (
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

      <form onSubmit={submitSpeaker} className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="h-4 w-4 text-accent" />
          <h2 className="font-serif font-bold">Speaker application</h2>
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
    </div>
  );
}
