"use client";

import { useState } from "react";
import { Upload, FileText, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXHIBITOR_BROCHURES, EXHIBITOR_ME } from "@/lib/mock-data";
import { toast } from "sonner";


export default function Page() {
  const [files, setFiles] = useState(EXHIBITOR_BROCHURES);
  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Brochures & downloads</h1>
          <p className="text-muted-foreground">{files.length} of {EXHIBITOR_ME.tierQuota.brochures} brochure slots used.</p>
        </div>
        <Button className="gradient-blue text-accent-foreground" onClick={() => toast.success("Upload simulated")} disabled={files.length >= EXHIBITOR_ME.tierQuota.brochures}>
          <Upload className="h-4 w-4 mr-1" /> Upload brochure
        </Button>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-6">
        <div className="h-full gradient-blue" style={{ width: `${(files.length / EXHIBITOR_ME.tierQuota.brochures) * 100}%` }} />
      </div>

      <div className="space-y-3">
        {files.map((f) => (
          <div key={f.id} className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.size} · uploaded {f.uploaded} · {f.downloads} downloads</div>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setFiles(files.filter((x) => x.id !== f.id)); toast.info("Removed"); }}><Trash className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
