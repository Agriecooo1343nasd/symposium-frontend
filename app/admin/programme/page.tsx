"use client";

import { useState } from "react";
import { Plus, Edit, Trash, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { SessionFormDialog } from "@/components/admin/SessionFormDialog";
import { RunOfShowTimeline } from "@/components/admin/RunOfShowTimeline";
import { deleteSession } from "@/lib/programme-sync";
import { patchStore, uid, appendAudit } from "@/lib/store";
import { getSession } from "@/lib/auth";
import type { Session } from "@/lib/mock-data";
import { SUB_THEME_COLORS } from "@/lib/mock-data";
import { getSessionRatingSummary } from "@/lib/session-ratings";
import { Star } from "lucide-react";
import { toast } from "sonner";


export default function Page() {
  const store = useStore();
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: "", capacity: 100, floor: "Ground", av: "" });

  const openCreate = () => { setEditingSession(null); setSessionOpen(true); };
  const openEdit = (s: Session) => { setEditingSession(s); setSessionOpen(true); };

  const saveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    patchStore((s) => ({
      ...s,
      rooms: [...s.rooms, { id: uid("rm"), ...roomForm, capacity: Number(roomForm.capacity) }],
    }));
    setRoomOpen(false);
    toast.success("Room added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Programme builder</h1>
          <p className="text-muted-foreground">Sessions sync to run-of-show · shared with moderator timeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("PDF export queued")}><FileDown className="h-3.5 w-3.5 mr-1" /> Export PDF</Button>
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={openCreate}><Plus className="h-3.5 w-3.5 mr-1" /> Add session</Button>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="timeline1">Run of show · Day 1</TabsTrigger>
          <TabsTrigger value="timeline2">Run of show · Day 2</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="ratings">Session ratings</TabsTrigger>
        </TabsList>

        {([1, 2] as const).map((day) => (
          <TabsContent key={day} value={day === 1 ? "timeline1" : "timeline2"} className="mt-6">
            <RunOfShowTimeline day={day} showGoLive />
          </TabsContent>
        ))}

        <TabsContent value="sessions" className="mt-6 space-y-3">
          {store.sessions.filter((s) => s.day === 1).length > 0 && <h3 className="text-sm font-semibold text-muted-foreground">Day 1</h3>}
          {store.sessions.filter((s) => s.day === 1).map((s) => (
            <SessionRow key={s.id} session={s} onEdit={() => openEdit(s)} onDelete={() => { deleteSession(s.id); toast.info("Deleted"); }} />
          ))}
          <h3 className="text-sm font-semibold text-muted-foreground pt-4">Day 2</h3>
          {store.sessions.filter((s) => s.day === 2).map((s) => (
            <SessionRow key={s.id} session={s} onEdit={() => openEdit(s)} onDelete={() => { deleteSession(s.id); toast.info("Deleted"); }} />
          ))}
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            FR-6.2 / FR-7.5 — Attendee ratings after sessions end (1–5 stars + comments). Mark sessions done in run-of-show
            to open rating.
          </p>
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Session</th>
                  <th className="text-left px-4 py-3">Avg</th>
                  <th className="text-left px-4 py-3">Count</th>
                  <th className="text-left px-4 py-3">Latest comments</th>
                </tr>
              </thead>
              <tbody>
                {store.sessions.map((s) => {
                  const summary = getSessionRatingSummary(s.id);
                  const comments = store.sessionRatings
                    .filter((r) => r.sessionId === s.id && r.comment)
                    .slice(-2)
                    .map((r) => r.comment);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium line-clamp-1">{s.title}</div>
                        <div className="text-xs text-muted-foreground">Day {s.day}</div>
                      </td>
                      <td className="px-4 py-3">
                        {summary.count > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold">
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                            {summary.average}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">{summary.count}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px]">
                        {comments.length ? comments.join(" · ") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setRoomOpen(true)}>Add room</Button>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase"><tr><th className="text-left px-4 py-3">Room</th><th className="text-left px-4 py-3">Capacity</th><th className="text-left px-4 py-3">Floor</th><th className="text-left px-4 py-3">AV</th><th></th></tr></thead>
              <tbody>
                {store.rooms.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">{r.capacity}</td>
                    <td className="px-4 py-3">{r.floor}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.av}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => patchStore((s) => ({ ...s, rooms: s.rooms.filter((x) => x.id !== r.id) }))}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <SessionFormDialog open={sessionOpen} onOpenChange={setSessionOpen} session={editingSession} onSaved={() => appendAudit(getSession()?.name ?? "Admin", editingSession ? "Updated session" : "Created session", editingSession?.title ?? "new")} />

      <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add room</DialogTitle></DialogHeader>
          <form onSubmit={saveRoom} className="space-y-3">
            <div><Label>Name</Label><Input required value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} className="mt-1" /></div>
            <div><Label>Capacity</Label><Input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} className="mt-1" /></div>
            <div><Label>Floor</Label><Input value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} className="mt-1" /></div>
            <div><Label>AV setup</Label><Input value={roomForm.av} onChange={(e) => setRoomForm({ ...roomForm, av: e.target.value })} className="mt-1" /></div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionRow({ session, onEdit, onDelete }: { session: Session; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 flex flex-wrap justify-between gap-3">
      <div>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${SUB_THEME_COLORS[session.subTheme]}`}>{session.subTheme}</span>
        <div className="font-serif font-bold mt-1">{session.title}</div>
        <div className="text-xs text-muted-foreground">Day {session.day} · {session.start}–{session.end} · {session.room}</div>
      </div>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" onClick={onDelete}><Trash className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}
