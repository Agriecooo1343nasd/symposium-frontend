"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUB_THEMES } from "@/lib/mock-data";
import type { SubTheme } from "@/lib/mock-data";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/api/useAuthSession";
import { useUpdateProfile } from "@/hooks/api/useDashboard";
import { filesService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import { userDisplayName } from "@/lib/api/mappers/user";

type Props = {
  email: string;
  defaultName: string;
  defaultOrg?: string;
  defaultCountry?: string;
};

export function ProfilePrivacyForm({ email, defaultName, defaultOrg = "", defaultCountry = "Rwanda" }: Props) {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    org: defaultOrg,
    country: defaultCountry,
    bio: "",
    photo: "",
    linkedin: "",
    publicInDirectory: true,
    subThemeInterests: [] as SubTheme[],
  });

  useEffect(() => {
    if (!user) {
      const parts = defaultName.trim().split(/\s+/);
      setForm((f) => ({
        ...f,
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || parts[0] || "",
        org: defaultOrg,
        country: defaultCountry,
      }));
      return;
    }
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      title: user.title ?? "",
      org: user.organization ?? defaultOrg,
      country: user.country ?? defaultCountry,
      bio: user.bio ?? "",
      photo: user.profileImageUrl ?? "",
      linkedin: user.linkedInUrl ?? "",
      publicInDirectory: user.showInDirectory ?? true,
      subThemeInterests: (user.interests ?? []).filter((x): x is SubTheme =>
        (SUB_THEMES as readonly string[]).includes(x),
      ),
    });
  }, [user, defaultName, defaultOrg, defaultCountry]);

  const readPhoto = async (file: File) => {
    try {
      setUploading(true);
      const res = await filesService.upload(file, "avatar");
      setForm((f) => ({ ...f, photo: res.url }));
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        title: form.title || undefined,
        organization: form.org || undefined,
        country: form.country || undefined,
        bio: form.bio || undefined,
        profileImageUrl: form.photo || undefined,
        linkedInUrl: form.linkedin || undefined,
        interests: form.subThemeInterests,
        showInDirectory: form.publicInDirectory,
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (isLoading && !user) {
    return <div className="text-muted-foreground py-8">Loading profile…</div>;
  }

  const displayName = user ? userDisplayName(user) : defaultName;

  return (
    <form onSubmit={save} className="rounded-2xl bg-card border p-4 sm:p-6 space-y-5 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {form.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.photo} alt="" className="h-20 w-20 rounded-full object-cover border shrink-0" />
        ) : (
          <div className="h-20 w-20 rounded-full gradient-navy text-white flex items-center justify-center font-serif font-bold shrink-0">
            {displayName
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}
        <div className="flex-1 w-full space-y-2">
          <Label>Profile photo</Label>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && readPhoto(e.target.files[0])}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>First name</Label>
          <Input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label>Last name</Label>
          <Input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Organization</Label>
          <Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Country</Label>
          <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={email} disabled className="mt-1 bg-secondary/50" />
        </div>
        <div className="sm:col-span-2">
          <Label>LinkedIn</Label>
          <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="mt-1 resize-y" />
        </div>
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
                      subThemeInterests: on
                        ? form.subThemeInterests.filter((x) => x !== t)
                        : [...form.subThemeInterests, t],
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
            <p className="text-xs text-muted-foreground mt-0.5">Others can discover your profile in networking.</p>
          </div>
          <Switch
            checked={form.publicInDirectory}
            onCheckedChange={(c: boolean) => setForm({ ...form, publicInDirectory: c })}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={updateProfile.isPending}
        className="gradient-blue text-accent-foreground w-full sm:w-auto"
      >
        {updateProfile.isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
