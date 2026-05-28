// Mock auth — stored in localStorage; safe across SSR
import { DEMO_USER, type MockSession, type Role } from "./mock-data";
import { findUserByEmail } from "./store";

const KEY = "nas2026_session";
const LISTENERS = new Set<() => void>();

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
  const base: MockSession = {
    ...DEMO_USER,
    role,
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
              ? "Exhibitor Lead"
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

export function signOut() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
    LISTENERS.forEach((fn) => fn());
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
