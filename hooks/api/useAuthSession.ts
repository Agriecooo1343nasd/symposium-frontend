"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authService, usersService } from "@/lib/api/services";
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UserDto,
  VerifyEmailDto,
} from "@/lib/api/dto";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { mapUserDto } from "@/lib/api/mappers/user";
import { permissionsFromAccessToken, rolesFromAccessToken } from "@/lib/auth/roles";
import { buildSessionFromUser } from "@/lib/auth/session";
import { signOut as clearSessionBridge, writeSession } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setAuthLoading, setCredentials, setUser } from "@/store/slices/authSlice";

function rolesFor(user: UserDto, accessToken: string | null): string[] {
  if (user.roles?.length) return user.roles;
  return accessToken ? rolesFromAccessToken(accessToken) : [];
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => usersService.getMe(),
    enabled: typeof window !== "undefined" && Boolean(getAccessToken()),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/**
 * Hydrates Redux auth + the session bridge from a persisted JWT on app load.
 * Mounted once in AppProviders.
 */
export function useAuthHydration() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    if (status !== "idle") return;
    if (typeof window === "undefined") return;
    const token = getAccessToken();
    if (!token) {
      dispatch(setUser(null));
      return;
    }

    let cancelled = false;
    dispatch(setAuthLoading());
    usersService
      .getMe()
      .then((user) => {
        if (cancelled) return;
        const roles = rolesFor(user, token);
        const permissions = permissionsFromAccessToken(token);
        dispatch(setCredentials({ user: mapUserDto(user, permissions), accessToken: token }));
        writeSession(buildSessionFromUser(user, roles));
      })
      .catch(() => {
        if (cancelled) return;
        clearTokens();
        dispatch(setUser(null));
      });

    return () => {
      cancelled = true;
    };
  }, [status, dispatch]);
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const tokens = await authService.login(dto);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await usersService.getMe();
      const roles = rolesFor(user, tokens.accessToken);
      const permissions = permissionsFromAccessToken(tokens.accessToken);
      return { user, roles, permissions, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    },
    onSuccess: ({ user, roles, permissions, accessToken, refreshToken }) => {
      dispatch(
        setCredentials({
          user: mapUserDto(user, permissions),
          accessToken,
          refreshToken,
        }),
      );
      writeSession(buildSessionFromUser(user, roles));
      queryClient.setQueryData(queryKeys.users.me, user);
    },
  });
}

export function useRegisterAccount() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const tokens = await authService.register(dto);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await usersService.getMe();
      const roles = rolesFor(user, tokens.accessToken);
      const permissions = permissionsFromAccessToken(tokens.accessToken);
      return { user, roles, permissions, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    },
    onSuccess: ({ user, roles, permissions, accessToken, refreshToken }) => {
      dispatch(
        setCredentials({
          user: mapUserDto(user, permissions),
          accessToken,
          refreshToken,
        }),
      );
      writeSession(buildSessionFromUser(user, roles));
      queryClient.setQueryData(queryKeys.users.me, user);
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refreshToken }).catch(() => undefined);
      }
    },
    onSettled: () => {
      dispatch(logout());
      clearSessionBridge();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => authService.forgotPassword(dto),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => authService.resetPassword(dto),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (dto: VerifyEmailDto) => authService.verifyEmail(dto),
  });
}
