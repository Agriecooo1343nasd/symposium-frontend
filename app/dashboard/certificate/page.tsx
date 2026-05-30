"use client";

import { Download, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
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

      <CertificatePreview
        template={tpl}
        delegateName={session?.name ?? "Delegate"}
        delegateCategory={reg?.category ?? session?.role}
        ticketId={reg?.details?.ticketId}
      />
      <div className="mt-6 flex justify-center">
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
  );
}
