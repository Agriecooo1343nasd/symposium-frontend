"use client";

import { NewsCmsPanel } from "@/components/admin/NewsCmsPanel";


export default function Page() {
  return (
    <NewsCmsPanel
      title="News CMS"
      subtitle="Publish news articles and manage the public symposium archive (photos & documents on /about)."
      defaultAuthor="NAS Secretariat"
    />
  );
}
