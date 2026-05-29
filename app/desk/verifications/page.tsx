"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { VerificationReviewList } from "@/components/desk/VerificationReview";
import { cn } from "@/lib/utils";

export default function DeskVerificationsPage() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight") ?? undefined;
  const store = useStore();
  const pending = store.documentVerifications.filter((d) => d.status === "pending");
  const rest = store.documentVerifications.filter((d) => d.status !== "pending");
  const highlighted = highlight ? store.documentVerifications.find((d) => d.id === highlight) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Document verification</h1>
        <p className="text-muted-foreground">
          Student cards and farmer organization letters — linked from registrations when proof is required.
        </p>
      </div>

      {highlighted && (
        <div className={cn("rounded-md border-2 border-accent bg-accent/5 p-4")} id={`verify-${highlighted.id}`}>
          <p className="text-sm font-medium mb-1">Opened from registration review</p>
          <p className="text-xs text-muted-foreground">
            {highlighted.registrantName} · {highlighted.type} ·{" "}
            <Link
              href={`/desk/registrations/${highlighted.registrationId}`}
              className="text-accent hover:underline"
            >
              View registration
            </Link>
          </p>
        </div>
      )}

      <VerificationReviewList items={[...pending, ...rest]} highlightId={highlight} />
    </div>
  );
}
