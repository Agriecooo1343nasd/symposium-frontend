"use client";

import Link from "next/link";
import { FileText, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { getSessions } from "@/lib/sessions";
import { canViewSessionMaterials } from "@/lib/access";
import { FileViewLink } from "@/components/file-viewer";

export default function DashboardMaterialsPage() {
  const store = useStore();
  const canView = canViewSessionMaterials();
  const sessions = getSessions();
  const samplePdf = store.sessionMaterials.find((m) => m.fileName.toLowerCase().endsWith(".pdf"));
  const orgFiles = [
    { name: "NAS 2026 Concept Note", type: "PDF", size: "1.2 MB", src: samplePdf?.fileDataUrl },
    { name: "Delegate Welcome Pack", type: "PDF", size: "0.9 MB", src: samplePdf?.fileDataUrl },
    { name: "Code of Conduct", type: "PDF", size: "0.3 MB", src: samplePdf?.fileDataUrl },
  ];
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
          {orgFiles.map((f) => (
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
              {f.src ? (
                <FileViewLink src={f.src} fileName={f.name} className="shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold">
                    <Eye className="h-3.5 w-3.5" /> View
                  </span>
                </FileViewLink>
              ) : (
                <span className="text-xs text-muted-foreground">Soon</span>
              )}
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
                      {f.fileDataUrl ? (
                        <FileViewLink
                          src={f.fileDataUrl}
                          fileName={f.fileName}
                          className="text-sm inline-flex items-center gap-2"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{f.fileName}</span>
                      )}
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
