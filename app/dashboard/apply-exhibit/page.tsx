"use client";

import { Store } from "lucide-react";
import { ExhibitorSponsorApplyForm } from "@/components/apply/ExhibitorSponsorApplyForm";

export default function ApplyExhibitPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Store className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold leading-tight">Apply to exhibit or sponsor</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Apply as an <strong>exhibitor</strong> (booth package) or a <strong>sponsor</strong> (Platinum / Gold / Silver
            tier with booth included) — one path per application. Fees come from the admin-configured catalog. The
            secretariat reviews your request and issues an invoice after approval.
          </p>
        </div>
      </div>

      <ExhibitorSponsorApplyForm />
    </div>
  );
}
