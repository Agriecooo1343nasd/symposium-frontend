import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUB_THEMES } from "@/lib/mock-data";
import { upsertAttendeeProfile } from "@/lib/store";
import { getProfile } from "@/lib/networking-ops";
import type { SubTheme } from "@/lib/mock-data";
import { toast } from "sonner";

type Props = {
  email: string;
  defaultName: string;
  defaultOrg?: string;
  defaultCountry?: string;
};

export function ProfilePrivacyForm({ email, defaultName, defaultOrg = "", defaultCountry = "Rwanda" }: Props) {
  const existing = getProfile(email);
  const [form, setForm] = useState({
    name: defaultName,
    title: "",
    org: defaultOrg,
    country: defaultCountry,
    bio: "",
    photo: "",
    linkedin: "",
    publicInDirectory: true,
    allowMessages: true,
    allowExhibitorContact: true,
    subThemeInterests: [] as SubTheme[],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        title: existing.title ?? "",
        org: existing.org,
        country: existing.country,
        bio: existing.bio ?? "",
        photo: existing.photo ?? "",
        linkedin: existing.linkedin ?? "",
        publicInDirectory: existing.publicInDirectory,
        allowMessages: existing.allowMessages,
        allowExhibitorContact: existing.allowExhibitorContact ?? true,
        subThemeInterests: existing.subThemeInterests,
      });
    }
  }, [email, existing]);

  const readPhoto = (file: File) => {
    const r = new FileReader();
    r.onload = () => setForm((f) => ({ ...f, photo: r.result as string }));
    r.readAsDataURL(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    upsertAttendeeProfile({
      email,
      name: form.name,
      title: form.title,
      org: form.org,
      country: form.country,
      bio: form.bio,
      photo: form.photo || `https://i.pravatar.cc/400?u=${encodeURIComponent(email)}`,
      linkedin: form.linkedin,
      interests: form.subThemeInterests,
      subThemeInterests: form.subThemeInterests,
      publicInDirectory: form.publicInDirectory,
      allowMessages: form.allowMessages,
      allowExhibitorContact: form.allowExhibitorContact,
    });
    toast.success("Profile and privacy settings saved");
  };

  return (
    <form onSubmit={save} className="rounded-2xl bg-card border p-4 sm:p-6 space-y-5 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {form.photo ? (
          <img src={form.photo} alt="" className="h-20 w-20 rounded-full object-cover border shrink-0" />
        ) : (
          <div className="h-20 w-20 rounded-full gradient-navy text-white flex items-center justify-center font-serif font-bold shrink-0">
            {form.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
        )}
        <div className="flex-1 w-full space-y-2">
          <Label>Profile photo</Label>
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && readPhoto(e.target.files[0])} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" required /></div>
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
        <div><Label>Organization</Label><Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="mt-1" /></div>
        <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>LinkedIn</Label><Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="mt-1" /></div>
        <div className="sm:col-span-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="mt-1 resize-y" /></div>
        <div className="sm:col-span-2">
          <Label>Sub-theme interests</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {SUB_THEMES.map((t) => {
              const on = form.subThemeInterests.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      subThemeInterests: on ? form.subThemeInterests.filter((x) => x !== t) : [...form.subThemeInterests, t],
                    })
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Show me in the attendee directory</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Others can discover your profile and send connection requests.</p>
          </div>
          <Switch checked={form.publicInDirectory} onCheckedChange={(c: boolean) => setForm({ ...form, publicInDirectory: c })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Allow messages from connections</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Connected attendees can chat with you in-app.</p>
          </div>
          <Switch checked={form.allowMessages} onCheckedChange={(c: boolean) => setForm({ ...form, allowMessages: c })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>Allow exhibitors to capture my contact at booths</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Exhibitors may scan your e-ticket QR to save your profile as a business lead (FR-5.2). Required for lead
              capture.
            </p>
          </div>
          <Switch
            checked={form.allowExhibitorContact}
            onCheckedChange={(c: boolean) => setForm({ ...form, allowExhibitorContact: c })}
          />
        </div>
      </div>
      <Button type="submit" className="gradient-blue text-accent-foreground w-full sm:w-auto">Save profile</Button>
    </form>
  );
}
