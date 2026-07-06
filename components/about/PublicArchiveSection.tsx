"use client";

import { usePublicArchive } from "@/hooks/api/useArchive";
import { PreviousSymposiumGallery } from "./PreviousSymposiumGallery";

export function PublicArchiveSection() {
  const { photos, documents, isLoading } = usePublicArchive();

  if (isLoading && photos.length === 0 && documents.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading highlights…</p>;
  }

  if (photos.length === 0 && documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Highlights from previous editions will be published here soon.
      </p>
    );
  }

  return <PreviousSymposiumGallery images={photos} presentations={documents} />;
}
