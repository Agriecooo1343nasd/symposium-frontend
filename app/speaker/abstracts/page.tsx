"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SUB_THEMES, type SubTheme } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { patchStore, uid } from "@/lib/store";
import { toast } from "sonner";

export default function SpeakerAbstractsPage() {
  const store = useStore();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [docFile, setDocFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [form, setForm] = useState<{ title: string; authors: string; track: SubTheme; body: string }>({
    title: "",
    authors: "",
    track: SUB_THEMES[0],
    body: "",
  });

  const mine = store.speakerAbstracts.filter((a) => a.speakerEmail === session?.email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      toast.error("Abstract document (PDF) is required");
      return;
    }
    if (!session?.email) {
      toast.error("Sign in required");
      return;
    }
    patchStore((s) => ({
      ...s,
      speakerAbstracts: [
        {
          id: uid("ab"),
          speakerEmail: session.email,
          title: form.title,
          authors: form.authors,
          track: form.track,
          body: form.body,
          documentName: docFile.name,
          documentDataUrl: docFile.dataUrl,
          status: "submitted",
          submittedAt: new Date().toISOString().slice(0, 10),
        },
        ...s.speakerAbstracts,
      ],
    }));
    toast.success("Abstract submitted for review");
    setOpen(false);
    setDocFile(null);
    setForm({ title: "", authors: "", track: SUB_THEMES[0], body: "" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">My abstracts</h1>
          <p className="text-muted-foreground">Session materials for the programme committee. PDF upload required.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-accent-foreground">
              <Plus className="h-4 w-4 mr-1" /> Submit abstract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit a new abstract</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input required placeholder="Presentation title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Authors *</Label>
                <Input required placeholder="Lead author, co-authors…" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Sub-theme *</Label>
                <Select value={form.track} onValueChange={(v) => setForm({ ...form, track: v as SubTheme })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sub-theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_THEMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Abstract text *</Label>
                <Textarea required placeholder="Max 300 words summary…" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Abstract document (PDF) *</Label>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  className="mt-1"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setDocFile({ name: f.name, dataUrl: reader.result as string });
                    reader.readAsDataURL(f);
                  }}
                />
                {docFile && <p className="text-xs text-green mt-1">{docFile.name} attached</p>}
              </div>
              <DialogFooter>
                <Button type="submit" className="gradient-blue text-accent-foreground">
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {(mine.length ? mine : store.speakerAbstracts.slice(0, 2)).map((a) => (
          <div key={a.id} className="rounded-md bg-card border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-serif font-bold">{a.title}</div>
                <div className="text-xs text-muted-foreground">
                  {a.authors} · {a.track}
                </div>
                {a.documentName && (
                  <div className="text-xs font-mono mt-1">📎 {a.documentName}</div>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-semibold capitalize ${
                  a.status === "accepted"
                    ? "bg-green/15 text-green"
                    : a.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {a.status.replace("-", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
