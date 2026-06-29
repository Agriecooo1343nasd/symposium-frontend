"use client";

import { useParams } from "next/navigation";
import { DeskMediaApplicationDetail } from "@/components/desk/DeskMediaApplicationDetail";

export default function DeskMediaDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";

  return (
    <DeskMediaApplicationDetail applicationId={applicationId} backHref="/desk/media" />
  );
}
