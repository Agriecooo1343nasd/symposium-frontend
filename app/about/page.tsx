import type { Metadata } from "next";
import { Target, Sprout, Trophy, Users } from "lucide-react";
import { getCommitteeMembers, getEventConfig } from "@/lib/platform-settings";

export const metadata: Metadata = {
  title: "About — NAS 2026",
  description: "About the 3rd National Agroecology Symposium: background, rationale, objectives, and organizing committee.",
};

export default function About() {
  const event = getEventConfig();
  const committee = getCommitteeMembers();

  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-20 sm:py-28">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-up">
            Building on the 2nd NAS roadmap, <span className="text-gradient-light">towards a national agroecology agenda.</span>
          </h1>
          <p className="mt-6 text-white/80 text-lg max-w-2xl mx-auto animate-fade-up delay-1">
            The 3rd NAS convenes Rwanda's most influential voices in food systems to translate evidence into policy and policy into practice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-lg max-w-none">
          <h2 className="font-serif text-3xl font-bold tracking-tight mb-4">Background & rationale</h2>
          <p className="text-muted-foreground leading-relaxed">
            Rwanda's hillside farming systems are at a turning point. After the 2nd National Agroecology Symposium delivered a national roadmap in 2024, the 3rd Symposium is the first opportunity to assess what's working, what's not, and where the country needs to invest next.
          </p>

          <h2 className="font-serif text-3xl font-bold tracking-tight mt-12 mb-4">What you'll experience</h2>
          <p className="text-muted-foreground leading-relaxed">
            Two days of plenaries, panels, hands-on workshops, and a live field visit. Dedicated networking time, a curated exhibitor showcase, and the adoption of the Kigali Call to Action on the closing day.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-14">
          {[
            { icon: Sprout, label: "Theme", body: event.theme },
            { icon: Target, label: "Objectives", body: "Strengthen evidence, advance policy, accelerate adoption." },
            { icon: Trophy, label: "Outcomes", body: "The Kigali Call to Action and a costed national roadmap." },
          ].map((c) => (
            <div key={c.label} className="glass-card rounded-2xl p-6">
              <c.icon className="h-6 w-6 text-accent mb-3" />
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{c.label}</div>
              <div className="text-sm font-medium text-foreground">{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
  
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-10">The people behind {event.shortName}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {committee.map((p) => (
              <div key={p.id} className="rounded-2xl bg-card border border-border p-6 hover-lift">
                <img src={p.photo} alt={p.name} className="h-12 w-12 rounded-full object-cover mb-3" />
                <div className="font-serif font-bold text-base">{p.name}</div>
                <div className="text-sm text-accent font-medium">{p.role}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.org}</div>
                {"bio" in p && p.bio ? <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{p.bio}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
