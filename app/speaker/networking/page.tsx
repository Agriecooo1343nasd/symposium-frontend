"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpeakerNetworkingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/speaker/networking/directory");
  }, [router]);
  return null;
}
