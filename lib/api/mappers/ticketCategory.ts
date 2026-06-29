import type { TicketCategory } from "@/lib/mock-data";
import type { TicketCategoryDto } from "../dto";

function parseBenefits(benefits?: Record<string, unknown>[] | null): string[] {
  if (!benefits?.length) return [];
  return benefits.flatMap((b) => {
    if (typeof b === "string") return [b];
    if (b && typeof b === "object") {
      const label = (b as { label?: string; text?: string; name?: string }).label
        ?? (b as { text?: string }).text
        ?? (b as { name?: string }).name;
      if (label) return [label];
    }
    return [];
  });
}

export function mapTicketCategoryDto(dto: TicketCategoryDto): TicketCategory {
  const features = parseBenefits(dto.benefits);
  return {
    id: dto.id,
    name: dto.name,
    usd: dto.priceUsd,
    description: dto.description ?? "",
    features: features.length ? features : [`${dto.priceRwf.toLocaleString()} RWF`],
    note: dto.requiresVerification ? "Requires verification" : undefined,
    popular: dto.sortOrder === 1,
  };
}

export function mapTicketCategories(dtos: TicketCategoryDto[]): TicketCategory[] {
  return dtos.filter((d) => d.isActive).map(mapTicketCategoryDto);
}

export function mapTicketCategoryToPlan(dto: TicketCategoryDto) {
  return {
    ...mapTicketCategoryDto(dto),
    slug: dto.slug,
    priceRwf: dto.priceRwf,
    symposiumId: dto.symposiumId,
    capacity: dto.capacity,
    soldCount: dto.soldCount,
    available: dto.available,
    isActive: dto.isActive,
    requiresVerification: dto.requiresVerification,
    sortOrder: dto.sortOrder,
  };
}
