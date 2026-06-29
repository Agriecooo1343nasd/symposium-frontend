"use client";

import { ProfilePrivacyForm } from "@/components/profile/ProfilePrivacyForm";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/api/useAuthSession";
import { userDisplayName } from "@/lib/api/mappers/user";

export default function DashboardProfilePage() {
  const { session } = useAuth();
  const { data: user } = useCurrentUser();
  const name = user ? userDisplayName(user) : session?.name ?? "";
  const email = user?.email ?? session?.email ?? "";

  return (
    <div className="w-full">
      <h1 className="font-serif text-3xl font-bold mb-2">Edit profile</h1>
      <p className="text-muted-foreground mb-6">
        Controls how you appear in the networking directory and who can message you.
      </p>
      <ProfilePrivacyForm
        email={email}
        defaultName={name}
        defaultOrg={user?.organization ?? ""}
        defaultCountry={user?.country ?? "Rwanda"}
      />
    </div>
  );
}
