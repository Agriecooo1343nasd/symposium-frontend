"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, Target, Trophy, MapPin, Calendar, Users, Globe2, Sprout, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SponsorMarquee } from "@/components/SponsorMarquee";
import { SessionCard } from "@/components/SessionCard";
import { SpeakerCard } from "@/components/SpeakerCard";
import { StatsCounter } from "@/components/StatsCounter";
import { CurrencyToggle, formatPrice } from "@/components/CurrencyToggle";
import { EVENT, SESSIONS, SPEAKERS, NEWS, TICKET_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Home() {
  const [currency, setCurrency] = useState<"USD" | "RWF">("USD");

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-navy grain-overlay text-white">
        <div className="absolute inset-0">
          <img src="/assets/image.png" alt="Rwandan agroecological landscape" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/70 to-navy/40" />
        </div>
        <div className="absolute inset-0 leaf-texture opacity-40" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue/20 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gold/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-1.5 text-xs font-medium tracking-wider uppercase mb-6 animate-fade-up">
                <span>3rd National Agroecology Symposium</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight animate-fade-up delay-1">
                Cultivating Rwanda's
                <br />
                <span className="text-gradient-light">Agroecological Future</span>
                <br />— Together.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed animate-fade-up delay-2">
                Two days. 300+ policymakers, researchers, farmers and partners. One vision for resilient food systems across Rwanda and the region.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/80 animate-fade-up delay-2">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> 13–14 August 2026</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Kigali Marriott Hotel</div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 animate-fade-up delay-3">
                <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold">
                  <Link href="/register">Register Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <Link href="/programme">View Programme</Link>
                </Button>
              </div>
            </div>

            <div className="animate-fade-up delay-3">
              <div className="text-xs uppercase tracking-widest text-white/60 mb-3 text-center lg:text-left">Countdown to opening ceremony</div>
              <CountdownTimer light />
            </div>
          </div>
        </div>

        {/* curved bottom */}
        <svg viewBox="0 0 1440 64" className="block w-full text-background" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,64 C480,0 960,0 1440,64 L1440,64 L0,64 Z" fill="currentColor" />
        </svg>
      </section>

      {/* STATS BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 rounded-3xl bg-card border border-border shadow-xl p-4 sm:p-6">
          {[
            { icon: Users, value: 300, suffix: "+", label: "Participants" },
            { icon: Trophy, value: 20, suffix: "+", label: "Exhibitors" },
            { icon: Calendar, value: 2, suffix: "", label: "Event Days" },
            { icon: Globe2, value: 15, suffix: "+", label: "Countries" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3">
              <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl sm:text-4xl font-bold text-gradient">
                <StatsCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            A flagship moment for <span className="text-gradient">food systems transformation</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Building on the 2nd NAS roadmap, this Symposium convenes policymakers, researchers, farmers, civil society, private sector, and development partners to co-shape Rwanda's agroecological agenda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Sprout, title: "Symposium Theme", body: "Cultivating Rwanda's agroecological future — through evidence, policy and farmer-led innovation.", color: "text-green" },
            { icon: Target, title: "Key Objectives", body: "Strengthen the evidence base, advance enabling policy, and accelerate adoption of agroecological practices at scale.", color: "text-accent" },
            { icon: Trophy, title: "Expected Outcomes", body: "The Kigali Call to Action, a published proceedings, and a costed roadmap to the 4th NAS in 2028.", color: "text-gold" },
          ].map((c, i) => (
            <div key={c.title} className={cn("glass-card rounded-2xl p-6 hover-lift animate-fade-up", `delay-${i + 1}`)}>
              <div className={cn("h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4", c.color)}>
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMME PREVIEW */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Two days, four tracks, dozens of voices.</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/programme">View full programme <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {SESSIONS.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} expandable={false} />
            ))}
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Voices shaping the agenda.</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/speakers">All speakers <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPEAKERS.filter((s) => s.featured).slice(0, 6).map((s) => (
            <SpeakerCard key={s.id} speaker={s} />
          ))}
        </div>
      </section>

      {/* SPONSORS */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Backed by Africa's leading institutions</h2>
          </div>
          <SponsorMarquee />
        </div>
      </section>

      {/* TICKETS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Find the right pass for you.</h2>
            <p className="text-muted-foreground mt-2">All prices listed in {currency}. Switch anytime.</p>
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TICKET_CATEGORIES.slice(0, 8).map((t) => (
            <div
              key={t.id}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col hover-lift bg-card",
                t.popular ? "border-accent ring-2 ring-accent/20 shadow-lg" : "border-border"
              )}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                  Most Popular
                </div>
              )}
              <h3 className="font-serif text-base font-bold leading-tight">{t.name}</h3>
              <div className="mt-3 mb-4">
                <div className="font-serif text-3xl font-bold text-foreground">{formatPrice(t.usd, currency, EVENT.exchangeRate)}</div>
                {t.note && <div className="text-[11px] text-muted-foreground mt-1">{t.note}</div>}
              </div>
              <p className="text-xs text-muted-foreground mb-4 flex-1">{t.description}</p>
              <Button asChild size="sm" className={cn(t.popular ? "gradient-blue text-accent-foreground" : "")} variant={t.popular ? "default" : "outline"}>
                <Link href="/register" className="rounded-xl">Select pass</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* NEWS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">From the secretariat</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/news">All updates <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {NEWS.slice(0, 3).map((n) => (
              <Link key={n.slug} href={`/news/${n.slug}`} className="group block rounded-2xl overflow-hidden bg-card border border-border hover-lift">
                <div className="aspect-[16/9] overflow-hidden bg-secondary">
                  <img src={n.image} alt={n.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
                  <h3 className="font-serif text-lg font-bold mt-1 group-hover:text-accent transition-colors line-clamp-2">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{n.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative gradient-navy grain-overlay text-white overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-70" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Seats fill <span className="text-gradient-light">fast</span>. Secure yours today.
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Early-bird registration closes 30 June 2026. Confirm your spot now and get full access to all sessions, networking, and post-event resources.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold">
              <Link href="/register">Secure Your Spot</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
              <Link href="/contact">Talk to the team</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
