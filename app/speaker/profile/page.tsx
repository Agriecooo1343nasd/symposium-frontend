"use client";

import { getSession } from "@/lib/auth";
import { ProfilePrivacyForm } from "@/components/profile/ProfilePrivacyForm";

export default function SpeakerProfilePage() {
  const session = getSession();
  return (
    <div className="w-full">
      <h1 className="font-serif text-3xl font-bold mb-2">Speaker profile</h1>
      <p className="text-muted-foreground mb-6">Directory visibility and messaging preferences for networking.</p>
      <ProfilePrivacyForm email={session?.email ?? ""} defaultName={session?.name ?? ""} />
    </div>
  );
}
