"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardNetworkingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/networking/directory");
  }, [router]);
  return null;
}
