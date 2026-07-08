import type { AuthUser } from "@/store/slices/authSlice";
import type { UserDto } from "../dto";

export function mapUserDto(dto: UserDto, permissions: string[] = []): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    profileImageUrl: dto.profileImageUrl,
    roles: dto.roles ?? [],
    permissions,
  };
}

export function userDisplayName(user: Pick<UserDto | AuthUser, "firstName" | "lastName" | "email">) {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return user.email;
}
