import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_SYMPOSIUM_SLUG } from "@/lib/api/constants";
import type { SymposiumDto } from "@/lib/api/dto";

export type SymposiumState = {
  slug: string;
  id: string | null;
  symposium: SymposiumDto | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

const initialState: SymposiumState = {
  slug: DEFAULT_SYMPOSIUM_SLUG,
  id: null,
  symposium: null,
  status: "idle",
  error: null,
};

const symposiumSlice = createSlice({
  name: "symposium",
  initialState,
  reducers: {
    setSymposiumLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setSymposium(state, action: PayloadAction<{ slug: string; symposium: SymposiumDto }>) {
      state.slug = action.payload.slug;
      state.symposium = action.payload.symposium;
      state.id = action.payload.symposium.id;
      state.status = "ready";
      state.error = null;
    },
    setSymposiumError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    clearSymposium(state) {
      state.id = null;
      state.symposium = null;
      state.status = "idle";
      state.error = null;
    },
  },
});

export const { setSymposiumLoading, setSymposium, setSymposiumError, clearSymposium } =
  symposiumSlice.actions;
export default symposiumSlice.reducer;
