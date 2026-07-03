"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, usePublishAnnouncement, useUpdateAnnouncement } from "@/hooks/api/useAdmin";
import { useUploadFile } from "@/hooks/api/useFiles";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import type { AnnouncementDto } from "@/lib/api/dto";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { SymposiumArchivePanel } from "@/components/admin/SymposiumArchivePanel";

type Draft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  isPublished: boolean;
};

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  image: "",
  isPublished: false,
});

type Props = {
  title: string;
  subtitle: string;
  defaultAuthor: string;
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
}

function ArticlesEditor() {
  const symposiumId = useSymposiumId();
  const { announcements, isLoading } = useAdminAnnouncements({ limit: 100 });
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const publish = usePublishAnnouncement();
  const remove = useDeleteAnnouncement();
  const uploadFile = useUploadFile();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const startNewArticle = () => {
    setDraft(emptyDraft());
    setEditingId(null);
  };

  useAdminCommandAction({ "new-article": startNewArticle });

  const selectPost = (p: AnnouncementDto) => {
    setEditingId(p.id);
    setDraft({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      body: p.content,
      image: p.imageUrl ?? "",
      isPublished: p.isPublished,
    });
  };

  const clearForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const save = () => {
    if (!draft.title.trim() || !symposiumId) return toast.error("Title required");
    const slug = draft.slug.trim() || slugify(draft.title);
    const payload = {
      symposiumId,
      title: draft.title.trim(),
      slug,
      excerpt: draft.excerpt || undefined,
      content: draft.body,
      imageUrl: draft.image && !draft.image.startsWith("data:") ? draft.image : undefined,
      isPublished: draft.isPublished,
    };
    const onDone = {
      onSuccess: () => {
        toast.success(editingId ? "Article updated" : "Article saved");
        clearForm();
      },
      onError: (e: Error) => toast.error(e.message),
    };
    if (editingId) {
      update.mutate({ id: editingId, dto: payload }, onDone);
    } else {
      create.mutate(payload, onDone);
    }
  };

  const doPublish = () => {
    if (!editingId) return save();
    publish.mutate(editingId, {
      onSuccess: () => toast.success("Published"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Publish failed"),
    });
  };

  const doRemove = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => {
        if (editingId === id) clearForm();
        toast.info("Article removed");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-14rem)]">
      <aside className="lg:w-80 shrink-0 flex flex-col gap-3">
        <Button size="sm" className="gradient-blue text-accent-foreground w-full" onClick={clearForm}>
          <Plus className="h-4 w-4 mr-1" /> New article
        </Button>
        <div className="flex-1 overflow-y-auto rounded-xl border bg-card divide-y max-h-[60vh] lg:max-h-none">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
          {announcements.length === 0 && !isLoading && (
            <p className="p-4 text-sm text-muted-foreground">No articles yet.</p>
          )}
          {announcements.map((p) => (
            <div
              key={p.id}
              className={`p-3 cursor-pointer hover:bg-secondary/40 transition-colors ${editingId === p.id ? "bg-secondary/60" : ""}`}
              onClick={() => selectPost(p)}
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt="" className="h-14 w-full object-cover rounded-md mb-2" />
              )}
              <div className="font-medium text-sm line-clamp-2">{p.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {p.isPublished ? "Published" : "Draft"} · {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 rounded-2xl border bg-card p-4 sm:p-6 overflow-y-auto">
        <h2 className="font-serif font-bold text-lg mb-4">{editingId ? "Edit article" : "Compose article"}</h2>
        <div className="grid gap-4 max-w-none">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Headline *</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: editingId ? draft.slug : slugify(e.target.value) })}
                placeholder="Registration opens for NAS 2026"
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL slug</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="mt-1 font-mono text-sm" />
            </div>
            <div className="sm:col-span-2">
              <Label>Excerpt (card summary)</Label>
              <Textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} rows={2} className="mt-1 resize-y" />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Hero image</Label>
            <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="mt-1" placeholder="https://…" />
            <Input
              type="file"
              accept="image/*"
              className="mt-2"
              disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploadingImage(true);
                  const res = await uploadFile.mutateAsync({ file, type: "announcement_image" });
                  setDraft((d) => ({ ...d, image: res.url }));
                  toast.success("Image uploaded");
                } catch {
                  toast.error("Upload failed — paste an image URL instead");
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
            {draft.image && (
              <img src={draft.image} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-xl border" />
            )}
          </div>

          <div>
            <Label>Article body</Label>
            <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={12} className="mt-1 resize-y min-h-[200px]" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={save} className="gradient-blue text-accent-foreground" disabled={create.isPending || update.isPending}>
              Save draft
            </Button>
            {editingId && (
              <>
                <Button variant="outline" onClick={doPublish} disabled={publish.isPending}>
                  Publish
                </Button>
                <Button variant="outline" asChild>
                  <Link href={"/news/" + draft.slug} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-1" /> Preview
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => doRemove(editingId)}>
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

export function NewsCmsPanel({ title, subtitle }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="articles">News articles (API)</TabsTrigger>
          <TabsTrigger value="archive">Symposium archive (local mock)</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-6">
          <ArticlesEditor />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <SymposiumArchivePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
