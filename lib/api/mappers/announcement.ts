import type { AnnouncementDto } from "../dto";

export type NewsView = {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  body: string;
  image: string;
};

const FALLBACK_IMAGE = "/assets/image.png";

export function mapAnnouncementDto(dto: AnnouncementDto): NewsView {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    date: dto.publishedAt ?? dto.createdAt,
    author: "NAS Secretariat",
    excerpt: dto.excerpt ?? "",
    body: dto.content,
    image: dto.imageUrl ?? FALLBACK_IMAGE,
  };
}

export function mapAnnouncements(dtos: AnnouncementDto[]): NewsView[] {
  return dtos.map(mapAnnouncementDto);
}
