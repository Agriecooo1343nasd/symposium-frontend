import { DEFAULT_SYMPOSIUM_SLUG } from "./constants";
import { symposiumsService } from "./services";

/** Resolve symposium UUID for server components (news ISR, etc.). */
export async function resolveSymposiumId(slug: string = DEFAULT_SYMPOSIUM_SLUG): Promise<string | null> {
  try {
    const symposium = await symposiumsService.getBySlug(slug);
    return symposium.id;
  } catch {
    return null;
  }
}
