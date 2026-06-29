"use client";
import { getCountdownTarget } from "@/lib/platform-settings";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function calc(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

export function CountdownTimer({
  light = false,
  compact = false,
  target,
}: {
  light?: boolean;
  compact?: boolean;
  target?: Date | string | null;
}) {
  useStore();
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  useEffect(() => {
    const resolveTarget = () => {
      if (target) {
        const d = typeof target === "string" ? new Date(target) : target;
        if (!Number.isNaN(d.getTime())) return d;
      }
      return getCountdownTarget();
    };
    const update = () => setT(calc(resolveTarget()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-3", compact && "max-w-md")}>
      {items.map((it) => (
        <div
          key={it.l}
          className={cn(
            "rounded-2xl px-2 py-3 sm:py-4 text-center backdrop-blur-md",
            light
              ? "bg-white/10 border border-white/20"
              : "bg-card border border-border"
          )}
        >
          <div
            className={cn(
              "font-serif font-bold tabular-nums",
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl",
              light ? "text-gold" : "text-gradient"
            )}
          >
            {String(it.v).padStart(2, "0")}
          </div>
          <div
            className={cn(
              "text-[10px] sm:text-xs font-medium uppercase tracking-widest mt-1",
              light ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {it.l}
          </div>
        </div>
      ))}
    </div>
  );
}
