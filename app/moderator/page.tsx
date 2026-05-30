"use client";

import Link from "next/link";
import {
  ListOrdered,
  Video,
  MessageSquare,
  Upload,
  Clock,
  Users,
  CheckCircle2,
  Settings2,
  Mic,
} from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { getLiveRunOfShowItem, getLiveZoomMeeting } from "@/lib/store";

export default function ModeratorOverviewPage() {
  const store = useStore();
  const live = getLiveRunOfShowItem();
  const zoom = getLiveZoomMeeting();
  const pendingQueue = store.remoteInteractions.filter((i) => i.status === "pending").length;
  const approvedQueue = store.remoteInteractions.filter((i) => i.status === "approved").length;
  const day1 = store.runOfShow.filter((r) => r.day === 1);
  const day1Done = day1.filter((r) => r.status === "done").length;
  const upcoming = store.runOfShow.filter((r) => r.status === "upcoming").slice(0, 3);
  const liveMeetings = store.zoomMeetings.filter((z) => z.status === "live").length;
  const processingRec = store.recordings.filter((r) => r.status === "processing").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Moderator command centre</h1>
        <p className="text-muted-foreground">Hybrid symposium control — run of show, Zoom, remote audience, recordings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Activities scheduled", value: store.runOfShow.length, sub: `${day1Done}/${day1.length} Day 1 done` },
          { label: "Zoom meetings", value: store.zoomMeetings.length, sub: `${liveMeetings} live now` },
          { label: "Queue pending", value: pendingQueue, sub: `${approvedQueue} on screen` },
          { label: "Recordings", value: store.recordings.length, sub: `${processingRec} processing` },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-card border border-border p-4">
            <div className="font-serif text-2xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {live ? (
          <div className="rounded-md gradient-navy text-white p-5">
            <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Current segment</div>
            <div className="font-serif text-lg font-bold">{live.title}</div>
            <div className="text-sm opacity-80 mt-1 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {live.startTime} – {live.endTime} · Day {live.day}
            </div>
            {live.ownerName && (
              <div className="text-xs mt-2 opacity-90 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Owner: {live.ownerName}
              </div>
            )}
            {zoom && (
              <Link href="/moderator/zoom" className="inline-block mt-3 text-sm underline">
                Open Zoom console →
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-card border border-border p-5">
            <div className="font-serif font-bold">No segment marked live</div>
            <p className="text-sm text-muted-foreground mt-1">Manage the programme timeline in Run of show.</p>
            <Link href="/moderator/run-of-show" className="text-sm text-accent font-semibold mt-2 inline-block">
              Open run of show →
            </Link>
          </div>
        )}

        <div className="rounded-md bg-card border border-border p-5">
          <div className="font-serif font-bold mb-3">Up next</div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">All segments completed or none scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((u) => (
                <li key={u.id} className="text-sm flex justify-between gap-2 border-b border-border pb-2 last:border-0">
                  <span className="truncate">{u.title}</span>
                  <span className="text-muted-foreground shrink-0">{u.startTime}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-md bg-card border border-border p-5">
        <div className="font-serif font-bold mb-3">Recent remote activity</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {store.remoteInteractions.slice(0, 5).map((i) => (
            <div key={i.id} className="text-sm flex items-start gap-2">
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-secondary shrink-0">{i.type}</span>
              <span className="min-w-0">
                <strong>{i.author}</strong>: {i.message}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{i.status}</span>
            </div>
          ))}
        </div>
        <Link href="/moderator/queue" className="text-sm text-accent font-semibold mt-3 inline-block">
          Open moderation queue →
        </Link>
      </div>

      <div className="rounded-md bg-card border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-serif font-bold flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-accent" /> Speaker AV prep (FR-4.3)
          </h2>
          <Link href="/moderator/av-requirements" className="text-sm text-accent font-semibold hover:underline">
            Full venue briefing →
          </Link>
        </div>
        {store.speakerAvRequirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No AV forms submitted yet. Approved speakers complete this on Speaker → Presentation.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {store.speakerAvRequirements.slice(0, 4).map((a) => {
              const app = store.speakerApplications.find((x) => x.email === a.speakerEmail);
              return (
                <div key={a.speakerEmail} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                    {app?.name ?? a.speakerEmail}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold mt-1 inline-block ${
                      a.status === "approved"
                        ? "text-green"
                        : a.status === "changes_requested"
                          ? "text-red-600"
                          : "text-amber-700"
                    }`}
                  >
                    AV: {a.status.replace("_", " ")}
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>
                      {a.presentationTool === "venue" ? "Venue laptop" : "Own laptop"} · {a.microphone} mic
                    </li>
                    {a.needsInternet && <li>Internet required</li>}
                    {a.includesVideo && <li>Video / demo in deck</li>}
                    {a.specialEquipment && <li className="text-amber-800">{a.specialEquipment}</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/moderator/run-of-show", label: "Run of show", icon: ListOrdered },
          { to: "/moderator/zoom", label: "Zoom", icon: Video },
          { to: "/moderator/live", label: "Live stream", icon: Video },
          { to: "/moderator/queue", label: "Remote queue", icon: MessageSquare },
          { to: "/moderator/av-requirements", label: "AV prep", icon: Settings2 },
          { to: "/moderator/recordings", label: "Recordings", icon: Upload },
        ].map((c) => (
          <Link key={c.to} href={c.to} className="rounded-md bg-card border border-border p-4 hover-lift flex items-center gap-3">
            <c.icon className="h-5 w-5 text-blue" />
            <span className="font-medium text-sm">{c.label}</span>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
