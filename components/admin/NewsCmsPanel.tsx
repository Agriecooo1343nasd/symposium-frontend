import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/hooks/use-store";
import { patchStore } from "@/lib/store";
import type { NewsPost } from "@/lib/mock-data";
import Link from "next/link";
import { toast } from "sonner";

type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  date: string;
  image: string;
};

const emptyDraft = (author: string): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  author,
  date: new Date().toISOString().slice(0, 10),
  image: "",
});

type Props = {
  title: string;
  subtitle: string;
  defaultAuthor: string;
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
}

export function NewsCmsPanel({ title, subtitle, defaultAuthor }: Props) {
  const store = useStore();
  const [draft, setDraft] = useState<Draft>(emptyDraft(defaultAuthor));
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const readImage = (file: File) => {
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, image: r.result as string }));
    r.readAsDataURL(file);
  };

  const selectPost = (p: NewsPost) => {
    setEditingSlug(p.slug);
    setDraft({ ...p });
  };

  const clearForm = () => {
    setEditingSlug(null);
    setDraft(emptyDraft(defaultAuthor));
  };

  const save = () => {
    if (!draft.title.trim()) return toast.error("Title required");
    const slug = draft.slug.trim() || slugify(draft.title);
    const post: NewsPost = {
      slug,
      title: draft.title.trim(),
      excerpt: draft.excerpt,
      body: draft.body,
      date: draft.date,
      author: draft.author || defaultAuthor,
      image: draft.image || "https://picsum.photos/seed/nas-news/1200/700",
    };

    patchStore((s) => {
      const without = s.newsPosts.filter((p) => p.slug !== editingSlug && p.slug !== slug);
      return { ...s, newsPosts: [post, ...without] };
    });
    toast.success(editingSlug ? "Article updated" : "Article published");
    clearForm();
  };

  const remove = (slug: string) => {
    patchStore((s) => ({ ...s, newsPosts: s.newsPosts.filter((p) => p.slug !== slug) }));
    if (editingSlug === slug) clearForm();
    toast.info("Article removed");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      <aside className="lg:w-80 shrink-0 flex flex-col gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground w-full" onClick={clearForm}>
          <Plus className="h-4 w-4 mr-1" /> New article
        </Button>
        <div className="flex-1 overflow-y-auto rounded-xl border bg-card divide-y max-h-[60vh] lg:max-h-none">
          {store.newsPosts.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No articles yet.</p>
          )}
          {store.newsPosts.map((p) => (
            <div
              key={p.slug}
              className={`p-3 cursor-pointer hover:bg-secondary/40 transition-colors ${editingSlug === p.slug ? "bg-secondary/60" : ""}`}
              onClick={() => selectPost(p)}
            >
              {p.image && (
                <img src={p.image} alt="" className="h-14 w-full object-cover rounded-md mb-2" />
              )}
              <div className="font-medium text-sm line-clamp-2">{p.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{p.date}</div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 rounded-2xl border bg-card p-4 sm:p-6 overflow-y-auto">
        <h2 className="font-serif font-bold text-lg mb-4">{editingSlug ? "Edit article" : "Compose article"}</h2>
        <div className="grid gap-4 max-w-none">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Headline *</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: editingSlug ? draft.slug : slugify(e.target.value) })}
                placeholder="Registration opens for NAS 2026"
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL slug</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Publish date</Label>
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Excerpt (card summary)</Label>
              <Textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} rows={2} className="mt-1 resize-y" placeholder="Short teaser for listing pages…" />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Hero / banner image</Label>
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && readImage(e.target.files[0])} />
              <Input value={draft.image.startsWith("data:") ? "" : draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="Or paste image URL" />
            </div>
            {draft.image && (
              <img src={draft.image} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-xl border" />
            )}
          </div>

          <div>
            <Label>Article body</Label>
            <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={12} className="mt-1 resize-y min-h-[200px]" placeholder="Full article text…" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={save} className="gradient-blue text-accent-foreground">
              {editingSlug ? "Update" : "Publish"}
            </Button>
            {editingSlug && (
              <>
                <Button variant="outline" asChild>
                  <Link href={"/news/" + draft.slug} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-1" /> Preview
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => remove(editingSlug)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={clearForm}>Clear</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
