"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Monitor,
  Mic,
  Wifi,
  Video,
} from "lucide-react";
import { FileViewLink } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import {
  patchStore,
  uid,
  getSpeakerApplicationForEmail,
  getSpeakerAv,
  type SpeakerAvRequirements,
  type SpeakerAvReviewStatus,
} from "@/lib/store";
import { getSessions } from "@/lib/sessions";
import { SPEAKERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function AvStatusBadge({ status }: { status: SpeakerAvReviewStatus }) {
  const map = {
    pending: { label: "Under venue review", className: "bg-amber-100 text-amber-800", icon: Clock },
    approved: { label: "Approved by venue", className: "bg-green/15 text-green", icon: CheckCircle2 },
    changes_requested: { label: "Changes requested", className: "bg-red-100 text-red-700", icon: AlertCircle },
  } as const;
  const cfg = map[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", cfg.className)}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

export default function SpeakerMaterialsPage() {
  const store = useStore();
  const { session } = useAuth();
  const email = session?.email ?? "speaker@nas2026.rw";
  const app = getSpeakerApplicationForEmail(email);
  const av = getSpeakerAv(email);
  const decks = store.speakerDecks.filter((d) => d.speakerEmail === email);
  const speaker = SPEAKERS.find((s) => s.name === session?.name) ?? SPEAKERS[0];
  const mySessions = getSessions().filter((s) => s.speakers.includes(speaker.id));
  const sessionMaterials = store.sessionMaterials.filter((m) => m.uploadedByEmail === email);

  const [avForm, setAvForm] = useState<SpeakerAvRequirements>(() => ({
    speakerEmail: email,
    presentationTool: av?.presentationTool ?? "venue",
    microphone: av?.microphone ?? "lavalier",
    needsInternet: av?.needsInternet ?? true,
    includesVideo: av?.includesVideo ?? false,
    specialEquipment: av?.specialEquipment ?? "",
    status: av?.status ?? "pending",
    submittedAt: av?.submittedAt ?? "",
    updatedAt: av?.updatedAt ?? "",
    reviewedAt: av?.reviewedAt,
    reviewedBy: av?.reviewedBy,
    venueNotes: av?.venueNotes,
  }));

  const saveAv = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const entry: SpeakerAvRequirements = {
      ...avForm,
      speakerEmail: email,
      status: "pending",
      submittedAt: avForm.submittedAt || now,
      updatedAt: now,
      reviewedAt: undefined,
      reviewedBy: undefined,
      venueNotes: undefined,
    };
    patchStore((s) => ({
      ...s,
      speakerAvRequirements: [...s.speakerAvRequirements.filter((a) => a.speakerEmail !== email), entry],
    }));
    toast.success("AV requirements submitted — venue team will review (FR-4.3)");
  };

  const uploadDeck = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      patchStore((s) => ({
        ...s,
        speakerDecks: [
          {
            id: uid("deck"),
            speakerEmail: email,
            fileName: file.name,
            fileDataUrl: reader.result as string,
            uploadedAt: new Date().toISOString().slice(0, 10),
          },
          ...s.speakerDecks.filter((d) => d.speakerEmail !== email),
        ],
      }));
      toast.success("Presentation uploaded — moderators can load this on the venue laptop");
    };
    reader.readAsDataURL(file);
  };

  if (app?.status === "rejected") {
    return (
      <div className="space-y-4 max-w-xl">
        <h1 className="font-serif text-3xl font-bold">Application not approved</h1>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm">
          <div className="flex gap-2 font-semibold text-red-900">
            <XCircle className="h-5 w-5" /> Rejected
          </div>
          {app.reviewMessage && <p className="mt-2 text-red-800">{app.reviewMessage}</p>}
          <Button asChild size="sm" className="mt-3" variant="outline">
            <Link href="/dashboard/apply">Submit new application</Link>
          </Button>
        </div>
      </div>
    );
  }

  const approved = app?.status === "approved";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Presentation materials</h1>
          <p className="text-muted-foreground mt-1">
            Upload your plenary deck, session files, and AV needs. Moderators and the venue team use this to prepare your
            segments — not visible on the public programme.
          </p>
        </div>
        {approved && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-green/15 text-green">
            <CheckCircle2 className="h-3.5 w-3.5" /> Speaker approved
          </span>
        )}
      </div>

      {app && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          <img src={app.photoUrl} alt="" className="h-16 w-16 rounded-xl object-cover border shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-serif font-bold">{app.title}</div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{app.summary}</p>
            {app.reviewMessage && (
              <p className="text-xs mt-2 text-accent bg-accent/5 rounded-lg px-3 py-2 border border-accent/20">
                Committee: {app.reviewMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Deadline: 29 July 2026.</strong> Final deck and AV form due before tech checks. Session-specific files
          can also be managed under{" "}
          <Link href="/speaker/sessions" className="text-accent font-medium hover:underline">
            My sessions
          </Link>
          .
        </div>
      </div>

      <Tabs defaultValue="deck">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="deck">Plenary deck</TabsTrigger>
          <TabsTrigger value="av">AV requirements</TabsTrigger>
          <TabsTrigger value="sessions">Session files ({sessionMaterials.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deck" className="mt-6">
          <div className="rounded-2xl bg-card border p-6 space-y-4">
            <h2 className="font-serif font-bold text-lg">Main presentation (PDF / PPTX)</h2>
            <p className="text-sm text-muted-foreground">
              This is the file loaded on the venue laptop for your plenary. No committee approval required after upload.
            </p>
            <Input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadDeck(f);
              }}
            />
            {decks[0] ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm border rounded-xl p-4 bg-secondary/20">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-accent shrink-0" />
                  <div>
                    {decks[0].fileDataUrl ? (
                      <FileViewLink src={decks[0].fileDataUrl} fileName={decks[0].fileName} className="font-medium" />
                    ) : (
                      <span className="font-medium">{decks[0].fileName}</span>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">Uploaded {decks[0].uploadedAt}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green font-semibold shrink-0">
                  <Check className="h-3.5 w-3.5" /> Ready for venue
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">PDF or PPTX · max 50MB</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="av" className="mt-6 space-y-6">
          {av && (
            <div className="rounded-2xl border bg-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif font-bold text-lg">AV request status</h2>
                <AvStatusBadge status={av.status} />
              </div>
              <ol className="grid sm:grid-cols-3 gap-3 text-sm">
                <li
                  className={cn(
                    "rounded-xl border p-3",
                    av.submittedAt ? "border-green/30 bg-green/5" : "border-dashed text-muted-foreground",
                  )}
                >
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">1 · Submitted</div>
                  <div className="mt-1 font-medium">
                    {av.submittedAt
                      ? new Date(av.submittedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })
                      : "—"}
                  </div>
                </li>
                <li
                  className={cn(
                    "rounded-xl border p-3",
                    av.status === "pending" && "border-amber-300 bg-amber-50",
                    av.status !== "pending" && av.reviewedAt && "border-green/30 bg-green/5",
                  )}
                >
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">2 · Venue review</div>
                  <div className="mt-1 font-medium capitalize">
                    {av.status === "pending" ? "In progress" : av.reviewedAt ? "Complete" : "Waiting"}
                  </div>
                </li>
                <li
                  className={cn(
                    "rounded-xl border p-3",
                    av.status === "approved" && "border-green/30 bg-green/5",
                    av.status === "changes_requested" && "border-red-200 bg-red-50",
                  )}
                >
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">3 · Decision</div>
                  <div className="mt-1 font-medium capitalize">{av.status.replace("_", " ")}</div>
                </li>
              </ol>
              {av.venueNotes && (
                <div className="text-sm bg-secondary/50 rounded-xl p-4 border-l-2 border-green">
                  <span className="font-semibold">Venue team ({av.reviewedBy ?? "AV"}):</span> {av.venueNotes}
                </div>
              )}
              {av.status === "changes_requested" && (
                <p className="text-sm text-red-800">
                  Update the form below and resubmit. Your previous request remains on file for moderators.
                </p>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4 text-sm">
            {av && (
              <div className="rounded-xl border p-4 space-y-3 lg:col-span-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Current approved setup</h3>
                <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex gap-2 rounded-lg bg-secondary/40 p-3">
                    <Monitor className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <dt className="text-[10px] text-muted-foreground">Source</dt>
                      <dd className="font-medium">{av.presentationTool === "venue" ? "Venue laptop" : "Own laptop"}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2 rounded-lg bg-secondary/40 p-3">
                    <Mic className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <dt className="text-[10px] text-muted-foreground">Mic</dt>
                      <dd className="font-medium capitalize">{av.microphone}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2 rounded-lg bg-secondary/40 p-3">
                    <Wifi className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <dt className="text-[10px] text-muted-foreground">Internet</dt>
                      <dd className="font-medium">{av.needsInternet ? "Required" : "Not needed"}</dd>
                    </div>
                  </div>
                  <div className="flex gap-2 rounded-lg bg-secondary/40 p-3">
                    <Video className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <dt className="text-[10px] text-muted-foreground">Video / demo</dt>
                      <dd className="font-medium">{av.includesVideo ? "Yes" : "No"}</dd>
                    </div>
                  </div>
                </dl>
                {av.specialEquipment && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Special equipment:</span> {av.specialEquipment}
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={saveAv} className="rounded-2xl bg-card border p-6 space-y-4">
            <h2 className="font-serif font-bold">
              {av?.status === "approved" ? "Update AV requirements" : "Submit AV requirements"}
            </h2>
            <p className="text-xs text-muted-foreground -mt-2">
              Resubmitting sends your form back to <strong>pending</strong> until the venue team approves again.
            </p>
            <div>
              <Label>Presentation tool</Label>
              <Select
                value={avForm.presentationTool}
                onValueChange={(v) => setAvForm({ ...avForm, presentationTool: v as "venue" | "own" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue laptop (NAS loads my deck)</SelectItem>
                  <SelectItem value="own">My own laptop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Microphone</Label>
              <Select
                value={avForm.microphone}
                onValueChange={(v) => setAvForm({ ...avForm, microphone: v as SpeakerAvRequirements["microphone"] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lavalier">Lavalier</SelectItem>
                  <SelectItem value="handheld">Handheld</SelectItem>
                  <SelectItem value="headset">Headset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Needs internet</Label>
              <Switch checked={avForm.needsInternet} onCheckedChange={(c) => setAvForm({ ...avForm, needsInternet: c })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Includes video / live demo</Label>
              <Switch checked={avForm.includesVideo} onCheckedChange={(c) => setAvForm({ ...avForm, includesVideo: c })} />
            </div>
            <div>
              <Label>Special equipment & notes</Label>
              <Textarea
                rows={3}
                placeholder="Adapters, clicker, backup laptop, accessibility needs…"
                className="mt-1"
                value={avForm.specialEquipment}
                onChange={(e) => setAvForm({ ...avForm, specialEquipment: e.target.value })}
              />
            </div>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              {av?.status === "approved" ? "Resubmit for review" : "Submit for venue review"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 space-y-4">
          {mySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No programme sessions linked yet.</p>
          ) : (
            mySessions.map((sess) => {
              const files = sessionMaterials.filter((m) => m.sessionId === sess.id);
              return (
                <div key={sess.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex flex-wrap justify-between gap-2 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Day {sess.day} · {sess.start}–{sess.end} · {sess.room}
                      </div>
                      <div className="font-serif font-bold mt-1">{sess.title}</div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/speaker/sessions">Manage uploads</Link>
                    </Button>
                  </div>
                  {files.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No files uploaded for this session yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm border rounded-lg px-3 py-2 bg-secondary/20"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-accent shrink-0" />
                            <span className="font-medium truncate">{m.fileName}</span>
                            <span className="text-[10px] uppercase text-muted-foreground">{m.kind}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{m.uploadedAt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
