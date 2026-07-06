import type {
  SymposiumArchiveItemDto,
  UpsertSymposiumArchiveItemDto,
} from "@/lib/api/dto";

export type ArchiveKind = "slides" | "overview" | "report" | "proceedings";

export type GalleryPhoto = {
  id: string;
  src: string;
  caption: string;
  event: string;
  year: number;
  order: number;
};

export type ArchiveDoc = {
  id: string;
  title: string;
  presenter: string;
  fileName: string;
  fileUrl: string;
  event: string;
  year: number;
  kind: ArchiveKind;
  order: number;
};

const DEFAULT_EVENT = "2nd National Agroecology Symposium";
const DEFAULT_YEAR = 2024;

type ArchiveMeta = {
  event?: string;
  year?: number;
  presenter?: string;
  kind?: ArchiveKind;
  fileName?: string;
};

/**
 * The backend archive item exposes only title/description/fileUrl/thumbnailUrl/
 * sortOrder/isPublished. The richer frontend model (event, year, presenter,
 * kind, fileName) is round-tripped through the `description` field as JSON so no
 * metadata is lost until the backend adds dedicated columns.
 */
export function encodeArchiveMeta(meta: ArchiveMeta): string {
  return JSON.stringify(meta);
}

export function decodeArchiveMeta(description?: string | null): ArchiveMeta {
  if (!description) return {};
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") return parsed as ArchiveMeta;
    return {};
  } catch {
    return {};
  }
}

export function toGalleryPhoto(item: SymposiumArchiveItemDto): GalleryPhoto {
  const meta = decodeArchiveMeta(item.description);
  return {
    id: item.id,
    src: item.fileUrl,
    caption: item.title,
    event: meta.event ?? DEFAULT_EVENT,
    year: meta.year ?? DEFAULT_YEAR,
    order: item.sortOrder,
  };
}

export function toArchiveDoc(item: SymposiumArchiveItemDto): ArchiveDoc {
  const meta = decodeArchiveMeta(item.description);
  return {
    id: item.id,
    title: item.title,
    presenter: meta.presenter ?? "NAS Secretariat",
    fileName: meta.fileName ?? item.fileUrl.split("/").pop() ?? "document",
    fileUrl: item.fileUrl,
    event: meta.event ?? DEFAULT_EVENT,
    year: meta.year ?? DEFAULT_YEAR,
    kind: meta.kind ?? "slides",
    order: item.sortOrder,
  };
}

export function galleryToUpsert(
  symposiumId: string,
  photo: Omit<GalleryPhoto, "id">,
): UpsertSymposiumArchiveItemDto {
  return {
    symposiumId,
    itemType: "photo",
    title: photo.caption,
    fileUrl: photo.src,
    thumbnailUrl: photo.src,
    description: encodeArchiveMeta({ event: photo.event, year: photo.year }),
    sortOrder: photo.order,
    isPublished: true,
  };
}

export function docToUpsert(
  symposiumId: string,
  doc: Omit<ArchiveDoc, "id">,
): UpsertSymposiumArchiveItemDto {
  return {
    symposiumId,
    itemType: "document",
    title: doc.title,
    fileUrl: doc.fileUrl,
    description: encodeArchiveMeta({
      event: doc.event,
      year: doc.year,
      presenter: doc.presenter,
      kind: doc.kind,
      fileName: doc.fileName,
    }),
    sortOrder: doc.order,
    isPublished: true,
  };
}
