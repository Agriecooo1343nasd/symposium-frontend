import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import symposiumReducer from "./slices/symposiumSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      symposium: symposiumReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
