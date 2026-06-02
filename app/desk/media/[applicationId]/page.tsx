"use client";

import { useParams } from "next/navigation";
import { MediaApplicationDetail } from "@/components/media/MediaApplicationDetail";

export default function DeskMediaDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";

  return (
    <MediaApplicationDetail applicationId={applicationId} backHref="/desk/media" />
  );
}
