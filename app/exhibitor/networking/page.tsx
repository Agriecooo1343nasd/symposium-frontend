"use client";

import { getSession } from "@/lib/auth";
import { NetworkingModule } from "@/components/networking/NetworkingModule";


export default function Page() {
  const session = getSession();
  return (
    <NetworkingModule
      userEmail={session?.email ?? ""}
      userName={session?.name ?? ""}
      subtitle="Connect with delegates and other exhibitors. Control visibility in your booth profile settings."
    />
  );
}
