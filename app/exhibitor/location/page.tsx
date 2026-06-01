"use client";

import { MapPin, Clock, Phone, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXHIBITOR_ME } from "@/lib/mock-data";


export default function Page() {
  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl font-bold">Booth information</h1><p className="text-muted-foreground">Location, logistics and setup details.</p></div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl gradient-navy text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 leaf-texture opacity-40" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-gold mb-2">Your booth</div>
            <div className="font-serif text-6xl font-bold">{EXHIBITOR_ME.booth}</div>
            <p className="text-sm mt-3 text-white/80">Ground floor · Exhibition Hall · 3m × 3m</p>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" /><div><div className="font-semibold text-sm">Location</div><div className="text-xs text-muted-foreground">Kigali Marriott Hotel · Exhibition Hall, opposite the Grand Ballroom entrance</div></div></div>
          <div className="flex items-start gap-3"><Clock className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" /><div><div className="font-semibold text-sm">Setup window</div><div className="text-xs text-muted-foreground">12 Aug · 14:00–18:00 · Breakdown 14 Aug · 18:00–20:00</div></div></div>
          <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" /><div><div className="font-semibold text-sm">On-site contact</div><div className="text-xs text-muted-foreground">Thierry Niyonsenga · +250 788 000 000</div></div></div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-serif font-bold mb-3">Booth includes</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {["1× rectangular display table (180×60cm)", "2× chairs", "2× 220V power outlets", "Dedicated 50 Mbps wifi", "Booth signage with your logo", "Daily cleaning service"].map((i) => <li key={i}>• {i}</li>)}
        </ul>
        <Button variant="outline" className="mt-4"><FileDown className="h-4 w-4 mr-1" /> Download exhibitor logistics PDF</Button>
      </div>
    </div>
  );
}
