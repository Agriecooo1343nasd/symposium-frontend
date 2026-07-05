"use client";

import { SponsorshipFinancePanel } from "@/components/admin/SponsorshipFinancePanel";

type Props = {
  actorName?: string;
  readOnly?: boolean;
  basePath?: "/admin/exhibitors" | "/desk/exhibitors";
};

export function SponsorshipRecordsList({ readOnly = false }: Props) {
  return <SponsorshipFinancePanel readOnly={readOnly} showSponsorCards={!readOnly} />;
}
