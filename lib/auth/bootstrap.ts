import type { UserDto } from "@/lib/api/dto";
import { mapUserDto } from "@/lib/api/mappers/user";
import { normalizeBackendRoles } from "@/lib/api/mappers/role";
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/api/client";
import { permissionsFromAccessToken, rolesFromAccessToken } from "@/lib/auth/roles";
import type { AuthUser } from "@/store/slices/authSlice";
import { usersService } from "@/lib/api/services";

export function rolesForUser(user: UserDto, accessToken: string | null): string[] {
  const fromUser = user.roles ?? [];
  const fromToken = accessToken ? rolesFromAccessToken(accessToken) : [];
  return normalizeBackendRoles(fromUser.length ? fromUser : fromToken);
}

export function buildAuthUser(user: UserDto, accessToken: string): AuthUser {
  const roles = rolesForUser(user, accessToken);
  const permissions = permissionsFromAccessToken(accessToken);
  return mapUserDto({ ...user, roles }, permissions);
}

async function resolveAccessToken(): Promise<string | null> {
  let accessToken = getAccessToken();
  if (!accessToken) return null;

  if (isAccessTokenExpired(accessToken) && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return refreshed;
    return null;
  }

  return accessToken;
}

/** Load the current user from the API, refreshing the JWT when needed. */
export async function fetchAuthenticatedUser(): Promise<{
  dto: UserDto;
  user: AuthUser;
  accessToken: string;
  refreshToken: string | null;
}> {
  let accessToken = await resolveAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const dto = await usersService.getMe();
    return {
      dto,
      user: buildAuthUser(dto, accessToken),
      accessToken,
      refreshToken: getRefreshToken(),
    };
  } catch {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error("Not authenticated");

    const dto = await usersService.getMe();
    return {
      dto,
      user: buildAuthUser(dto, refreshed),
      accessToken: refreshed,
      refreshToken: getRefreshToken(),
    };
  }
}
