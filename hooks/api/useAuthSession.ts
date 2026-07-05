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
import { buildAuthUser, fetchAuthenticatedUser, rolesForUser } from "@/lib/auth/bootstrap";
import { buildSessionFromUser } from "@/lib/auth/session";
import { signOut as clearSessionBridge, writeSession } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { logout, setAuthLoading, setCredentials, setUser } from "@/store/slices/authSlice";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function hydrate() {
      const token = getAccessToken();
      if (!token) {
        dispatch(setUser(null));
        return;
      }

      dispatch(setAuthLoading());

      try {
        const result = await fetchAuthenticatedUser();
        if (cancelled) return;

        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken ?? undefined,
          }),
        );
        writeSession(buildSessionFromUser(result.dto, result.user.roles));
      } catch {
        if (cancelled) return;
        clearTokens();
        clearSessionBridge();
        dispatch(setUser(null));
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const tokens = await authService.login(dto);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await usersService.getMe();
      const authUser = buildAuthUser(user, tokens.accessToken);
      return {
        user,
        authUser,
        roles: authUser.roles,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    },
    onSuccess: ({ user, authUser, roles, accessToken, refreshToken }) => {
      dispatch(
        setCredentials({
          user: authUser,
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
      const authUser = buildAuthUser(user, tokens.accessToken);
      return {
        user,
        authUser,
        roles: authUser.roles,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    },
    onSuccess: ({ user, authUser, roles, accessToken, refreshToken }) => {
      dispatch(
        setCredentials({
          user: authUser,
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
