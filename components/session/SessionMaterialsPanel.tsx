import { FileText, Lock, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, type SessionMaterial } from "@/lib/store";
import { canViewSessionMaterials } from "@/lib/access";
import Link from "next/link";
import { toast } from "sonner";
import { FileViewLink } from "@/components/file-viewer";

type Props = {
  sessionId: string;
  sessionTitle: string;
  allowUpload?: boolean;
  uploaderName?: string;
  uploaderEmail?: string;
};

export function SessionMaterialsPanel({ sessionId, sessionTitle, allowUpload, uploaderName, uploaderEmail }: Props) {
  const store = useStore();
  const canView = canViewSessionMaterials();
  const materials = store.sessionMaterials.filter((m) => m.sessionId === sessionId);

  if (!canView) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-5 flex items-start gap-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Session materials are for registered attendees</p>
          <p className="mt-1">Slides and handouts are not shown on the public programme. Sign in with a paid pass to access.</p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const addFile = (file: File) => {
    if (!uploaderEmail) return;
    const reader = new FileReader();
    reader.onload = () => {
      const mat: SessionMaterial = {
        id: uid("sm"),
        sessionId,
        fileName: file.name,
        fileDataUrl: reader.result as string,
        uploadedBy: uploaderName ?? "Speaker",
        uploadedByEmail: uploaderEmail,
        kind: "presentation",
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      patchStore((s) => ({ ...s, sessionMaterials: [...s.sessionMaterials, mat] }));
      toast.success("File added to session");
    };
    reader.readAsDataURL(file);
  };

  const remove = (id: string) => {
    patchStore((s) => ({ ...s, sessionMaterials: s.sessionMaterials.filter((m) => m.id !== id) }));
    toast.info("Removed from session");
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-serif font-bold mb-1 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" /> Session materials
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Shared with paid delegates, speakers, exhibitors, and staff — not on the public programme page for guests.
      </p>

      {materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files for this session yet.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 text-sm border rounded-md px-3 py-2">
              <div className="min-w-0">
                {m.fileDataUrl ? (
                  <FileViewLink src={m.fileDataUrl} fileName={m.fileName} className="font-medium truncate block" />
                ) : (
                  <span className="font-medium truncate block">{m.fileName}</span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {m.uploadedBy} · {sessionTitle}
                </span>
              </div>
              {allowUpload && m.uploadedByEmail === uploaderEmail && (
                <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => remove(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {allowUpload && uploaderEmail && (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".pdf,.ppt,.pptx"
            className="text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addFile(f);
            }}
          />
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      )}
    </div>
  );
}
