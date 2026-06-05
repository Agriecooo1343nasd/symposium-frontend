"use client";

import { NewsCmsPanel } from "@/components/admin/NewsCmsPanel";

export default function ModeratorNewsPage() {
  return (
    <NewsCmsPanel
      title="News"
      subtitle="Publish news and manage the public symposium archive — same CMS as admin."
      defaultAuthor="NAS Communications"
    />
  );
}
