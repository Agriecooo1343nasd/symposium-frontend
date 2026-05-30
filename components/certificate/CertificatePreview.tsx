"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Award } from "lucide-react";
import type { CertificateTemplate } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  template: CertificateTemplate;
  delegateName?: string;
  delegateCategory?: string;
  ticketId?: string;
  className?: string;
  /** Smaller preview in admin sidebar */
  compact?: boolean;
};

const DEFAULT_STYLE = {
  primaryColor: "#0f3d2e",
  accentColor: "#c9a227",
  showQr: true,
};

export function CertificatePreview({
  template,
  delegateName,
  delegateCategory,
  ticketId,
  className,
  compact,
}: Props) {
  const style = { ...DEFAULT_STYLE, ...template.style };
  const name = delegateName ?? template.previewName ?? "Sample Delegate";
  const category = delegateCategory ?? template.previewCategory ?? "International Delegate";
  const ticket = ticketId ?? template.previewTicketId ?? "NAS26-PREVIEW-0000";
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    if (!style.showQr) {
      setQrSrc("");
      return;
    }
    const payload = JSON.stringify({ id: ticket, name, cat: category });
    QRCode.toDataURL(payload, { width: compact ? 96 : 128, margin: 1, color: { dark: style.primaryColor, light: "#ffffff" } })
      .then(setQrSrc)
      .catch(() => setQrSrc(""));
  }, [style.showQr, style.primaryColor, ticket, name, category, compact]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-xl border-2",
        compact ? "p-4" : "p-6 sm:p-8",
        className,
      )}
      style={{
        borderColor: style.accentColor,
        background: template.backgroundImageUrl
          ? `url(${template.backgroundImageUrl}) center/cover`
          : `linear-gradient(145deg, ${style.primaryColor}08 0%, ${style.accentColor}12 50%, white 100%)`,
      }}
    >
      <div
        className="absolute inset-3 rounded-xl border pointer-events-none opacity-60"
        style={{ borderColor: style.accentColor }}
      />
      <div
        className="absolute inset-5 rounded-lg border pointer-events-none opacity-30"
        style={{ borderColor: style.primaryColor }}
      />

      <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center">
        <div className="flex justify-center gap-2 mb-3">
          <div
            className="h-1 flex-1 max-w-[80px] rounded-full mt-3"
            style={{ background: style.accentColor }}
          />
          <Award className={cn("text-gold shrink-0", compact ? "h-10 w-10" : "h-14 w-14")} style={{ color: style.accentColor }} />
          <div
            className="h-1 flex-1 max-w-[80px] rounded-full mt-3"
            style={{ background: style.accentColor }}
          />
        </div>

        <p
          className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold"
          style={{ color: style.primaryColor }}
        >
          {template.headline}
        </p>
        <h2
          className={cn("font-serif font-bold mt-2 leading-tight", compact ? "text-xl" : "text-2xl sm:text-3xl")}
          style={{ color: style.primaryColor }}
        >
          {template.subheadline}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{template.footerLine}</p>

        <div className="my-5 sm:my-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: style.accentColor }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: style.accentColor }}>
            Presented to
          </span>
          <div className="h-px flex-1" style={{ background: style.accentColor }} />
        </div>

        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{template.bodyLine}</p>

        <p
          className={cn("font-serif font-bold mt-4", compact ? "text-xl" : "text-2xl sm:text-3xl")}
          style={{ color: style.primaryColor }}
        >
          {name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          attended as <span className="font-semibold text-foreground">{category}</span>
        </p>

        {style.showQr && qrSrc && (
          <div className="mt-5 flex flex-col items-center gap-1">
            <img src={qrSrc} alt="Verification QR" className={cn("rounded-md border", compact ? "h-20 w-20" : "h-28 w-28")} />
            <span className="font-mono text-[10px] text-muted-foreground">{ticket}</span>
          </div>
        )}

        <div className={cn("flex justify-center gap-6 sm:gap-10 mt-6 flex-wrap", compact && "mt-4 gap-4")}>
          {template.signatures.map((sig, i) => (
            <div key={i} className="text-center min-w-[100px]">
              <div className="h-8 border-b border-foreground/20 mb-1 mx-2" />
              <div className="text-xs font-semibold" style={{ color: style.primaryColor }}>
                {sig.name}
              </div>
              <div className="text-[10px] text-muted-foreground leading-snug">{sig.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
