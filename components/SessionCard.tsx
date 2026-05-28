import { Clock, MapPin, Flame, BookmarkPlus, Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { SubThemeBadge } from "@/components/SubThemeBadge";
import { SPEAKERS, type Session } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<Session["type"], string> = {
  Keynote: "bg-gold/15 text-gold border-gold/30",
  Plenary: "bg-blue/10 text-blue border-blue/30",
  Panel: "bg-navy/10 text-navy border-navy/20",
  Workshop: "bg-green/10 text-green border-green/30",
  "Field Visit": "bg-amber-100 text-amber-800 border-amber-300",
};

export function SessionCard({ session, expandable = true, onSave }: { session: Session; expandable?: boolean; onSave?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const speakers = session.speakers.map((id) => SPEAKERS.find((s) => s.id === id)).filter(Boolean) as typeof SPEAKERS;

  return (
    <article className="glass-card rounded-2xl p-5 hover-lift group">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-xs font-semibold tabular-nums">
          <Clock className="h-3 w-3" /> {session.start} – {session.end}
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", TYPE_STYLES[session.type])}>
          {session.type}
        </span>
        <SubThemeBadge theme={session.subTheme} />
        {session.trending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 text-xs font-semibold">
            <Flame className="h-3 w-3" /> Trending
          </span>
        )}
      </div>

      <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug mb-2 text-foreground group-hover:text-accent transition-colors">
        {session.title}
      </h3>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {session.room}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {speakers.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-full bg-secondary px-1.5 py-1 pr-3">
            <img src={s.photo} alt="" className="h-6 w-6 rounded-full object-cover" />
            <span className="text-xs font-medium text-foreground">{s.name}</span>
          </div>
        ))}
      </div>

      {(expandable && open) && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 animate-fade-up">{session.description}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border gap-3">
        {expandable ? (
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground transition-colors">
              {open ? "Hide" : "Quick view"}
            </button>
            <Link href={`/programme/${session.id}`} className="text-accent hover:underline inline-flex items-center gap-1">
              Full details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs font-semibold min-w-0">
            <span className="text-muted-foreground line-clamp-1 flex-1">{session.description}</span>
            <Link href={`/programme/${session.id}`} className="text-accent hover:underline inline-flex items-center gap-1 shrink-0">
              Full details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}
        {onSave && (
          <button
            onClick={() => { setSaved(!saved); onSave(); }}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors",
              saved ? "text-green" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Add to schedule"}
          </button>
        )}
      </div>
    </article>
  );
}
