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
import { SUB_THEMES, type SubTheme } from "@/lib/mock-data";
import { createSpeakerManually, type CreateSpeakerInput } from "@/lib/create-speaker";
import type { PresentationType, TicketPlan } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in audit log context */
  actorLabel?: string;
  onCreated?: () => void;
};

const emptyForm = (countries: string[]): CreateSpeakerInput => ({
  ticketPlanId: "",
  fullName: "",
  jobTitle: "",
  org: "",
  country: countries[0] ?? "Rwanda",
  email: "",
  phone: "",
  dietary: "",
  access: "",
  hear: "",
  linkedin: "",
  interests: [],
  about: "",
  presentationTitle: "",
  summary: "",
  presentationType: "Panel",
  photoUrl: "",
  documentName: "",
  documentDataUrl: "",
});

export function CreateSpeakerDialog({ open, onOpenChange, actorLabel, onCreated }: Props) {
  const store = useStore();
  const countries = store.platformSettings.countries;
  const [picked, setPicked] = useState<TicketPlan | null>(null);
  const [form, setForm] = useState<CreateSpeakerInput>(() => emptyForm(["Rwanda"]));

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm(countries));
    setPicked(null);
  }, [open]);

  const readFile = (file: File, cb: (name: string, dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(file.name, reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleInterest = (t: SubTheme) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(t) ? f.interests.filter((x) => x !== t) : [...f.interests, t],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateSpeakerInput = {
      ...form,
      ticketPlanId: picked?.id ?? form.ticketPlanId,
      email: form.email.trim(),
    };
    const actor = actorLabel ?? getSession()?.name ?? "Staff";
    const result = createSpeakerManually(payload, actor);
    if (!result.ok) return toast.error(result.error);
    toast.success(`${payload.fullName} registered as speaker with portal access`);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add speaker manually</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Creates a comp registration, approved speaker application, programme directory profile, and speaker portal
            access — same data as public registration plus the speaker apply form.
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Registration (delegate pass)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Pass category *</Label>
                <Select
                  value={picked?.id ?? ""}
                  onValueChange={(id) => {
                    const plan = store.ticketPlans.find((t) => t.id === id) ?? null;
                    setPicked(plan);
                    setForm((f) => ({ ...f, ticketPlanId: id }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="e.g. Academic / Researcher" />
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
              <div>
                <Label>Full name *</Label>
                <Input
                  required
                  placeholder="e.g. Jean Uwimana"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  placeholder="name@organization.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Job title</Label>
                <Input
                  placeholder="e.g. Director of Research"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Organization *</Label>
                <Input
                  required
                  placeholder="e.g. Rwanda Agriculture Board"
                  value={form.org}
                  onChange={(e) => setForm({ ...form, org: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Rwanda" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  placeholder="+250 788 000 000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Dietary requirements</Label>
                <Input
                  placeholder="e.g. Vegetarian, halal, none"
                  value={form.dietary}
                  onChange={(e) => setForm({ ...form, dietary: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Accessibility needs</Label>
                <Input
                  placeholder="Wheelchair access, sign language, etc."
                  value={form.access}
                  onChange={(e) => setForm({ ...form, access: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>How did they hear about NAS?</Label>
                <Input
                  placeholder="Colleague, ministry, social media…"
                  value={form.hear}
                  onChange={(e) => setForm({ ...form, hear: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>LinkedIn (optional)</Label>
                <Input
                  placeholder="https://linkedin.com/in/…"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Session interests</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUB_THEMES.map((t) => (
                  <label key={t} className="text-xs flex items-center gap-1.5 cursor-pointer rounded-full border px-2.5 py-1">
                    <input type="checkbox" checked={form.interests.includes(t)} onChange={() => toggleInterest(t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Speaker application (programme)
            </h3>
            <div>
              <Label>Profile photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f, (_name, dataUrl) => setForm({ ...form, photoUrl: dataUrl }));
                }}
              />
            </div>
            <div>
              <Label>About the speaker *</Label>
              <Textarea
                required
                rows={3}
                placeholder="Brief professional background for the programme committee…"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Presentation title *</Label>
              <Input
                required
                placeholder="Proposed presentation title"
                value={form.presentationTitle}
                onChange={(e) => setForm({ ...form, presentationTitle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Abstract summary *</Label>
              <Textarea
                required
                rows={4}
                placeholder="Abstract summary (max 300 words in production)…"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Presentation type *</Label>
              <Select
                value={form.presentationType}
                onValueChange={(v) => setForm({ ...form, presentationType: v as PresentationType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Panel, Keynote, Workshop…" />
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
              <Label>Abstract document (PDF) *</Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                required
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f, (name, dataUrl) => setForm({ ...form, documentName: name, documentDataUrl: dataUrl }));
                }}
              />
              {form.documentName && (
                <p className="text-xs text-muted-foreground mt-1">Selected: {form.documentName}</p>
              )}
            </div>
          </section>

          <DialogFooter className="gap-2 sm:gap-0 sticky bottom-0 bg-background pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Create speaker & registration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
