import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrationPaymentForm } from "@/components/registration/RegistrationPaymentForm";
import { EVENT } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useMyRegistrations } from "@/hooks/api/useRegistration";
import {
  formatRegistrationExpiry,
  isRegistrationPaid,
  primaryRegistration,
  registrationCategoryLabel,
  registrationDisplayAmount,
  registrationStatusLabel,
} from "@/lib/api/mappers/registration-helpers";
import { userDisplayName } from "@/lib/api/mappers/user";
import { useCurrentUser } from "@/hooks/api/useAuthSession";

export function TicketCard() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { session } = useAuth();
  const { data: user } = useCurrentUser();
  const { registrations, isLoading, refetch } = useMyRegistrations();
  const { symposium } = useSymposium();

  const reg = useMemo(() => primaryRegistration(registrations), [registrations]);
  const qrPayload = reg?.qrData ?? reg?.qrCode ?? null;
  const name = user ? userDisplayName(user) : session?.name ?? "Delegate";
  const email = user?.email ?? session?.email ?? "";
  const category = registrationCategoryLabel(reg);
  const ticketId = reg?.id?.slice(0, 8).toUpperCase() ?? "—";
  const venue = symposium?.venue ?? EVENT.venue;
  const isActive = reg?.status === "active" && Boolean(qrPayload);

  useEffect(() => {
    if (!qrPayload || !ref.current) return;
    QRCode.toCanvas(ref.current, qrPayload, {
      width: 220,
      margin: 1,
      color: { dark: "#0a1428", light: "#ffffff" },
    });
    QRCode.toDataURL(qrPayload, { width: 600, margin: 2 }).then(setUrl);
  }, [qrPayload]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
        Loading your e-ticket…
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No registration found for this account.</p>
        <Button asChild className="mt-4 gradient-blue text-accent-foreground">
          <a href="/register">Register for NAS 2026</a>
        </Button>
      </div>
    );
  }

  if (!isRegistrationPaid(reg)) {
    const deadline = formatRegistrationExpiry(reg.expiresAt);
    const amount = registrationDisplayAmount(reg);
    const isAwaitingPayment = reg.status === "pending_payment";

    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 max-w-2xl">
        <p className="font-serif font-bold text-lg text-center">
          {isAwaitingPayment ? "Registration complete — payment pending" : "Registration pending"}
        </p>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Your pass status is <strong>{registrationStatusLabel(reg.status)}</strong>.
          {isAwaitingPayment
            ? ` Pay ${amount} to activate your e-ticket.${deadline ? ` Complete payment by ${deadline}.` : ""}`
            : " Your e-ticket QR will appear here once payment is confirmed and your pass is active."}
        </p>

        {isAwaitingPayment && (
          <div className="mt-6">
            {!showPayment ? (
              <div className="flex justify-center">
                <Button className="gradient-blue text-accent-foreground" onClick={() => setShowPayment(true)}>
                  Complete payment
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 mt-4">
                <RegistrationPaymentForm
                  registrationId={reg.id}
                  defaultPhone={user?.phone ?? ""}
                  onPaid={() => {
                    void refetch();
                    setShowPayment(false);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-xl max-w-2xl">
      <div className="gradient-navy text-white p-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-70">E-Ticket</div>
          <div className="font-serif text-2xl font-bold mt-1">{EVENT.shortName}</div>
          <div className="text-sm opacity-80 mt-0.5">{symposium?.theme ?? EVENT.theme}</div>
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
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Registration</div>
              <div className="text-sm font-mono font-semibold text-foreground mt-0.5">{ticketId}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {isActive
              ? "Show this QR at the registration desk and exhibitor booths."
              : "Your QR activates once verification is complete and your pass status is active."}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> 13–14 August 2026
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {venue}
            </div>
          </div>
          {reg.ticketPdfUrl && !reg.ticketPdfUrl.startsWith("pending://") && (
            <Button asChild size="sm" variant="outline">
              <a href={reg.ticketPdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" /> Download PDF ticket
              </a>
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          {isActive && qrPayload ? (
            <>
              <div className="rounded-xl bg-white p-3 border border-border">
                <canvas ref={ref} />
              </div>
              {url && (
                <Button asChild size="sm" variant="outline" className="w-full">
                  <a href={url} download={`nas-ticket-${ticketId}.png`}>
                    <Download className="h-4 w-4 mr-1" /> Download QR
                  </a>
                </Button>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              QR available when your pass is active
              <div className="text-xs mt-1 capitalize">{registrationStatusLabel(reg.status)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
