import type { Role } from "./mock-data";
import { getSession } from "./auth";
import { loadStore, patchStore } from "./store";

export function getAnnouncementsForUser(role?: Role, email?: string) {
  const store = loadStore();
  const userEmail = email ?? getSession()?.email;
  const userRole = role ?? getSession()?.role;
  if (!userRole) return [];

  return store.announcements.filter((a) => {
    const dismissed = userEmail
      ? store.announcementDismissals.some(
          (d) => d.announcementId === a.id && d.email === userEmail,
        )
      : false;
    if (dismissed) return false;
    if (a.audiences.includes("all")) return true;
    return (a.audiences as Role[]).includes(userRole);
  });
}

export function dismissAnnouncement(announcementId: string, email: string) {
  patchStore((s) => ({
    ...s,
    announcementDismissals: [
      ...s.announcementDismissals.filter(
        (d) => !(d.announcementId === announcementId && d.email === email),
      ),
      { announcementId, email },
    ],
  }));
}
