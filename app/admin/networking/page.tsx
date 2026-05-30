"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminNetworkingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/networking/directory");
  }, [router]);
  return null;
}
