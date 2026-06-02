"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { NEWS, SESSIONS, SPEAKERS, FAQS } from "@/lib/mock-data";


export default function Page() {
  const blocks = [
    { label: "News posts", count: NEWS.length, link: "/news" as const },
    { label: "Sessions", count: SESSIONS.length, link: "/programme" as const },
    { label: "Speakers", count: SPEAKERS.length, link: "/speakers" as const },
    { label: "FAQs", count: FAQS.length, link: "/faq" as const },
  ];
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Content</h1>
      <p className="text-muted-foreground mb-6">Lightweight overview of public site content. Editing is read-only in this preview.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocks.map((b) => (
          <Link key={b.label} href={b.link} className="rounded-2xl bg-card border border-border p-5 hover-lift block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{b.label}</div>
            <div className="font-serif text-3xl font-bold mt-2 text-gradient">{b.count}</div>
            <div className="text-xs text-accent mt-2 inline-flex items-center gap-1">Open public page <ExternalLink className="h-3 w-3" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
