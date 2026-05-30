"use client";

import { NewsCmsPanel } from "@/components/admin/NewsCmsPanel";


export default function Page() {
  return (
    <NewsCmsPanel
      title="News CMS"
      subtitle="Create, update, and publish articles for the public /news section."
      defaultAuthor="NAS Secretariat"
    />
  );
}
