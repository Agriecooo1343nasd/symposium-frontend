"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { getSession } from "@/lib/auth";
import type { CreateSpeakerInput } from "@/lib/create-speaker";
import { speakerInputFromStore, updateSpeakerOnboarding } from "@/lib/update-onboarding";
import type { PresentationType } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  email: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function EditSpeakerDialog({ email, open, onOpenChange, onSaved }: Props) {
  const store = useStore();
  const [form, setForm] = useState<Partial<CreateSpeakerInput>>({});

  useEffect(() => {
    if (!open || !email) return;
    setForm(speakerInputFromStore(email) ?? {});
  }, [open, email]);

  if (!email) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const actor = getSession()?.name ?? "Staff";
    const result = updateSpeakerOnboarding({ ...form, email }, actor);
    if (!result.ok) return toast.error(result.error);
    toast.success("Speaker record updated");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit speaker</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">{email}</p>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Full name</Label>
            <Input
              value={form.fullName ?? ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Organization</Label>
              <Input
                value={form.org ?? ""}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={form.country ?? ""}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea
              rows={3}
              value={form.about ?? ""}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Presentation title</Label>
            <Input
              value={form.presentationTitle ?? ""}
              onChange={(e) => setForm({ ...form, presentationTitle: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea
              rows={3}
              value={form.summary ?? ""}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={form.presentationType ?? "Panel"}
              onValueChange={(v) => setForm({ ...form, presentationType: v as PresentationType })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Keynote", "Panel", "Workshop", "Poster"] as const).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pass category</Label>
            <Select
              value={form.ticketPlanId ?? ""}
              onValueChange={(id) => setForm({ ...form, ticketPlanId: id })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Ticket plan" />
              </SelectTrigger>
              <SelectContent>
                {store.ticketPlans.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
