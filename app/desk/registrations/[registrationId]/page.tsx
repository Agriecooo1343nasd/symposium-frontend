"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, FileCheck } from "lucide-react";
import { FileViewButton } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import {
  useDeskRegistration,
  useRegistrationAttendance,
  registrationStatusLabel,
} from "@/hooks/api/useDesk";
import { registrationCategoryLabel } from "@/lib/api/mappers/registration-helpers";

export default function DeskRegistrationDetailPage() {
  const params = useParams();
  const registrationId = typeof params.registrationId === "string" ? params.registrationId : "";
  const { registration, isLoading, isError } = useDeskRegistration(registrationId);
  const attendance = useRegistrationAttendance(registrationId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading registration…</p>;
  }

  if (isError || !registration) notFound();

  const needsDocReview = registration.status === "pending_verification";
  const checkIns = attendance.data?.checkIns ?? [];

  const fields: [string, string | undefined][] = [
    ["Registration ID", registration.id],
    ["User ID", registration.userId],
    ["Pass / category", registrationCategoryLabel(registration)],
    ["Status", registrationStatusLabel(registration.status)],
    ["Verification", registration.verificationStatus ?? "—"],
    ["Attendance type", registration.attendanceType ?? "—"],
    ["Amount (USD)", registration.amountUsd != null ? `$${registration.amountUsd}` : undefined],
    ["Amount (RWF)", registration.amountRwf != null ? `${registration.amountRwf} RWF` : undefined],
    ["Currency", registration.currency ?? undefined],
    ["Payment date", registration.paidAt ? new Date(registration.paidAt).toLocaleString() : undefined],
    ["Referral source", registration.referralSource ?? undefined],
    ["On-site", registration.isOnSite ? "Yes" : "No"],
    ["Registered on", new Date(registration.createdAt).toLocaleString()],
    ["Check-ins", checkIns.length ? `${checkIns.length} recorded` : "None yet"],
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/desk/registrations">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to registrations
        </Link>
      </Button>

      <div>
        <h1 className="font-serif text-3xl font-bold">Registration {registration.id.slice(0, 8)}…</h1>
        <p className="text-muted-foreground">
          API registration record. Attendee name/email require a user lookup endpoint with desk permissions.
        </p>
      </div>

      {needsDocReview && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-amber-900">
            <strong>Document verification required</strong> — review proof before activating the ticket.
          </div>
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href={`/desk/verifications?highlight=${registration.id}`}>
              <FileCheck className="h-3.5 w-3.5 mr-1" /> Review document
            </Link>
          </Button>
        </div>
      )}

      <div className="rounded-md bg-card border border-border p-6">
        <h2 className="font-serif font-bold mb-4">Registration details</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{k}</dt>
              <dd className="mt-1 font-medium break-words">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {registration.ticketCategory && (
        <div className="rounded-md bg-secondary/40 border border-border p-5">
          <h3 className="font-serif font-bold text-sm mb-2">Pass chosen</h3>
          <div className="font-medium">{registration.ticketCategory.name}</div>
          <p className="text-sm text-muted-foreground mt-1">
            ${registration.ticketCategory.priceUsd} USD / {registration.ticketCategory.priceRwf} RWF
          </p>
        </div>
      )}

      {registration.verificationDocUrl && (
        <div className="rounded-md bg-card border border-border p-5">
          <h3 className="font-serif font-bold text-sm mb-3">Uploaded proof</h3>
          <FileViewButton
            src={registration.verificationDocUrl}
            fileName="verification-document"
            label="View full screen"
          />
        </div>
      )}

      {checkIns.length > 0 && (
        <div className="rounded-md bg-card border border-border p-5">
          <h3 className="font-serif font-bold text-sm mb-3">Check-in history</h3>
          <ul className="space-y-2 text-sm">
            {checkIns.map((c) => (
              <li key={c.id} className="flex justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span className="capitalize">{c.method.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground text-xs">{new Date(c.checkedInAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
