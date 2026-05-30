"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModeratorNetworkingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/moderator/networking/directory");
  }, [router]);
  return null;
}
