import { X } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getAnnouncementsForUser, dismissAnnouncement } from "@/lib/announcements";
import { useStore } from "@/hooks/use-store";

export function AnnouncementBanner() {
  useStore();
  const session = getSession();
  const items = getAnnouncementsForUser(session?.role, session?.email);
  const latest = items[0];
  if (!latest || !session?.email) return null;

  return (
    <div className="bg-accent/10 border-b border-accent/30 px-4 py-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{latest.title}</div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{latest.body}</p>
      </div>
      <button
        type="button"
        className="shrink-0 p-1 rounded hover:bg-accent/20"
        onClick={() => dismissAnnouncement(latest.id, session.email)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
