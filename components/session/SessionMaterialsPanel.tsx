"use client";

import { FileText, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileViewLink } from "@/components/file-viewer";
import Link from "next/link";
import { useSessionMaterialsAccess } from "@/hooks/use-session-materials-access";
import { useSpeakerSessionMaterials } from "@/hooks/api/useSpeaker";
import { dashboardPathForRole } from "@/lib/auth";
import { resolveLegacyRole } from "@/lib/api/mappers/role";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  sessionId: string;
  sessionTitle: string;
};

export function SessionMaterialsPanel({ sessionId, sessionTitle }: Props) {
  const { roles, isAuthenticated } = useAuth();
  const { ready, canView, registrationsLoading } = useSessionMaterialsAccess();
  const { materials, isLoading, isError } = useSpeakerSessionMaterials(canView ? sessionId : null);

  if (!ready || (isAuthenticated && registrationsLoading)) {
    return (
      <div className="rounded-2xl border border-border p-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        Checking access…
      </div>
    );
  }

  if (!canView) {
    const portalPath = isAuthenticated ? dashboardPathForRole(resolveLegacyRole(roles)) : "/login";
    return (
      <div className="rounded-2xl border border-dashed border-border p-5 flex items-start gap-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Session materials are for registered attendees</p>
          {isAuthenticated ? (
            <p className="mt-1">
              You are signed in, but this content needs an active delegate pass. Complete registration and payment to
              unlock slides and handouts.
            </p>
          ) : (
            <p className="mt-1">
              Slides and handouts are not shown on the public programme. Sign in with a paid pass to access.
            </p>
          )}
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href={isAuthenticated ? "/register" : portalPath}>
              {isAuthenticated ? "Complete registration" : "Sign in"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-serif font-bold mb-1 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" /> Session materials
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Shared with registered delegates, speakers, exhibitors, and staff.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading files…
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Could not load materials for this session right now.</p>
      ) : materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files for {sessionTitle} yet.</p>
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">
              <div className="min-w-0">
                <FileViewLink src={m.fileUrl} fileName="Presentation" className="font-medium truncate block" />
                <span className="text-[10px] text-muted-foreground">{sessionTitle}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
