"use client";

import { BoothMapManager } from "@/components/admin/BoothMapManager";

export default function ModeratorBoothsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Booth map</h1>
        <p className="text-muted-foreground">
          Create and manage exhibition booths — capacity, location, and grid position.
        </p>
      </div>
      <BoothMapManager />
    </div>
  );
}
