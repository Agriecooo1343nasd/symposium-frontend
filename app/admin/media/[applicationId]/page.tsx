"use client";

import { useParams } from "next/navigation";
import { MediaApplicationDetail } from "@/components/media/MediaApplicationDetail";

export default function AdminMediaDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";

  return (
    <MediaApplicationDetail applicationId={applicationId} backHref="/admin/media" />
  );
}
