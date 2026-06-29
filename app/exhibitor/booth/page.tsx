"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExhibitorProfile, useUpdateExhibitorProfile } from "@/hooks/api/useExhibitor";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function Page() {
  const { profile, isLoading, isError } = useExhibitorProfile();
  const updateProfile = useUpdateExhibitorProfile();
  const [companyName, setCompanyName] = useState("");
  const [boothNumber, setBoothNumber] = useState("");

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName ?? "");
      setBoothNumber(profile.boothNumber ?? "");
    }
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        companyName: companyName.trim() || undefined,
        boothNumber: boothNumber.trim() || null,
      });
      toast.success("Booth profile saved");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (isError || !profile) {
    return <p className="text-sm text-muted-foreground">Exhibitor profile not found.</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-2">Booth profile</h1>
      <p className="text-muted-foreground mb-6">
        Company and booth details shown in the exhibitor directory. Package:{" "}
        {profile.package?.name ?? "—"}
        {profile.sponsorName ? ` · Sponsor: ${profile.sponsorName}` : ""}
      </p>

      <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Company name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Booth number</Label>
            <Input
              value={boothNumber}
              onChange={(e) => setBoothNumber(e.target.value)}
              className="mt-1"
              placeholder="Assigned by secretariat"
            />
          </div>
        </div>
        {profile.package && (
          <div className="text-sm text-muted-foreground rounded-lg bg-secondary/40 p-3">
            Package: <strong>{profile.package.name}</strong>
            {profile.package.boothSize ? ` · ${profile.package.boothSize}` : ""}
            {profile.package.description ? ` — ${profile.package.description}` : ""}
          </div>
        )}
        <Button type="submit" className="gradient-blue text-accent-foreground" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
