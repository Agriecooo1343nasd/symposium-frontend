import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { announcementsService } from "@/lib/api/services";
import { mapAnnouncementDto, type NewsView } from "@/lib/api/mappers/announcement";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

async function loadPost(slug: string): Promise<NewsView | null> {
  try {
    const dto = await announcementsService.getBySlug(slug);
    return mapAnnouncementDto(dto);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — NAS 2026`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [post.image],
    },
  };
}

export default async function NewsPost({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <article>
      <div className="aspect-[21/9] w-full overflow-hidden bg-secondary">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/news"><ArrowLeft className="h-4 w-4 mr-1" /> All news</Link>
        </Button>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {post.author}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>}
        <div className="prose prose-lg max-w-none mt-8 text-foreground/90 leading-relaxed whitespace-pre-line">
          <p>{post.body}</p>
        </div>
      </div>
    </article>
  );
}
