"use client";

import { useState } from "react";
import { ScanLine, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { StatTile } from "@/components/layout/PortalShell";
import { CHECKINS, HOURLY_CHECKINS, REGISTRATIONS, TICKET_CATEGORIES } from "@/lib/mock-data";
import { toast } from "sonner";


export default function Page() {
  const [q, setQ] = useState("");
  const expected = REGISTRATIONS.filter((r) => r.status === "paid").length;
  const found = q ? REGISTRATIONS.find((r) => [r.name, r.email, r.id].some((v) => v.toLowerCase().includes(q.toLowerCase()))) : null;

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl font-bold">Check-in desk</h1><p className="text-muted-foreground">Scan attendee QR codes or look up manually.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Checked in today" value={CHECKINS.length} accent />
        <StatTile label="Remaining expected" value={expected - CHECKINS.length} />
        <StatTile label="This hour" value={41} hint="08:00–09:00" />
        <StatTile label="No-shows" value={0} hint="updates after Day 1" />
      </div>

      <Tabs defaultValue="scan">
        <TabsList><TabsTrigger value="scan">Scan & lookup</TabsTrigger><TabsTrigger value="dashboard">Attendance dashboard</TabsTrigger></TabsList>

        <TabsContent value="scan" className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-6">
          <div className="rounded-2xl bg-card border border-border p-6 text-center">
            <div className="h-48 rounded-xl border-2 border-dashed border-border bg-secondary/40 flex items-center justify-center mb-4">
              <div><ScanLine className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><div className="text-sm text-muted-foreground">QR scan area</div></div>
            </div>
            <Button className="w-full gradient-blue text-accent-foreground" onClick={() => toast.success("Camera access requested")}>Open camera</Button>

            <div className="relative mt-6 text-left">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Or search by name, email, ID…" className="pl-9" />
            </div>
            {found && (
              <div className="mt-4 rounded-xl border border-border p-4 text-left">
                <div className="font-serif font-bold">{found.name}</div>
                <div className="text-xs text-muted-foreground">{found.email} · {found.category}</div>
                <Button size="sm" className="w-full mt-3 gradient-blue text-accent-foreground" onClick={() => { toast.success("Checked in ✓"); setQ(""); }}><Check className="h-3.5 w-3.5 mr-1" /> Check in</Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">Recent check-ins</h2>
            <div className="space-y-2">
              {CHECKINS.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.category}</div></div>
                  <span className="font-mono text-xs text-muted-foreground">{c.at}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">Check-ins by hour</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={HOURLY_CHECKINS}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="n" fill="hsl(var(--blue))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">By category</h2>
            {TICKET_CATEGORIES.map((c) => {
              const n = CHECKINS.filter((x) => x.category === c.name).length;
              return (
                <div key={c.id} className="flex justify-between text-sm py-1.5"><span>{c.name}</span><span className="font-mono">{n}</span></div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
