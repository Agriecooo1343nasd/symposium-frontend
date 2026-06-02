"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, FileCheck } from "lucide-react";
import { FileViewButton } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { TICKET_CATEGORIES } from "@/lib/mock-data";

export default function DeskRegistrationDetailPage() {
  const params = useParams();
  const registrationId = typeof params.registrationId === "string" ? params.registrationId : "";
  const store = useStore();
  const reg = store.registrations.find((r) => r.id === registrationId);
  if (!reg) notFound();

  const plan =
    store.ticketPlans.find((p) => p.id === reg.categoryId) ?? TICKET_CATEGORIES.find((c) => c.id === reg.categoryId);
  const verification = store.documentVerifications.find((v) => v.registrationId === reg.id);
  const needsDocReview = reg.verificationStatus === "pending" || verification?.status === "pending";

  const fields: [string, string | undefined][] = [
    ["Ticket ID", reg.details?.ticketId],
    ["Full name", reg.name],
    ["Email", reg.email],
    ["Phone", reg.details?.phone],
    ["Country", reg.country],
    ["Pass / category", reg.category],
    ["Plan price", plan ? `$${plan.usd} USD` : `$${reg.amountUsd} USD`],
    ["Payment status", reg.status],
    ["Payment method", reg.details?.paymentMethod],
    ["Amount charged", `$${reg.amountUsd} USD`],
    ["Verification", reg.verificationStatus ?? "none"],
    ["Professional title", reg.details?.title],
    ["Organization", reg.details?.org],
    ["Dietary requirements", reg.details?.dietary],
    ["Accessibility needs", reg.details?.access],
    ["How they heard about us", reg.details?.hear],
    ["LinkedIn", reg.details?.linkedin],
    ["Interests", reg.details?.interests?.join(", ")],
    ["Registered on", reg.createdAt],
    ["Check-in", reg.checkedIn ? `Yes — ${reg.checkedInAt ?? "recorded"}` : "Not yet"],
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/desk/registrations">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to registrations
        </Link>
      </Button>

      <div>
        <h1 className="font-serif text-3xl font-bold">{reg.name}</h1>
        <p className="text-muted-foreground">Registration as submitted on the public form — same fields as /register.</p>
      </div>

      {needsDocReview && verification && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-amber-900">
            <strong>Document verification required</strong> — {verification.type} proof uploaded ({verification.fileName}).
          </div>
          <Button asChild size="sm" className="gradient-blue text-accent-foreground">
            <Link href={`/desk/verifications?highlight=${verification.id}`}>
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

      {plan && (
        <div className="rounded-md bg-secondary/40 border border-border p-5">
          <h3 className="font-serif font-bold text-sm mb-2">Pass chosen</h3>
          <div className="font-medium">{plan.name}</div>
          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
          <ul className="mt-2 text-xs text-muted-foreground space-y-1">
            {plan.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
      )}

      {verification?.fileDataUrl && (
        <div className="rounded-md bg-card border border-border p-5">
          <h3 className="font-serif font-bold text-sm mb-3">Uploaded proof</h3>
          {verification.fileDataUrl.startsWith("data:image") ? (
            <img
              src={verification.fileDataUrl}
              alt={verification.fileName}
              className="max-h-64 rounded-md border border-border object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground mb-2">{verification.fileName}</p>
          )}
          <FileViewButton
            src={verification.fileDataUrl}
            fileName={verification.fileName}
            label="View full screen"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">{verification.status}</p>
        </div>
      )}
    </div>
  );
}
