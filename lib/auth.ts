// Session bridge — derived session cached in localStorage; safe across SSR.
// Real authentication tokens live in lib/api/client (JWT). This module exposes a
// MockSession-shaped view consumed by portal UI across the app.
import { DEMO_USER, type MockSession, type Role } from "./mock-data";
import { findUserByEmail } from "./store";
import { clearTokens } from "./api/client";

const KEY = "nas2026_session";
const LISTENERS = new Set<() => void>();

function notify() {
  LISTENERS.forEach((fn) => fn());
}

/** Persist a real authenticated session (called after API login / hydration). */
export function writeSession(session: MockSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  notify();
}

export function getSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as MockSession;
    const user = findUserByEmail(session.email);
    if (user?.status === "suspended") return null;
    if (user && user.role !== session.role) {
      return { ...session, role: user.role };
    }
    return session;
  } catch {
    return null;
  }
}

export function signIn(role: Role = "attendee", overrides: Partial<MockSession> = {}): MockSession {
  // Default participation based on role
  const defaultParticipation: MockSession["participation"] =
    role === "exhibitor" ? (overrides.participation ?? "exhibitor") : undefined;

  const base: MockSession = {
    ...DEMO_USER,
    role,
    participation: defaultParticipation,
    name:
      overrides.name ??
      (role === "admin"
        ? "Symposium Admin"
        : role === "registration_desk"
          ? "Claire Ingabire"
          : role === "moderator"
            ? "Event Moderator"
            : role === "exhibitor"
              ? "AgriTools Rwanda"
              : role === "speaker"
                ? "Dr. Mukeshimana Solange"
                : DEMO_USER.name),
    email:
      overrides.email ??
      (role === "admin"
        ? "admin@nas2026.rw"
        : role === "registration_desk"
          ? "desk@nas2026.rw"
          : role === "moderator"
            ? "moderator@nas2026.rw"
            : role === "exhibitor"
              ? "exhibitor@nas2026.rw"
              : role === "speaker"
                ? "speaker@nas2026.rw"
                : DEMO_USER.email),
    category:
      role === "admin"
        ? "Organizer"
        : role === "registration_desk"
          ? "Registration Desk"
          : role === "moderator"
            ? "Moderator"
            : role === "exhibitor"
              ? overrides.participation === "sponsor"
                ? "Sponsor"
                : overrides.participation === "both"
                  ? "Exhibitor + Sponsor"
                  : "Exhibitor"
              : role === "speaker"
                ? "Speaker"
                : DEMO_USER.category,
    ...overrides,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(base));
    LISTENERS.forEach((fn) => fn());
  }
  return base;
}

/** Convenience — get the participation type for the current exhibitor session */
export function getExhibitorParticipation(): "exhibitor" | "sponsor" | "both" {
  const session = getSession();
  if (session?.role !== "exhibitor") return "exhibitor";
  return session.participation ?? "exhibitor";
}

export function signOut() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
    notify();
  }
}

export function subscribeAuth(fn: () => void) {
  LISTENERS.add(fn);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", fn);
  }
  return () => {
    LISTENERS.delete(fn);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", fn);
    }
  };
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "registration_desk":
      return "/desk";
    case "moderator":
      return "/moderator";
    case "exhibitor":
      return "/exhibitor";
    case "speaker":
      return "/speaker";
    default:
      return "/dashboard";
  }
}
