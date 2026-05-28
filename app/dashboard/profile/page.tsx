"use client";

import { getSession } from "@/lib/auth";
import { ProfilePrivacyForm } from "@/components/profile/ProfilePrivacyForm";

export default function DashboardProfilePage() {
  const session = getSession();
  return (
    <div className="w-full">
      <h1 className="font-serif text-3xl font-bold mb-2">Edit profile</h1>
      <p className="text-muted-foreground mb-6">
        Controls how you appear in the networking directory and who can message you.
      </p>
      <ProfilePrivacyForm email={session?.email ?? ""} defaultName={session?.name ?? ""} defaultCountry="Rwanda" />
    </div>
  );
}
