"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SUB_THEMES } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { useCreateSubmission, useMySubmissions } from "@/hooks/api/useDashboard";
import { filesService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import type { PresentationType } from "@/lib/api/dto";
import { toast } from "sonner";

const UI_TO_API: Record<string, PresentationType> = {
  Oral: "oral",
  Workshop: "workshop",
  Poster: "poster",
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function SpeakerAbstractsPage() {
  const { session } = useAuth();
  const { symposiumId } = useSymposium();
  const { data: submissions = [], isLoading } = useMySubmissions();
  const createSubmission = useCreateSubmission();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    authors: "",
    subTheme: SUB_THEMES[0] as string,
    body: "",
    presentationType: "Oral",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId) return toast.error("Symposium not loaded");
    if (!session?.name) return toast.error("Profile name missing");
    if (countWords(form.body) > 300) return toast.error("Abstract must be 300 words or fewer");

    const authorNames = form.authors
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    const authors =
      authorNames.length > 0
        ? authorNames.map((name, i) => ({ name, isPrimary: i === 0 }))
        : [{ name: session.name, isPrimary: true }];

    try {
      setSubmitting(true);
      await createSubmission.mutateAsync({
        symposiumId,
        title: form.title.trim(),
        abstract: form.body.trim(),
        subTheme: form.subTheme || undefined,
        presentationType: UI_TO_API[form.presentationType] ?? "oral",
        authors,
        fileUrl: fileUrl || undefined,
      });
      toast.success("Abstract submitted for review");
      setOpen(false);
      setFileUrl("");
      setForm({ title: "", authors: "", subTheme: SUB_THEMES[0], body: "", presentationType: "Oral" });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      const uploaded = await filesService.upload(file, "abstract");
      setFileUrl(uploaded.url);
      toast.success("PDF attached");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">My abstracts</h1>
          <p className="text-muted-foreground">Submissions for the programme committee via the API.</p>
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
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Authors *</Label>
                <Input
                  required
                  placeholder="Lead author, co-authors…"
                  value={form.authors}
                  onChange={(e) => setForm({ ...form, authors: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Presentation type</Label>
                <Select
                  value={form.presentationType}
                  onValueChange={(v) => setForm({ ...form, presentationType: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Poster">Poster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sub-theme</Label>
                <Select value={form.subTheme} onValueChange={(v) => setForm({ ...form, subTheme: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
                <Textarea
                  required
                  rows={5}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">{countWords(form.body)} / 300 words</p>
              </div>
              <div>
                <Label>Abstract document (PDF)</Label>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="mt-1"
                  onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
                />
                {fileUrl && <p className="text-xs text-green mt-1">PDF uploaded</p>}
              </div>
              <DialogFooter>
                <Button type="submit" className="gradient-blue text-accent-foreground" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((a) => (
            <div key={a.id} className="rounded-md bg-card border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-serif font-bold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.authors.map((x) => x.name).join(", ")}
                    {a.subTheme ? ` · ${a.subTheme}` : ""} · {a.presentationType}
                  </div>
                  {a.fileUrl && (
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-accent mt-1 inline-block">
                      View PDF
                    </a>
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
                  {a.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
