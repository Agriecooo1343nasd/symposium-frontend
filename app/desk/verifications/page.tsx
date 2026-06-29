"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VerificationReviewList } from "@/components/desk/VerificationReview";
import { usePendingVerifications } from "@/hooks/api/useDesk";
import { cn } from "@/lib/utils";

export default function DeskVerificationsPage() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight") ?? undefined;
  const { items } = usePendingVerifications();
  const highlighted = highlight ? items.find((d) => d.id === highlight) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Document verification</h1>
        <p className="text-muted-foreground">
          Student cards and farmer organization letters — from `GET /attendance/pending-verifications`.
        </p>
      </div>

      {highlighted && (
        <div className={cn("rounded-md border-2 border-accent bg-accent/5 p-4")} id={`verify-${highlighted.id}`}>
          <p className="text-sm font-medium mb-1">Opened from registration review</p>
          <p className="text-xs text-muted-foreground">
            {highlighted.userName ?? "Delegate"} · {highlighted.userEmail} ·{" "}
            <Link
              href={`/desk/registrations/${highlighted.id}`}
              className="text-accent hover:underline"
            >
              View registration
            </Link>
          </p>
        </div>
      )}

      <VerificationReviewList highlightId={highlight} />
    </div>
  );
}
