"use client";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Users, Target, BookOpen, BookmarkPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubThemeBadge } from "@/components/SubThemeBadge";
import { SessionMaterialsPanel } from "@/components/session/SessionMaterialsPanel";
import { SessionRatingPanel } from "@/components/session/SessionRatingPanel";
import { canViewSessionProgramme } from "@/lib/access";
import { usePublicSession, usePublicSessions } from "@/hooks/api/usePublicData";
import { toast } from "sonner";

export default function SessionDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { session, raw, isLoading } = usePublicSession(id);
  const { sessions: allSessions } = usePublicSessions();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Loading session…</section>
    );
  }

  if (!session) {
    notFound();
  }

  if (!canViewSessionProgramme(session)) {
    return (
      <section className="mx-auto max-w-lg px-4 py-24 text-center">
        <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-serif text-2xl font-bold mb-2">Subscribers-only session</h1>
        <p className="text-muted-foreground mb-6">
          This session is not on the public programme. Sign in with a paid delegate pass or staff account to view
          details.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="gradient-blue text-accent-foreground">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/programme">Back to programme</Link>
          </Button>
        </div>
      </section>
    );
  }

  const speakers = (raw?.speakers ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title ?? "",
    org: s.organization ?? "",
    photo: s.photoUrl ?? "",
  }));
  const related = allSessions
    .filter((s) => s.id !== session.id && s.type === session.type)
    .slice(0, 3);

  return (
    <>
      <section className="gradient-navy grain-overlay text-white relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 mb-6">
            <Link href="/programme"><ArrowLeft className="h-4 w-4 mr-1" /> Back to programme</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">{session.type}</span>
            <SubThemeBadge theme={session.subTheme} />
            <span className="rounded-full bg-gold/20 text-gold px-3 py-1 text-xs font-semibold">Day {session.day} · 13 Aug 2026</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">{session.title}</h1>
          <div className="flex flex-wrap gap-5 mt-6 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" /> {session.start} – {session.end}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> {session.room}</span>
            {session.capacity && <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-gold" /> Capacity {session.capacity}</span>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1.6fr_1fr] gap-10">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-3">About this session</h2>
          <p className="text-muted-foreground leading-relaxed">{session.longDescription ?? session.description}</p>

          {session.learningObjectives && (
            <div className="mt-8">
              <h3 className="font-serif text-lg font-bold mb-3 inline-flex items-center gap-2"><Target className="h-4 w-4 text-accent" /> What you&apos;ll take away</h3>
              <ul className="space-y-2">
                {session.learningObjectives.map((l) => (
                  <li key={l} className="flex gap-2 text-sm"><span className="text-accent">•</span><span>{l}</span></li>
                ))}
              </ul>
            </div>
          )}

          {session.prerequisites && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1 inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Good to know</div>
              <p className="text-sm text-amber-900">{session.prerequisites}</p>
            </div>
          )}

          {speakers.length > 0 && (
            <div className="mt-10">
              <h3 className="font-serif text-lg font-bold mb-4">Speakers</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {speakers.map((s) => (
                  <div key={s.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4 hover-lift">
                    <img src={s.photo} alt={s.name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.org}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <SessionMaterialsPanel sessionId={session.id} sessionTitle={session.title} />
          </div>
          <div className="mt-6">
            <SessionRatingPanel session={session} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5 sticky top-20">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Save your spot</div>
            <Button onClick={() => toast.success("Added to your schedule", { description: session.title })} className="w-full gradient-blue text-accent-foreground">
              <BookmarkPlus className="h-4 w-4 mr-1.5" /> Add to my schedule
            </Button>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/register">Not registered? Register</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2 text-sm">
              <Link href="/dashboard/live">Join live stream</Link>
            </Button>
          </div>

          <SessionRatingPanel session={session} compact />

          {related.length > 0 && (
            <div className="rounded-2xl bg-secondary/50 border border-border p-5">
              <h4 className="font-serif font-bold text-sm mb-3">More on {session.subTheme}</h4>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/programme/${r.id}`} className="block text-sm hover:text-accent transition-colors">
                      <div className="font-medium leading-tight">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Day {r.day} · {r.start}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
