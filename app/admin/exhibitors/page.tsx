"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminExhibitorsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/exhibitors/exhibitors");
  }, [router]);
  return null;
}
