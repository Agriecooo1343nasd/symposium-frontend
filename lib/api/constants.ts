export const DEFAULT_SYMPOSIUM_SLUG = "nas-2026";

/** Default axios timeout for most API calls. */
export const DEFAULT_API_TIMEOUT_MS = 30_000;

/** MoMo/card initiate can block while the user approves on their phone — wait up to 2 minutes. */
export const PAYMENT_INITIATE_TIMEOUT_MS = 120_000;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.symposium.innov.rw/api/v1";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "https://api.symposium.innov.rw";
