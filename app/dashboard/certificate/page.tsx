"use client";

import { Award, Download, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getCertificateTemplate, getEventConfig } from "@/lib/platform-settings";
import { loadStore } from "@/lib/store";

export default function DashboardCertificatePage() {
  const [now] = useState(() => Date.now());
  const session = getSession();
  const event = getEventConfig();
  const tpl = getCertificateTemplate();
  const store = loadStore();
  const reg = store.registrations.find((r) => r.email === session?.email);
  const checkedIn = !!reg?.checkedIn || !!reg?.certificateGranted;
  const eventOver = now > event.endDate.getTime();
  const canDownload = checkedIn && (eventOver || reg?.certificateGranted);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Certificate of attendance</h1>
      <p className="text-muted-foreground mb-6">
        Available after check-in at the venue. Template is managed by organizers.
      </p>

      <div
        className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xl text-center relative overflow-hidden"
        style={
          tpl.backgroundImageUrl
            ? { backgroundImage: `url(${tpl.backgroundImageUrl})`, backgroundSize: "cover" }
            : undefined
        }
      >
        <div className="absolute inset-0 leaf-texture opacity-30" />
        <div className="relative bg-white/95 rounded-2xl p-8 sm:p-10">
          <Award className="h-16 w-16 text-gold mx-auto mb-4" />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{tpl.headline}</div>
          <div className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-gradient">{tpl.subheadline}</div>
          <div className="text-sm text-muted-foreground mt-1">{tpl.footerLine}</div>
          <div className="my-8 border-t border-border" />
          <div className="text-sm text-muted-foreground">{tpl.bodyLine}</div>
          <div className="font-serif text-2xl font-bold mt-4">{session?.name ?? "Delegate"}</div>
          <div className="text-sm text-muted-foreground mt-1">
            attended as a <span className="font-semibold text-foreground">{reg?.category ?? session?.role}</span>
          </div>
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            {tpl.signatures.map((s, i) => (
              <div key={i} className="text-xs">
                <div className="font-semibold">{s.name}</div>
                <div className="text-muted-foreground">{s.title}</div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            {canDownload ? (
              <Button className="gradient-blue text-accent-foreground" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-1" /> Download / print
              </Button>
            ) : !checkedIn ? (
              <Button disabled variant="outline">
                <Lock className="h-4 w-4 mr-1" /> Check in at the desk first
              </Button>
            ) : (
              <Button disabled variant="outline">
                <Lock className="h-4 w-4 mr-1" /> Available after the event
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
