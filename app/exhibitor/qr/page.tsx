"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, ScanLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getExhibitorOrgId } from "@/lib/store";
import { exhibitorHasLeadCapture } from "@/lib/lead-capture";


export default function Page() {
  const store = useStore();
  const orgId = getExhibitorOrgId();
  const org = store.approvedOrganizations.find((o) => o.id === orgId) ?? store.approvedOrganizations[0];
  const boothCode = org ? `BOOTH-${org.booth}` : "BOOTH-DEMO";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasLeads = exhibitorHasLeadCapture(orgId);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, boothCode, { width: 240, margin: 2 });
    }
  }, [boothCode]);

  const download = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${org?.name ?? "booth"}-booth-qr.png`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Booth QR codes</h1>
        <p className="text-muted-foreground mt-1">
          Two different QR flows — do not confuse them.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">For registration desk</div>
          <h2 className="font-serif font-bold text-lg">Your booth check-in QR</h2>
          <p className="text-sm text-muted-foreground">
            Staff at the NAS registration desk scan this to validate booth companion entry. It is <strong>not</strong>{" "}
            scanned by attendees for leads.
          </p>
          <div className="rounded-xl bg-secondary/40 p-6 flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-md bg-white" />
            <div className="mt-4 text-center">
              <div className="font-serif font-bold">{org?.name}</div>
              <div className="font-mono text-sm text-muted-foreground mt-1">{boothCode}</div>
              <div className="text-xs text-muted-foreground mt-1">Booth {org?.booth}</div>
            </div>
            <Button variant="outline" className="mt-4" onClick={download}>
              <Download className="h-4 w-4 mr-1" /> Download PNG
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6 space-y-4 flex flex-col">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">For lead capture (FR-5.2)</div>
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-accent" /> Scan attendee badges
          </h2>
          <p className="text-sm text-muted-foreground flex-1">
            At the booth, your team scans each visitor&apos;s <strong>e-ticket QR</strong> from their phone. The platform
            saves their contact (with consent) and lets you add booth notes.
          </p>
          {hasLeads ? (
            <Button asChild className="gradient-blue text-accent-foreground w-full">
              <Link href="/exhibitor/leads">
                Open lead scanner <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Upgrade to Gold or Platinum sponsorship to enable QR lead capture.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
