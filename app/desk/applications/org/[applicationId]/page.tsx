"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy path — redirect to consolidated exhibitor application detail. */
export default function DeskOrgApplicationRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";

  useEffect(() => {
    if (applicationId) router.replace(`/desk/exhibitors/application/${applicationId}`);
  }, [applicationId, router]);

  return null;
}
