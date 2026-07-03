import type { Metadata } from "next";
import Link from "next/link";
import { announcementsService } from "@/lib/api/services";
import { mapAnnouncements, type NewsView } from "@/lib/api/mappers/announcement";
import { resolveSymposiumId } from "@/lib/api/symposium-server";

export const metadata: Metadata = {
  title: "News & Blog — NAS 2026",
  description: "Latest news and announcements from the NAS 2026 secretariat.",
};

export const revalidate = 300;

async function loadPosts(): Promise<NewsView[]> {
  try {
    const symposiumId = await resolveSymposiumId();
    const res = await announcementsService.listPublished({
      limit: 50,
      symposiumId: symposiumId ?? undefined,
    });
    return mapAnnouncements(res.items).filter((p) => p.title);
  } catch {
    return [];
  }
}

export default async function News() {
  const posts = await loadPosts();
  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h1 className="font-serif text-3xl font-bold">News</h1>
        <p className="text-muted-foreground mt-2">No published articles yet. Check back soon.</p>
      </section>
    );
  }
  const [hero, ...rest] = posts;

  return (
    <>
      <section className="gradient-navy grain-overlay text-white py-16">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
            Updates from the <span className="text-gradient-light">secretariat.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Link href={`/news/${hero.slug}`} className="group block mb-12">
          <div className="grid lg:grid-cols-2 gap-8 rounded-3xl overflow-hidden bg-card border border-border hover-lift">
            <div className="aspect-[4/3] lg:aspect-auto overflow-hidden bg-secondary">
              <img
                src={hero.image}
                alt={hero.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="text-xs uppercase tracking-widest text-accent font-semibold">Featured</div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mt-2 group-hover:text-accent transition-colors">
                {hero.title}
              </h2>
              <p className="text-muted-foreground mt-3">{hero.excerpt}</p>
              <div className="mt-5 text-xs text-muted-foreground">
                {new Date(hero.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                {hero.author}
              </div>
            </div>
          </div>
        </Link>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              className="group block rounded-2xl overflow-hidden bg-card border border-border hover-lift"
            >
              <div className="aspect-[16/9] overflow-hidden bg-secondary">
                <img
                  src={n.image}
                  alt={n.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="text-xs text-muted-foreground">
                  {new Date(n.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h3 className="font-serif text-lg font-bold mt-1 group-hover:text-accent transition-colors line-clamp-2">
                  {n.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
