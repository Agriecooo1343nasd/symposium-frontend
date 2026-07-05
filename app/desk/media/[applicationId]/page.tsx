"use client";

import { useParams } from "next/navigation";
import { MediaAccreditationDetail } from "@/components/media/MediaAccreditationDetail";

export default function DeskMediaDetailPage() {
  const params = useParams();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";

  return <MediaAccreditationDetail applicationId={applicationId} backHref="/desk/media" />;
}
