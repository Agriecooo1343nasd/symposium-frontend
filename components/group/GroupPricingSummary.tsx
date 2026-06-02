"use client";

import { calculateGroupPricing, formatGroupDiscountLine } from "@/lib/group-registration";
import { cn } from "@/lib/utils";

type Props = {
  memberCount: number;
  pricePerSeatUsd: number;
  currency: "USD" | "RWF";
  exchangeRate: number;
  className?: string;
  compact?: boolean;
};

export function GroupPricingSummary({ memberCount, pricePerSeatUsd, currency, exchangeRate, className, compact }: Props) {
  const pricing = calculateGroupPricing(memberCount, pricePerSeatUsd);
  const lines = formatGroupDiscountLine(pricing, currency, exchangeRate);

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      {!compact && (
        <p className="text-xs text-muted-foreground">{pricing.tierLabel}</p>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          {memberCount} × {currency === "USD" ? `$${pricePerSeatUsd}` : `RWF ${Math.round(pricePerSeatUsd * exchangeRate).toLocaleString()}`}
        </span>
        <span>{lines.subtotal}</span>
      </div>
      {pricing.discountUsd > 0 && (
        <div className="flex justify-between text-green font-medium">
          <span>Group discount</span>
          <span>{lines.discount}</span>
        </div>
      )}
      <div className={cn("flex justify-between font-serif font-bold", compact ? "text-base pt-2 border-t" : "text-lg pt-2 border-t mt-1")}>
        <span>Total</span>
        <span className="text-gradient">{lines.total}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{lines.perSeat} per person after discount</p>
    </div>
  );
}
