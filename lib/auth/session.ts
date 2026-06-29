import type { MockSession } from "@/lib/mock-data";
import type { UserDto } from "@/lib/api/dto";
import { resolveLegacyRole, roleLabelFromBackend } from "@/lib/api/mappers/role";
import { userDisplayName } from "@/lib/api/mappers/user";

export function buildSessionFromUser(user: UserDto, roles: string[]): MockSession {
  const effectiveRoles = roles.length ? roles : (user.roles ?? []);
  const primaryRole = effectiveRoles[0] ?? "attendee";
  return {
    email: user.email,
    name: userDisplayName(user),
    role: resolveLegacyRole(effectiveRoles),
    category: roleLabelFromBackend(primaryRole),
    ticketId: "",
    avatar: user.profileImageUrl ?? undefined,
  };
}
