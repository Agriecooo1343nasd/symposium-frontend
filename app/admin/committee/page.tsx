"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type CommitteeMember } from "@/lib/store";
import { toast } from "sonner";

type Draft = Omit<CommitteeMember, "id"> & { id?: string };

const emptyDraft = (order: number): Draft => ({
  name: "",
  role: "",
  org: "",
  photo: "",
  bio: "",
  order,
});


export default function Page() {
  const store = useStore();
  const sorted = [...store.committeeMembers].sort((a, b) => a.order - b.order);
  const [draft, setDraft] = useState<Draft>(emptyDraft(sorted.length + 1));

  const readPhoto = (file: File) => {
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, photo: r.result as string }));
    r.readAsDataURL(file);
  };

  const selectMember = (m: CommitteeMember) => {
    setDraft({ ...m });
  };

  const clearForm = () => setDraft(emptyDraft(sorted.length + 1));

  const save = () => {
    if (!draft.name.trim()) return toast.error("Name is required");
    const member: CommitteeMember = {
      id: draft.id ?? uid("cm"),
      name: draft.name.trim(),
      role: draft.role.trim(),
      org: draft.org.trim(),
      photo: draft.photo || `https://i.pravatar.cc/400?u=${encodeURIComponent(draft.name)}`,
      bio: draft.bio.trim(),
      order: draft.order,
    };
    patchStore((s) => {
      const exists = s.committeeMembers.some((c) => c.id === member.id);
      const committeeMembers = exists
        ? s.committeeMembers.map((c) => (c.id === member.id ? member : c))
        : [...s.committeeMembers, member];
      return { ...s, committeeMembers };
    });
    toast.success(draft.id ? "Member updated" : "Member added");
    clearForm();
  };

  const remove = (id: string) => {
    patchStore((s) => ({ ...s, committeeMembers: s.committeeMembers.filter((c) => c.id !== id) }));
    if (draft.id === id) clearForm();
    toast.info("Member removed");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-10rem)]">
      <div className="xl:w-[340px] shrink-0 space-y-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Organizing committee</h1>
          <p className="text-sm text-muted-foreground mt-1">Shown on the public About page with photo, role, and bio.</p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground w-full" onClick={clearForm}>
          <Plus className="h-4 w-4 mr-1" /> New member
        </Button>
        <div className="rounded-xl border bg-card divide-y overflow-y-auto max-h-[50vh] xl:max-h-[calc(100vh-14rem)]">
          {sorted.map((c) => (
            <div
              key={c.id}
              className={`p-3 flex gap-3 cursor-pointer hover:bg-secondary/40 ${draft.id === c.id ? "bg-secondary/60" : ""}`}
              onClick={() => selectMember(c)}
            >
              <img src={c.photo} alt="" className="h-12 w-12 rounded-full object-cover shrink-0 border" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{c.name}</div>
                <div className="text-xs text-accent truncate">{c.role}</div>
                <div className="text-[10px] text-muted-foreground truncate">{c.org}</div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 h-8 w-8"
                onClick={(e) => { e.stopPropagation(); remove(c.id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 rounded-2xl border bg-card p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h2 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          {draft.id ? "Edit member" : "Add committee member"}
        </h2>

        <div className="grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Profile photo</Label>
            <div className="aspect-square max-w-[200px] rounded-2xl border bg-secondary/30 overflow-hidden flex items-center justify-center">
              {draft.photo ? (
                <img src={draft.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground px-4 text-center">Upload or use URL below</span>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && readPhoto(e.target.files[0])} />
            <Input
              value={draft.photo.startsWith("data:") ? "" : draft.photo}
              onChange={(e) => setDraft({ ...draft, photo: e.target.value })}
              placeholder="Image URL"
              className="text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 content-start">
            <div className="sm:col-span-2">
              <Label>Full name *</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1" placeholder="Dr. Jane Doe" />
            </div>
            <div>
              <Label>Role on committee</Label>
              <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="mt-1" placeholder="Programme Lead" />
            </div>
            <div>
              <Label>Organization</Label>
              <Input value={draft.org} onChange={(e) => setDraft({ ...draft, org: e.target.value })} className="mt-1" placeholder="MINAGRI" />
            </div>
            <div>
              <Label>Display order</Label>
              <Input type="number" min={1} value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 1 })} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Short bio (About page)</Label>
              <Textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={4}
                className="mt-1 resize-y"
                placeholder="One or two sentences about their contribution to NAS…"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Preview (About page card)</p>
          <div className="rounded-2xl border p-6 max-w-sm bg-secondary/20">
            {draft.photo && <img src={draft.photo} alt="" className="h-12 w-12 rounded-full object-cover mb-3 border" />}
            <div className="font-serif font-bold">{draft.name || "Member name"}</div>
            <div className="text-sm text-accent font-medium">{draft.role || "Role"}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{draft.org || "Organization"}</div>
            {draft.bio && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{draft.bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <Button onClick={save} className="gradient-blue text-accent-foreground">
            {draft.id ? "Update member" : "Add member"}
          </Button>
          <Button variant="outline" onClick={clearForm}>Clear form</Button>
        </div>
      </div>
    </div>
  );
}
