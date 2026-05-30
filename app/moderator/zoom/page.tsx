"use client";

import { useState } from "react";
import { Plus, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import { createZoomMeeting } from "@/lib/zoom-mock";
import { ZoomMeetingEmbed } from "@/components/zoom/ZoomMeetingEmbed";
import { toast } from "sonner";

export default function ModeratorZoomPage() {
  const store = useStore();
  const [linkItem, setLinkItem] = useState("none");
  const activeMeeting = store.zoomMeetings.find((z) => z.status === "live") ?? store.zoomMeetings[0];

  const create = () => {
    const segId = linkItem === "none" ? undefined : linkItem;
    const item = segId ? store.runOfShow.find((r) => r.id === segId) : undefined;
    const meeting = createZoomMeeting(item?.title ?? "NAS 2026 Session", segId);
    patchStore((s) => ({
      ...s,
      zoomMeetings: [
        { ...meeting, status: "live" as const },
        ...s.zoomMeetings.map((z) => ({ ...z, status: z.status === "live" ? ("ended" as const) : z.status })),
      ],
      runOfShow: segId
        ? s.runOfShow.map((r) => (r.id === segId ? { ...r, zoomMeetingId: meeting.id } : r))
        : s.runOfShow,
    }));
    toast.success("Zoom meeting created and set live for embed");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Zoom integration</h1>
          <p className="text-muted-foreground">Create meetings and preview how remote attendees join inside NAS 2026.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={linkItem} onValueChange={setLinkItem}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Link to programme segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Standalone meeting</SelectItem>
              {store.runOfShow.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title.slice(0, 42)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gradient-blue text-accent-foreground" onClick={create}>
            <Plus className="h-4 w-4 mr-1" /> Create meeting
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Embedded meeting (production: Zoom Web SDK)
            </div>
            <ZoomMeetingEmbed meeting={activeMeeting} title={activeMeeting?.title} />
          </div>
          {activeMeeting && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(activeMeeting.joinUrl)}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy join link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={activeMeeting.joinUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open in Zoom app
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <h2 className="font-serif font-bold">Your meetings</h2>
          {store.zoomMeetings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Create a meeting to populate the embed and attendee join links.
            </p>
          )}
          {store.zoomMeetings.map((z) => (
            <div key={z.id} className="rounded-md bg-card border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{z.title}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{z.status}</span>
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted-foreground break-all">{z.joinUrl}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => copy(z.joinUrl)}>
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patchStore((s) => ({
                      ...s,
                      zoomMeetings: s.zoomMeetings.map((m) => ({
                        ...m,
                        status:
                          m.id === z.id ? ("live" as const) : m.status === "live" ? ("ended" as const) : m.status,
                      })),
                    }))
                  }
                >
                  Set as embed
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
