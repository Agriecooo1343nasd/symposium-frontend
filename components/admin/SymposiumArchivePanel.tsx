"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, ImageIcon, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type GalleryImage, type PreviousPresentation, type SymposiumArchiveKind } from "@/lib/store";
import Link from "next/link";
import { toast } from "sonner";
import { FileViewLink } from "@/components/file-viewer";

const ARCHIVE_KINDS: { value: SymposiumArchiveKind; label: string }[] = [
  { value: "slides", label: "Presentation slides" },
  { value: "overview", label: "Symposium overview" },
  { value: "report", label: "Event report" },
  { value: "proceedings", label: "Proceedings" },
];

type GalleryDraft = {
  editingId: string | null;
  src: string;
  caption: string;
  event: string;
  year: number;
  order: number;
};

type DocDraft = {
  editingId: string | null;
  title: string;
  presenter: string;
  fileName: string;
  fileUrl: string;
  event: string;
  year: number;
  kind: SymposiumArchiveKind;
  order: number;
};

const emptyGallery = (): GalleryDraft => ({
  editingId: null,
  src: "",
  caption: "",
  event: "2nd National Agroecology Symposium",
  year: 2024,
  order: 1,
});

const emptyDoc = (): DocDraft => ({
  editingId: null,
  title: "",
  presenter: "",
  fileName: "",
  fileUrl: "",
  event: "2nd National Agroecology Symposium",
  year: 2024,
  kind: "slides",
  order: 1,
});

function readFile(file: File, onLoad: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result as string);
  reader.readAsDataURL(file);
}

export function SymposiumArchivePanel() {
  const store = useStore();
  const [galleryDraft, setGalleryDraft] = useState<GalleryDraft>(emptyGallery);
  const [docDraft, setDocDraft] = useState<DocDraft>(emptyDoc);

  const gallerySorted = [...store.galleryImages].sort((a, b) => a.order - b.order);
  const docsSorted = [...store.previousPresentations].sort((a, b) => a.order - b.order);

  const selectGallery = (img: GalleryImage) => {
    setGalleryDraft({
      editingId: img.id,
      src: img.src,
      caption: img.caption,
      event: img.event,
      year: img.year,
      order: img.order,
    });
  };

  const selectDoc = (doc: PreviousPresentation) => {
    setDocDraft({
      editingId: doc.id,
      title: doc.title,
      presenter: doc.presenter,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      event: doc.event,
      year: doc.year,
      kind: doc.kind,
      order: doc.order,
    });
  };

  const saveGallery = () => {
    if (!galleryDraft.caption.trim()) return toast.error("Caption required");
    if (!galleryDraft.src.trim()) return toast.error("Image required — upload or paste a URL");
    const item: GalleryImage = {
      id: galleryDraft.editingId ?? uid("gal"),
      src: galleryDraft.src.trim(),
      caption: galleryDraft.caption.trim(),
      event: galleryDraft.event.trim() || "2nd National Agroecology Symposium",
      year: galleryDraft.year,
      order: galleryDraft.order,
    };
    patchStore((s) => {
      const without = s.galleryImages.filter((g) => g.id !== galleryDraft.editingId && g.id !== item.id);
      return { ...s, galleryImages: [...without, item].sort((a, b) => a.order - b.order) };
    });
    toast.success(galleryDraft.editingId ? "Photo updated" : "Photo added to public gallery");
    setGalleryDraft(emptyGallery());
  };

  const removeGallery = (id: string) => {
    patchStore((s) => ({ ...s, galleryImages: s.galleryImages.filter((g) => g.id !== id) }));
    if (galleryDraft.editingId === id) setGalleryDraft(emptyGallery());
    toast.info("Photo removed");
  };

  const saveDoc = () => {
    if (!docDraft.title.trim()) return toast.error("Title required");
    if (!docDraft.fileName.trim()) return toast.error("File name required");
    if (!docDraft.fileUrl.trim() || docDraft.fileUrl === "#") {
      return toast.error("Upload a file or provide a document URL");
    }
    const item: PreviousPresentation = {
      id: docDraft.editingId ?? uid("pres"),
      title: docDraft.title.trim(),
      presenter: docDraft.presenter.trim() || "NAS Secretariat",
      fileName: docDraft.fileName.trim(),
      fileUrl: docDraft.fileUrl.trim(),
      event: docDraft.event.trim() || "2nd National Agroecology Symposium",
      year: docDraft.year,
      kind: docDraft.kind,
      order: docDraft.order,
    };
    patchStore((s) => {
      const without = s.previousPresentations.filter((d) => d.id !== docDraft.editingId && d.id !== item.id);
      return { ...s, previousPresentations: [...without, item].sort((a, b) => a.order - b.order) };
    });
    toast.success(docDraft.editingId ? "Document updated" : "Document published on /about");
    setDocDraft(emptyDoc());
  };

  const removeDoc = (id: string) => {
    patchStore((s) => ({ ...s, previousPresentations: s.previousPresentations.filter((d) => d.id !== id) }));
    if (docDraft.editingId === id) setDocDraft(emptyDoc());
    toast.info("Document removed");
  };

  const onDocFile = (file: File) => {
    readFile(file, (dataUrl) => {
      setDocDraft((d) => ({
        ...d,
        fileName: file.name,
        fileUrl: dataUrl,
        title: d.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      }));
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">Public symposium archive</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Photos and downloadable documents shown on the public{" "}
            <Link href="/about" className="text-accent hover:underline" target="_blank">
              About page
            </Link>{" "}
            under previous edition highlights.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/about" target="_blank">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview on site
          </Link>
        </Button>
      </div>

      {/* Gallery photos */}
      <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-accent" />
          <h3 className="font-serif font-bold">Gallery photos</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Event photos from past symposiums — visitors can browse in a lightbox on /about.
        </p>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
          <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl border divide-y">
            {gallerySorted.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No gallery photos yet.</p>
            ) : (
              gallerySorted.map((img) => (
                <div
                  key={img.id}
                  className={`flex gap-3 p-3 cursor-pointer hover:bg-secondary/40 ${galleryDraft.editingId === img.id ? "bg-secondary/60" : ""}`}
                  onClick={() => selectGallery(img)}
                >
                  <img src={img.src} alt="" className="h-14 w-20 object-cover rounded-md shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium line-clamp-2">{img.caption}</div>
                    <div className="text-[10px] text-muted-foreground">{img.event} · {img.year}</div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGallery(img.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{galleryDraft.editingId ? "Edit photo" : "Add photo"}</h4>
            <div>
              <Label>Caption *</Label>
              <Input
                value={galleryDraft.caption}
                onChange={(e) => setGalleryDraft({ ...galleryDraft, caption: e.target.value })}
                className="mt-1"
                placeholder="Opening plenary — 2nd NAS, Kigali 2024"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Event name</Label>
                <Input
                  value={galleryDraft.event}
                  onChange={(e) => setGalleryDraft({ ...galleryDraft, event: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={galleryDraft.year}
                  onChange={(e) => setGalleryDraft({ ...galleryDraft, year: parseInt(e.target.value, 10) || 2024 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Display order</Label>
              <Input
                type="number"
                min={1}
                value={galleryDraft.order}
                onChange={(e) => setGalleryDraft({ ...galleryDraft, order: parseInt(e.target.value, 10) || 1 })}
                className="mt-1 max-w-[120px]"
              />
            </div>
            <div>
              <Label>Image *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="max-w-xs"
                  onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], (src) => setGalleryDraft((d) => ({ ...d, src })))}
                />
                <Input
                  value={galleryDraft.src.startsWith("data:") ? "" : galleryDraft.src}
                  onChange={(e) => setGalleryDraft({ ...galleryDraft, src: e.target.value })}
                  placeholder="Or paste image URL"
                  className="flex-1 min-w-[200px]"
                />
              </div>
              {galleryDraft.src && (
                <img src={galleryDraft.src} alt="Preview" className="mt-3 h-32 w-auto max-w-full object-cover rounded-xl border" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveGallery} className="gradient-blue text-accent-foreground">
                {galleryDraft.editingId ? "Update photo" : "Add photo"}
              </Button>
              {galleryDraft.editingId && (
                <Button variant="ghost" onClick={() => setGalleryDraft(emptyGallery())}>
                  Cancel
                </Button>
              )}
              {!galleryDraft.editingId && (
                <Button variant="outline" onClick={() => setGalleryDraft({ ...emptyGallery(), order: gallerySorted.length + 1 })}>
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Archive documents */}
      <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="font-serif font-bold">Archive documents</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Slides, overviews, reports, and proceedings visitors can view in-browser and download from /about.
        </p>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
          <div className="space-y-2 max-h-80 overflow-y-auto rounded-xl border divide-y">
            {docsSorted.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No archive documents yet.</p>
            ) : (
              docsSorted.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex gap-3 p-3 cursor-pointer hover:bg-secondary/40 ${docDraft.editingId === doc.id ? "bg-secondary/60" : ""}`}
                  onClick={() => selectDoc(doc)}
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium line-clamp-2">{doc.title}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">
                      {ARCHIVE_KINDS.find((k) => k.value === doc.kind)?.label ?? doc.kind} · {doc.year}
                    </div>
                    {doc.fileUrl && doc.fileUrl !== "#" && (
                      <FileViewLink src={doc.fileUrl} fileName={doc.fileName} className="text-[10px] mt-0.5" showIcon={false} />
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDoc(doc.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{docDraft.editingId ? "Edit document" : "Add document"}</h4>
            <div>
              <Label>Title *</Label>
              <Input
                value={docDraft.title}
                onChange={(e) => setDocDraft({ ...docDraft, title: e.target.value })}
                className="mt-1"
                placeholder="2nd NAS — symposium overview & outcomes"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Author / presenter</Label>
                <Input
                  value={docDraft.presenter}
                  onChange={(e) => setDocDraft({ ...docDraft, presenter: e.target.value })}
                  className="mt-1"
                  placeholder="NAS Secretariat"
                />
              </div>
              <div>
                <Label>Document type</Label>
                <Select value={docDraft.kind} onValueChange={(v) => setDocDraft({ ...docDraft, kind: v as SymposiumArchiveKind })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARCHIVE_KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Event name</Label>
                <Input value={docDraft.event} onChange={(e) => setDocDraft({ ...docDraft, event: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={docDraft.year}
                  onChange={(e) => setDocDraft({ ...docDraft, year: parseInt(e.target.value, 10) || 2024 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Display order</Label>
              <Input
                type="number"
                min={1}
                value={docDraft.order}
                onChange={(e) => setDocDraft({ ...docDraft, order: parseInt(e.target.value, 10) || 1 })}
                className="mt-1 max-w-[120px]"
              />
            </div>
            <div>
              <Label>File *</Label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-3.5 w-3.5 mr-1" /> Upload PDF / slides
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf"
                      onChange={(e) => e.target.files?.[0] && onDocFile(e.target.files[0])}
                    />
                  </label>
                </Button>
                <Input
                  value={docDraft.fileUrl.startsWith("data:") ? "" : docDraft.fileUrl}
                  onChange={(e) => setDocDraft({ ...docDraft, fileUrl: e.target.value, fileName: docDraft.fileName || e.target.value.split("/").pop() || "" })}
                  placeholder="Or paste file URL"
                  className="flex-1 min-w-[200px]"
                />
              </div>
              {docDraft.fileName && (
                <p className="text-xs text-muted-foreground mt-2 font-mono truncate">
                  {docDraft.fileName}
                  {docDraft.fileUrl && docDraft.fileUrl !== "#" ? " · ready to publish" : ""}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveDoc} className="gradient-blue text-accent-foreground">
                {docDraft.editingId ? "Update document" : "Publish document"}
              </Button>
              {docDraft.editingId && (
                <Button variant="ghost" onClick={() => setDocDraft(emptyDoc())}>
                  Cancel
                </Button>
              )}
              {!docDraft.editingId && (
                <Button variant="outline" onClick={() => setDocDraft({ ...emptyDoc(), order: docsSorted.length + 1 })}>
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
