"use client";

import { useState } from "react";
import { Upload, Film, Play, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid } from "@/lib/store";
import { toast } from "sonner";

export default function ModeratorRecordingsPage() {
  const store = useStore();
  const [title, setTitle] = useState("");
  const [segmentId, setSegmentId] = useState("none");

  const upload = (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById("rec-file") as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !title.trim()) return toast.error("Title and file required");
    patchStore((s) => ({
      ...s,
      recordings: [
        {
          id: uid("rec"),
          title,
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          runOfShowItemId: segmentId === "none" ? undefined : segmentId,
          status: "processing",
          uploadedAt: new Date().toISOString(),
        },
        ...s.recordings,
      ],
    }));
    toast.success("Recording uploaded — processing");
    setTitle("");
    setSegmentId("none");
    input.value = "";
  };

  const publish = (id: string) => {
    patchStore((s) => ({
      ...s,
      recordings: s.recordings.map((r) => (r.id === id ? { ...r, status: "published" as const } : r)),
    }));
    toast.success("Published to attendee materials");
  };

  const published = store.recordings.filter((r) => r.status === "published").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Session recordings</h1>
        <p className="text-muted-foreground">Upload captures from the hall and publish to the delegate library.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-md bg-card border border-border p-4">
          <Film className="h-6 w-6 text-blue mb-2" />
          <div className="font-serif text-2xl font-bold">{store.recordings.length}</div>
          <div className="text-xs text-muted-foreground">Total uploads</div>
        </div>
        <div className="rounded-md bg-card border border-border p-4">
          <Clock className="h-6 w-6 text-amber-600 mb-2" />
          <div className="font-serif text-2xl font-bold">
            {store.recordings.filter((r) => r.status === "processing").length}
          </div>
          <div className="text-xs text-muted-foreground">Processing</div>
        </div>
        <div className="rounded-md bg-card border border-border p-4">
          <Globe className="h-6 w-6 text-green mb-2" />
          <div className="font-serif text-2xl font-bold">{published}</div>
          <div className="text-xs text-muted-foreground">Published</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <form onSubmit={upload} className="rounded-md bg-card border border-border p-5 space-y-4 h-fit">
          <h2 className="font-serif font-bold">New upload</h2>
          <div>
            <Label>Session title *</Label>
            <Input
              required
              placeholder="e.g. Day 1 Opening Plenary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Programme segment</Label>
            <Select value={segmentId} onValueChange={setSegmentId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Optional segment link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No segment</SelectItem>
                {store.runOfShow.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title.slice(0, 48)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Video file *</Label>
            <Input id="rec-file" type="file" accept="video/*" required className="mt-1" />
          </div>
          <Button type="submit" className="w-full gradient-blue text-accent-foreground">
            <Upload className="h-4 w-4 mr-1" /> Upload recording
          </Button>
        </form>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {store.recordings.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
              No recordings yet. Upload after each major segment concludes.
            </div>
          )}
          {store.recordings.map((r) => {
            const seg = r.runOfShowItemId ? store.runOfShow.find((x) => x.id === r.runOfShowItemId) : null;
            return (
              <div
                key={r.id}
                className="rounded-md bg-card border border-border overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="sm:w-40 h-28 sm:h-auto bg-gradient-to-br from-navy/80 to-blue/40 flex items-center justify-center shrink-0">
                  <Play className="h-10 w-10 text-white/80" />
                </div>
                <div className="p-4 flex-1 flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <div className="font-serif font-bold">{r.title}</div>
                    {seg && <div className="text-xs text-muted-foreground mt-0.5">{seg.title}</div>}
                    <div className="text-xs font-mono text-muted-foreground mt-2">
                      {r.fileName} · {r.fileSize}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(r.uploadedAt).toLocaleString()}
                    </div>
                    <span
                      className={`inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        r.status === "published" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.status === "processing" && (
                    <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => publish(r.id)}>
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
