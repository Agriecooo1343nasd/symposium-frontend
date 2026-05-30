"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeskExhibitorsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/desk/exhibitors/exhibitors");
  }, [router]);
  return null;
}
