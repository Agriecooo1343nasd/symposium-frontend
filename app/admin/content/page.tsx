"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2, Upload, Images, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NEWS, SESSIONS, SPEAKERS, FAQS } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type GalleryImage, type PreviousPresentation } from "@/lib/store";
import { toast } from "sonner";

// ─── Gallery upload dialog ────────────────────────────────────────────────────

function AddPhotoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [src, setSrc] = useState("");
  const [caption, setCaption] = useState("");
  const [event, setEvent] = useState("2nd National Agroecology Symposium");
  const [year, setYear] = useState("2024");

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!src || !caption) return toast.error("Image and caption required");
    patchStore((s) => ({
      ...s,
      galleryImages: [
        ...s.galleryImages,
        {
          id: uid("gi"),
          src,
          caption,
          event,
          year,
          order: s.galleryImages.length + 1,
          uploadedAt: new Date().toISOString().slice(0, 10),
        } satisfies GalleryImage,
      ],
    }));
    toast.success("Photo added to gallery");
    onOpenChange(false);
    setSrc("");
    setCaption("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Add gallery photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Photo *</Label>
            <Input
              type="file"
              accept="image/*"
              required
              className="mt-1"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
            {src && (
              <img src={src} alt="preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
            )}
          </div>
          <div>
            <Label>Caption *</Label>
            <Input required value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1" placeholder="Describe what's in the photo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Event</Label>
              <Input value={event} onChange={(e) => setEvent(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1" placeholder="2024" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              <Upload className="h-3.5 w-3.5 mr-1" /> Add photo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add presentation dialog ──────────────────────────────────────────────────

function AddPresentationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [presenter, setPresenter] = useState("");
  const [event, setEvent] = useState("2nd National Agroecology Symposium");
  const [year, setYear] = useState("2024");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("#");

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !presenter || !fileName) return toast.error("Title, presenter, and file required");
    patchStore((s) => ({
      ...s,
      previousPresentations: [
        ...(s.previousPresentations ?? []),
        {
          id: uid("pp"),
          title,
          presenter,
          event,
          year,
          fileUrl,
          fileName,
          order: (s.previousPresentations?.length ?? 0) + 1,
          uploadedAt: new Date().toISOString().slice(0, 10),
        } satisfies PreviousPresentation,
      ],
    }));
    toast.success("Presentation added");
    onOpenChange(false);
    setTitle("");
    setPresenter("");
    setFileName("");
    setFileUrl("#");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Add presentation (PPT/PDF)</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" placeholder="Presentation title" />
          </div>
          <div>
            <Label>Presenter *</Label>
            <Input required value={presenter} onChange={(e) => setPresenter(e.target.value)} className="mt-1" placeholder="Speaker or organization" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Event</Label>
              <Input value={event} onChange={(e) => setEvent(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1" placeholder="2024" />
            </div>
          </div>
          <div>
            <Label>File (PDF / PPTX) *</Label>
            <Input
              type="file"
              accept=".pdf,.pptx,.ppt"
              required
              className="mt-1"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
            {fileName && <p className="text-xs text-muted-foreground mt-1 font-mono">{fileName}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              <Upload className="h-3.5 w-3.5 mr-1" /> Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Page() {
  const store = useStore();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [presOpen, setPresOpen] = useState(false);

  const removePhoto = (id: string) => {
    patchStore((s) => ({ ...s, galleryImages: s.galleryImages.filter((g) => g.id !== id) }));
    toast.success("Photo removed");
  };

  const removePresentation = (id: string) => {
    patchStore((s) => ({ ...s, previousPresentations: (s.previousPresentations ?? []).filter((p) => p.id !== id) }));
    toast.success("Presentation removed");
  };

  const blocks = [
    { label: "News posts", count: store.newsPosts.length, link: "/news" as const },
    { label: "Sessions", count: store.sessions.length, link: "/programme" as const },
    { label: "Speakers", count: store.speakerProfiles.length, link: "/speakers" as const },
    { label: "FAQs", count: FAQS.length, link: "/faq" as const },
  ];

  const gallery = [...(store.galleryImages ?? [])].sort((a, b) => a.order - b.order);
  const presentations = [...(store.previousPresentations ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Content</h1>
        <p className="text-muted-foreground">Manage public site content — gallery, presentations, and page counts.</p>
      </div>

      {/* Page counts */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocks.map((b) => (
          <Link key={b.label} href={b.link} className="rounded-2xl bg-card border border-border p-5 hover-lift block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{b.label}</div>
            <div className="font-serif text-3xl font-bold mt-2 text-gradient">{b.count}</div>
            <div className="text-xs text-accent mt-2 inline-flex items-center gap-1">
              Open public page <ExternalLink className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Gallery management */}
      <section className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif font-bold flex items-center gap-2">
              <Images className="h-4 w-4 text-accent" /> Previous symposium gallery
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Photos displayed on the public About page.</p>
          </div>
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setPhotoOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add photo
          </Button>
        </div>

        {gallery.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gallery photos yet. Add the first one above.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-secondary">
                <img src={img.src} alt={img.caption} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-2">
                  <p className="text-white text-[10px] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity leading-tight mb-1">
                    {img.caption}
                  </p>
                  <button
                    onClick={() => removePhoto(img.id)}
                    className="self-end opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Presentations management */}
      <section className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" /> Previous symposium presentations
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">PDF / PPT slides displayed on the About page for download.</p>
          </div>
          <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setPresOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Upload presentation
          </Button>
        </div>

        {presentations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No presentations yet.</p>
        ) : (
          <div className="space-y-2">
            {presentations.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3 bg-secondary/30">
                <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.presenter} · {p.event} · {p.year}</div>
                  <div className="text-[10px] text-muted-foreground/60 font-mono truncate">{p.fileName}</div>
                </div>
                <button
                  onClick={() => removePresentation(p.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  aria-label="Remove presentation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddPhotoDialog open={photoOpen} onOpenChange={setPhotoOpen} />
      <AddPresentationDialog open={presOpen} onOpenChange={setPresOpen} />
    </div>
  );
}
