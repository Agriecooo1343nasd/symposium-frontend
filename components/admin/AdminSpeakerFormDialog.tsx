"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTicketCategories, useCreateSpeaker, useUpdateSpeaker } from "@/hooks/api/useAdmin";
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
  email: "",
  title: "",
  organization: "",
  country: "",
  bio: "",
  photoUrl: "",
  isKeynote: false,
  isFeatured: false,
  sendInvitationEmail: true,
  createRegistration: true,
  ticketCategoryId: "",
};

function speakerToForm(speaker?: SpeakerDto | null) {
  if (!speaker) return { ...EMPTY_FORM };
  return {
    name: speaker.name ?? "",
    email: "",
    title: speaker.title ?? "",
    organization: speaker.organization ?? "",
    country: speaker.country ?? "",
    bio: speaker.bio ?? "",
    photoUrl: speaker.photoUrl ?? "",
    isKeynote: speaker.isKeynote ?? false,
    isFeatured: speaker.isFeatured ?? false,
    sendInvitationEmail: true,
    createRegistration: true,
    ticketCategoryId: "",
  };
}

export function AdminSpeakerFormDialog({ open, onOpenChange, speaker }: Props) {
  const symposiumId = useSymposiumId();
  const { categories } = useAdminTicketCategories();
  const create = useCreateSpeaker();
  const update = useUpdateSpeaker();
  const uploadFile = useUploadFile();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeCategories = categories.filter((t) => t.isActive);
  const isEditing = Boolean(speaker);

  useEffect(() => {
    if (!open) return;
    setForm(speakerToForm(speaker));
  }, [open, speaker]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId || !form.name.trim()) return toast.error("Name required");

    const onDone = {
      onSuccess: (created?: SpeakerDto) => {
        const invited = !isEditing && form.sendInvitationEmail && form.email.trim();
        toast.success(
          speaker
            ? "Speaker updated"
            : invited
              ? `Speaker created — invitation sent to ${form.email.trim()}`
              : "Speaker created",
        );
        if (!isEditing && created?.registrationId) {
          toast.message("Complimentary registration linked", { duration: 4000 });
        }
        onOpenChange(false);
      },
      onError: (err: Error) => toast.error(err.message),
    };

    if (speaker) {
      update.mutate(
        {
          id: speaker.id,
          dto: {
            name: form.name.trim(),
            title: form.title || undefined,
            organization: form.organization || undefined,
            country: form.country || undefined,
            bio: form.bio || undefined,
            photoUrl: form.photoUrl || undefined,
            isKeynote: form.isKeynote,
            isFeatured: form.isFeatured,
          },
        },
        onDone,
      );
      return;
    }

    const email = form.email.trim();
    if (!email) {
      return toast.error("Email is required to grant speaker portal access");
    }

    create.mutate(
      {
        symposiumId,
        name: form.name.trim(),
        email,
        title: form.title || undefined,
        organization: form.organization || undefined,
        country: form.country || undefined,
        bio: form.bio || undefined,
        photoUrl: form.photoUrl || undefined,
        isKeynote: form.isKeynote,
        isFeatured: form.isFeatured,
        sendInvitationEmail: form.sendInvitationEmail,
        createRegistration: form.createRegistration,
        ticketCategoryId: form.ticketCategoryId || undefined,
      },
      onDone,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{speaker ? "Edit speaker" : "Add speaker"}</DialogTitle>
          {!isEditing && (
            <p className="text-sm text-muted-foreground font-normal">
              Creates the directory profile, links a login account, assigns the speaker role, and sends a portal invitation.
            </p>
          )}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {isEditing && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                speaker?.userId ? "border-green/40 bg-green/5 text-green" : "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-200"
              }`}
            >
              {speaker?.userId
                ? "Portal account linked — speaker can sign in at /speaker."
                : "No portal account linked. Profile edits only; re-create with email to onboard portal access."}
            </div>
          )}

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

          {!isEditing && (
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
                placeholder="e.g. speaker@organization.rw"
                required
              />
            </div>
          )}

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

          {!isEditing && (
            <div className="space-y-3 rounded-xl border bg-secondary/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Portal onboarding</p>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Send invitation email</span>
                <Switch
                  checked={form.sendInvitationEmail}
                  onCheckedChange={(c) => setForm({ ...form, sendInvitationEmail: c })}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Create complimentary registration</span>
                <Switch
                  checked={form.createRegistration}
                  onCheckedChange={(c) => setForm({ ...form, createRegistration: c })}
                />
              </label>
              {form.createRegistration && activeCategories.length > 0 && (
                <div>
                  <Label>Pass category (optional)</Label>
                  <Select
                    value={form.ticketCategoryId || "__default__"}
                    onValueChange={(v) =>
                      setForm({ ...form, ticketCategoryId: v === "__default__" ? "" : v })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Default active pass" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">Default active pass</SelectItem>
                      {activeCategories.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={create.isPending || update.isPending}>
              {isEditing ? "Save" : create.isPending ? "Onboarding…" : "Add speaker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
