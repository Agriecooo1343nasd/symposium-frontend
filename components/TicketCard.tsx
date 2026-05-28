import { useEffect, useRef, useState, useMemo } from "react";
import QRCode from "qrcode";
import { Download, Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, DEMO_USER } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";

export function TicketCard() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string>("");
  const { session } = useAuth();
  const store = useStore();

  const reg = useMemo(() => {
    if (session?.email) {
      const mine = store.registrations.find((r) => r.email === session.email);
      if (mine) return mine;
    }
    return store.registrations.find((r) => r.email === "alice@example.rw");
  }, [session?.email, store.registrations]);

  const ticketId = reg?.details?.ticketId ?? DEMO_USER.ticketId;
  const name = reg?.name ?? session?.name ?? DEMO_USER.name;
  const email = reg?.email ?? session?.email ?? DEMO_USER.email;
  const category = reg?.category ?? session?.category ?? DEMO_USER.category;

  useEffect(() => {
    const payload = JSON.stringify({
      id: ticketId,
      name,
      cat: category,
      hash: "nas26-" + ticketId.replace(/[^a-z0-9]/gi, "").slice(-8),
    });
    if (ref.current) {
      QRCode.toCanvas(ref.current, payload, {
        width: 220,
        margin: 1,
        color: { dark: "#0a1428", light: "#ffffff" },
      });
    }
    QRCode.toDataURL(payload, { width: 600, margin: 2 }).then(setUrl);
  }, [ticketId, name, category]);

  return (
    <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-xl max-w-2xl">
      <div className="gradient-navy text-white p-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-70">E-Ticket</div>
          <div className="font-serif text-2xl font-bold mt-1">{EVENT.shortName}</div>
          <div className="text-sm opacity-80 mt-0.5">{EVENT.theme}</div>
        </div>
        <Ticket className="h-10 w-10 opacity-80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6 p-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Attendee</div>
            <div className="font-serif text-xl font-bold text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Category</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">{category}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Ticket ID</div>
              <div className="text-sm font-mono font-semibold text-foreground mt-0.5">{ticketId}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Exhibitors scan this QR at your booth to capture your contact — only if you allow exhibitor contact in your
            profile privacy settings.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> 13–14 August 2026
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {EVENT.venue}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-white p-3 border border-border">
            <canvas ref={ref} />
          </div>
          {url && (
            <Button asChild size="sm" variant="outline" className="w-full">
              <a href={url} download={`${ticketId}.png`}>
                <Download className="h-4 w-4 mr-1" /> Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
