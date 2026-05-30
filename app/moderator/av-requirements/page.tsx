"use client";

import Link from "next/link";
import {
  Mic,
  Monitor,
  Wifi,
  Video,
  FileText,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getSessions } from "@/lib/sessions";
import { SPEAKERS } from "@/lib/mock-data";

export default function ModeratorAvRequirementsPage() {
  const store = useStore();
  const sessions = getSessions();
  const approvedSpeakers = store.speakerApplications.filter((a) => a.status === "approved");

  type AvRow = (typeof store.speakerAvRequirements)[number] & { _placeholder?: boolean };
  const rows: AvRow[] = store.speakerAvRequirements.length
    ? store.speakerAvRequirements
    : approvedSpeakers.map((a) => ({
        speakerEmail: a.email,
        presentationTool: "venue" as const,
        microphone: "lavalier" as const,
        needsInternet: false,
        includesVideo: false,
        specialEquipment: "No AV form submitted yet",
        status: "pending" as const,
        submittedAt: "",
        updatedAt: "",
        _placeholder: true,
      }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speaker AV & venue prep</h1>
          <p className="text-muted-foreground max-w-2xl">
            FR-4.3 — Everything speakers declare before they pitch: laptop source, microphone, internet, demos, and
            special equipment. Share this view with the venue AV team before each segment goes live.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/moderator">← Command centre</Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>
            No speaker AV requirements yet. Speakers submit these after application approval on Speaker →
            Presentation.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {rows.map((av) => {
            const app = store.speakerApplications.find((a) => a.email === av.speakerEmail);
            const speakerProfile = SPEAKERS.find((s) => s.name === app?.name);
            const speakerSessions = sessions.filter((s) =>
              speakerProfile ? s.speakers.includes(speakerProfile.id) : false,
            );
            const deck = store.speakerDecks.find((d) => d.speakerEmail === av.speakerEmail);
            const liveSegment = store.runOfShow.find(
              (r) => r.ownerEmail === av.speakerEmail || speakerSessions.some((ss) => r.sessionId === ss.id),
            );
            const isPlaceholder = "_placeholder" in av;

            return (
              <article key={av.speakerEmail} className="rounded-md bg-card border border-border overflow-hidden">
                <div className="gradient-navy text-white px-5 py-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Speaker</div>
                    <div className="font-serif text-xl font-bold">{app?.name ?? av.speakerEmail}</div>
                    <div className="text-sm opacity-85 mt-0.5">{app?.title ?? "—"}</div>
                  </div>
                  {isPlaceholder ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-amber-500/30 text-amber-100">
                      Awaiting AV form
                    </span>
                  ) : av.status === "approved" ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-green/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Approved
                    </span>
                  ) : av.status === "changes_requested" ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-red-500/30 text-red-100">
                      Changes requested
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-amber-500/30 text-amber-100">
                      Pending review
                    </span>
                  )}
                </div>

                <div className="p-5 grid lg:grid-cols-[1.2fr_1fr] gap-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                      Technical requirements
                    </h3>
                    <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex gap-3 rounded-md bg-secondary/40 p-3">
                        <Monitor className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Presentation source</dt>
                          <dd className="font-medium capitalize">
                            {av.presentationTool === "venue"
                              ? "Venue laptop (NAS loads deck)"
                              : "Speaker own laptop"}
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-md bg-secondary/40 p-3">
                        <Mic className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Microphone</dt>
                          <dd className="font-medium capitalize">{av.microphone}</dd>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-md bg-secondary/40 p-3">
                        <Wifi className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Internet</dt>
                          <dd className="font-medium">
                            {av.needsInternet ? "Required — secure guest Wi‑Fi" : "Not required"}
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-md bg-secondary/40 p-3">
                        <Video className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Video / live demo</dt>
                          <dd className="font-medium">
                            {av.includesVideo ? "Yes — test HDMI & audio before session" : "Slides only"}
                          </dd>
                        </div>
                      </div>
                    </dl>
                    {av.specialEquipment && (
                      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <strong>Special equipment / notes:</strong> {av.specialEquipment}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                        Session & run of show
                      </h3>
                      {speakerSessions.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {speakerSessions.map((s) => (
                            <li key={s.id} className="rounded-md border border-border px-3 py-2">
                              <div className="font-medium">{s.title}</div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Day {s.day} · {s.start}–{s.end}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {s.room}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No programme sessions linked yet.</p>
                      )}
                      {liveSegment && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Run-of-show owner: <strong>{liveSegment.ownerName ?? "TBC"}</strong>
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                        Uploaded deck
                      </h3>
                      {deck ? (
                        <a
                          href={deck.fileDataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                        >
                          <FileText className="h-4 w-4" /> {deck.fileName}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">No presentation file uploaded yet.</p>
                      )}
                    </div>

                    <div className="rounded-md bg-secondary/30 p-3 text-xs text-muted-foreground">
                      <strong className="text-foreground">Venue checklist:</strong> Confirm adapter (USB‑C/HDMI),
                      clicker,
                      {av.needsInternet && " guest Wi‑Fi,"}
                      {av.includesVideo && " video audio routing,"} and {av.microphone} mic before house opens.
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
