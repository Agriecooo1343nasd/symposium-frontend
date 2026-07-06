"use client";

import { usePublicCommittee } from "@/hooks/api/usePublicData";

export function PublicCommitteeSection() {
  const { members, isLoading } = usePublicCommittee();

  if (isLoading && members.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading committee…</p>;
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        The organizing committee will be announced soon.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((p) => (
        <div key={p.id} className="rounded-2xl bg-card border border-border p-6 hover-lift">
          {p.photoUrl ? (
            <img src={p.photoUrl} alt={p.name} className="h-12 w-12 rounded-full object-cover mb-3" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-secondary mb-3 flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {p.name.slice(0, 1)}
            </div>
          )}
          <div className="font-serif font-bold text-base">{p.name}</div>
          <div className="text-sm text-accent font-medium">{p.role}</div>
          {p.organization && <div className="text-xs text-muted-foreground mt-0.5">{p.organization}</div>}
        </div>
      ))}
    </div>
  );
}
