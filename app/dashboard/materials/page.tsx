"use client";

import Link from "next/link";
import { FileText, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getSessions } from "@/lib/sessions";
import { canViewSessionMaterials } from "@/lib/access";
import { toast } from "sonner";

const ORG_FILES = [
  { name: "NAS 2026 Concept Note", type: "PDF", size: "1.2 MB" },
  { name: "Delegate Welcome Pack", type: "PDF", size: "0.9 MB" },
  { name: "Code of Conduct", type: "PDF", size: "0.3 MB" },
];

export default function DashboardMaterialsPage() {
  const store = useStore();
  const canView = canViewSessionMaterials();
  const sessions = getSessions();
  const bySession = sessions
    .map((s) => ({
      session: s,
      files: store.sessionMaterials.filter((m) => m.sessionId === s.id),
    }))
    .filter((x) => x.files.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Materials</h1>
        <p className="text-muted-foreground">Pre-event resources and session files (FR-3.2, FR-8.1).</p>
      </div>

      <section>
        <h2 className="font-serif text-lg font-bold mb-3">Organizer resources</h2>
        <div className="space-y-3">
          {ORG_FILES.map((f) => (
            <div key={f.name} className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.type} - {f.size}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info("Download starting...")}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-bold mb-3">Session presentations</h2>
        {!canView ? (
          <div className="rounded-xl border border-dashed p-5 text-sm flex gap-3 text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            <p>Complete payment to access speaker session files.</p>
          </div>
        ) : bySession.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No session files published yet. Join live sessions from your dashboard.
          </p>
        ) : (
          <div className="space-y-4">
            {bySession.map(({ session, files }) => (
              <div key={session.id} className="rounded-2xl bg-card border border-border p-4">
                <div className="font-medium text-sm mb-2">
                  <Link href={`/programme/${session.id}`} className="hover:text-accent">
                    {session.title}
                  </Link>
                  <span className="text-muted-foreground font-normal"> - Day {session.day}</span>
                </div>
                <ul className="space-y-2">
                  {files.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.fileDataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-accent hover:underline inline-flex items-center gap-2"
                      >
                        <FileText className="h-3.5 w-3.5" /> {f.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard/live">Watch live stream</Link>
        </Button>
      </section>
    </div>
  );
}
