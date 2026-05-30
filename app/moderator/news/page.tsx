"use client";

import { NewsCmsPanel } from "@/components/admin/NewsCmsPanel";

export default function ModeratorNewsPage() {
  return (
    <NewsCmsPanel
      title="News"
      subtitle="Same CMS as admin — create, update, and publish symposium news."
      defaultAuthor="NAS Communications"
    />
  );
}
