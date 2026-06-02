"use client";

import { MapPin, Clock, Phone, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { getExhibitorOrgId } from "@/lib/store";
import { BoothMapPicker } from "@/components/shared/BoothMapPicker";

export default function Page() {
  const store = useStore();
  const { session } = useAuth();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const booth = store.booths.find((b) => b.code === org?.booth) ?? store.booths[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Booth information</h1>
        <p className="text-muted-foreground">Location, logistics and setup details for your booth.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl gradient-navy text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 leaf-texture opacity-40" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-gold mb-2">Your booth</div>
            <div className="font-serif text-6xl font-bold">{org?.booth ?? "—"}</div>
            <p className="text-sm mt-3 text-white/80">
              {booth?.floor ?? "Ground floor"} · {booth?.location ?? "Exhibition Hall"} · {booth?.dimensions ?? "3m × 3m"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Location</div>
              <div className="text-xs text-muted-foreground">
                Kigali Marriott Hotel · {booth?.location ?? "Exhibition Hall, opposite the Grand Ballroom entrance"}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Setup window</div>
              <div className="text-xs text-muted-foreground">{booth?.setupWindow ?? "12 Aug · 14:00–18:00"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Breakdown window</div>
              <div className="text-xs text-muted-foreground">{booth?.breakdownWindow ?? "14 Aug · 18:00–20:00"}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">On-site contact</div>
              <div className="text-xs text-muted-foreground">
                {booth?.onSiteContact ?? "Thierry Niyonsenga · +250 788 000 000"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-serif font-bold mb-1">Exhibition hall map</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your booth is highlighted in gold. Occupied and reserved booths are shown for context.
        </p>
        <BoothMapPicker booths={store.booths} mode="view" myBoothCode={org?.booth} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-serif font-bold mb-3">Booth includes</h2>
        {(booth?.includes ?? []).length > 0 ? (
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {(booth?.includes ?? []).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No items listed — contact the secretariat.</p>
        )}
        {booth?.notes && (
          <p className="mt-4 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">{booth.notes}</p>
        )}
        <Button variant="outline" className="mt-4">
          <FileDown className="h-4 w-4 mr-1" /> Download exhibitor logistics PDF
        </Button>
      </div>
    </div>
  );
}
