import { cn } from "@/lib/utils";

export function CurrencyToggle({ currency, onChange }: { currency: "USD" | "RWF"; onChange: (c: "USD" | "RWF") => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
      {(["USD", "RWF"] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
            currency === c
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function formatPrice(usd: number, currency: "USD" | "RWF", rate: number) {
  if (usd === 0) return currency === "USD" ? "Free" : "Free";
  if (currency === "USD") return `$${usd.toLocaleString()}`;
  return `RWF ${Math.round(usd * rate).toLocaleString()}`;
}
