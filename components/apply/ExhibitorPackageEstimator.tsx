import { Users, DollarSign, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT } from "@/lib/mock-data";
import { calculateOrgPackageFee, type AppStore, type ParticipationType, type SponsorshipTier } from "@/lib/store";

type Props = {
  store: AppStore;
  participation: ParticipationType;
  tier?: SponsorshipTier;
  staffCount: number;
  onStaffCountChange: (n: number) => void;
};

/** FR-5.1 / FR-2.1 — org pays package; staff passes bundled (no individual payment) */
export function ExhibitorPackageEstimator({ store, participation, tier, staffCount, onStaffCountChange }: Props) {
  const quote = calculateOrgPackageFee(participation, tier, staffCount, store);
  const rwf = Math.round(quote.feeUsd * EVENT.exchangeRate);

  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-secondary/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif font-bold">Package estimate</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            your organization pays one sponsorship/booth fee. <strong>Exhibitor staff passes are bundled</strong> — invited
            colleagues check in with comp QR codes and do not pay individually.
          </p>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Staff you plan to bring (booth team)
        </Label>
        <Input
          type="number"
          min={1}
          max={50}
          value={staffCount}
          onChange={(e) => onStaffCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="mt-1 max-w-[120px]"
          placeholder="e.g. 4"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          {quote.includedStaff} included · {quote.extraStaff > 0 ? `${quote.extraStaff} extra @ admin rate` : "within quota"}
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-border">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Estimated total</div>
          <div className="font-serif text-3xl font-bold text-accent">${quote.feeUsd.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">≈ RWF {rwf.toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted-foreground max-w-xs flex gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Admin reviews your application and issues an invoice (FR-5.1). Payment confirms booth and staff pass quota.
        </div>
      </div>
    </div>
  );
}
