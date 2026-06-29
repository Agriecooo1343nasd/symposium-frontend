"use client";

import { FileText, Lock, Download } from "lucide-react";
import { useResourceLibrary } from "@/hooks/api/useEngage";
import { useAuth } from "@/hooks/use-auth";
import { getSessions } from "@/lib/sessions";

export default function DashboardMaterialsPage() {
  const { isAuthenticated } = useAuth();
  const { resources, isLoading, isError } = useResourceLibrary();
  const sessions = getSessions();

  const sessionTitle = (sessionId?: string | null) =>
    sessions.find((s) => s.id === sessionId)?.title ?? "Session resource";

  const general = resources.filter((r) => !r.sessionId);
  const bySession = resources.filter((r) => r.sessionId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Materials</h1>
        <p className="text-muted-foreground">Pre-event resources and session files (FR-3.2, FR-8.1).</p>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-dashed p-5 text-sm flex gap-3 text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          <p>Sign in and complete payment to access conference resources.</p>
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading resources…</div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          Resources are available to registered attendees. Complete your registration to unlock them.
        </div>
      ) : (
        <>
          <section>
            <h2 className="font-serif text-lg font-bold mb-3">Organizer resources</h2>
            {general.length === 0 ? (
              <p className="text-sm text-muted-foreground">No general resources published yet.</p>
            ) : (
              <div className="space-y-3">
                {general.map((r) => (
                  <a
                    key={r.id}
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4 hover-lift"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-accent shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{r.accessLevel}</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0">
                      <Download className="h-3.5 w-3.5" /> Open
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold mb-3">Session presentations</h2>
            {bySession.length === 0 ? (
              <p className="text-sm text-muted-foreground">No session files published yet.</p>
            ) : (
              <div className="space-y-3">
                {bySession.map((r) => (
                  <a
                    key={r.id}
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4 hover-lift"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-blue shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{r.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {sessionTitle(r.sessionId)}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0">
                      <Download className="h-3.5 w-3.5" /> Open
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
