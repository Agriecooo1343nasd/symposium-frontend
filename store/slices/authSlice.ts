import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearTokens, setTokens } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken?: string;
      }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.status = "authenticated";
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "anonymous";
      clearTokens();
    },
    setAuthLoading(state) {
      state.status = "loading";
    },
  },
});

export const { setCredentials, setUser, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
