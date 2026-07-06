"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateSpeaker, useUpdateSpeaker } from "@/hooks/api/useAdmin";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { useUploadFile } from "@/hooks/api/useFiles";
import type { SpeakerDto } from "@/lib/api/dto";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker?: SpeakerDto | null;
};

const EMPTY_FORM = {
  name: "",
  title: "",
  organization: "",
  country: "",
  bio: "",
  photoUrl: "",
  isKeynote: false,
  isFeatured: false,
};

function speakerToForm(speaker?: SpeakerDto | null) {
  if (!speaker) return { ...EMPTY_FORM };
  return {
    name: speaker.name ?? "",
    title: speaker.title ?? "",
    organization: speaker.organization ?? "",
    country: speaker.country ?? "",
    bio: speaker.bio ?? "",
    photoUrl: speaker.photoUrl ?? "",
    isKeynote: speaker.isKeynote ?? false,
    isFeatured: speaker.isFeatured ?? false,
  };
}

export function AdminSpeakerFormDialog({ open, onOpenChange, speaker }: Props) {
  const symposiumId = useSymposiumId();
  const create = useCreateSpeaker();
  const update = useUpdateSpeaker();
  const uploadFile = useUploadFile();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(speakerToForm(speaker));
  }, [open, speaker]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId || !form.name.trim()) return toast.error("Name required");
    const dto = {
      symposiumId,
      name: form.name.trim(),
      title: form.title || undefined,
      organization: form.organization || undefined,
      country: form.country || undefined,
      bio: form.bio || undefined,
      photoUrl: form.photoUrl || undefined,
      isKeynote: form.isKeynote,
      isFeatured: form.isFeatured,
    };
    const onDone = {
      onSuccess: () => {
        toast.success(speaker ? "Speaker updated" : "Speaker created");
        onOpenChange(false);
      },
      onError: (err: Error) => toast.error(err.message),
    };
    if (speaker) {
      update.mutate({ id: speaker.id, dto }, onDone);
    } else {
      create.mutate(dto, onDone);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{speaker ? "Edit speaker" : "Add speaker"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
              placeholder="e.g. Dr. Jane Mukamana"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1"
                placeholder="e.g. Director of Research"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1"
                placeholder="e.g. Rwanda"
              />
            </div>
          </div>
          <div>
            <Label>Organization</Label>
            <Input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="mt-1"
              placeholder="e.g. Rwanda Agriculture Board"
            />
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              className="mt-1"
              placeholder="https://… or upload below"
            />
            <Input
              type="file"
              accept="image/*"
              className="mt-2"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploading(true);
                  const res = await uploadFile.mutateAsync({ file, type: "avatar" });
                  setForm((f) => ({ ...f, photoUrl: res.url }));
                  toast.success("Photo uploaded");
                } catch {
                  toast.error("Upload failed — paste a URL instead");
                } finally {
                  setUploading(false);
                }
              }}
            />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1"
              rows={3}
              placeholder="Short biography for the programme and speaker directory…"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.isKeynote} onCheckedChange={(c) => setForm({ ...form, isKeynote: c })} /> Keynote
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.isFeatured} onCheckedChange={(c) => setForm({ ...form, isFeatured: c })} /> Featured
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={create.isPending || update.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
