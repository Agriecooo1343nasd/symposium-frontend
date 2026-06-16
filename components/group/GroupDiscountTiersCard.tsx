"use client";

import { Users, Percent } from "lucide-react";
import { calculateGroupPricing } from "@/lib/group-registration";
import { formatPrice } from "@/components/CurrencyToggle";
import type { GroupRegistrationSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  settings: GroupRegistrationSettings;
  /** Example per-seat price for savings preview (e.g. popular plan USD) */
  examplePriceUsd?: number;
  currency?: "USD" | "RWF";
  exchangeRate?: number;
  className?: string;
  compact?: boolean;
};

export function GroupDiscountTiersCard({
  settings,
  examplePriceUsd = 150,
  currency = "USD",
  exchangeRate = 1465,
  className,
  compact,
}: Props) {
  if (!settings.enabled) return null;

  const tiers = [
    {
      label: `${settings.minSize}–9 delegates`,
      percent: settings.tier5to9Percent,
      count: settings.minSize,
    },
    {
      label: "10+ delegates",
      percent: settings.tier10PlusPercent,
      count: 10,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 to-secondary/40",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
          <Users className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className={cn("font-serif font-bold", compact ? "text-base" : "text-lg")}>
            Group registration — volume discounts
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Register {settings.minSize}–{settings.maxSize} delegates under one organization. One representative pays a
            single invoice; each member gets their own e-ticket.
          </p>
        </div>
      </div>

      <div className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {tiers.map((tier) => {
          const pricing = calculateGroupPricing(tier.count, examplePriceUsd);
          return (
            <div key={tier.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-accent mb-1">
                <Percent className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{tier.label}</span>
              </div>
              <div className="font-serif text-2xl font-bold text-gradient">{tier.percent}% off</div>
              {examplePriceUsd > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
                  Example ({tier.count} × {formatPrice(examplePriceUsd, currency, exchangeRate)}): save{" "}
                  <span className="font-medium text-green">
                    {formatPrice(pricing.discountUsd, currency, exchangeRate)}
                  </span>{" "}
                  → {formatPrice(pricing.totalUsd, currency, exchangeRate)} total
                </p>
              )}
            </div>
          );
        })}
        {!compact && (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-4 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Minimum group size</div>
            <div className="font-serif text-2xl font-bold mt-1">{settings.minSize} delegates</div>
            <p className="text-[11px] text-muted-foreground mt-2">Max {settings.maxSize} per group registration</p>
          </div>
        )}
      </div>
    </div>
  );
}
