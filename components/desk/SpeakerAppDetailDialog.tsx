import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SpeakerApplication } from "@/lib/store";

export function SpeakerAppDetailDialog({
  app,
  open,
  onOpenChange,
}: {
  app: SpeakerApplication | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Speaker application — {app.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {app.photoUrl && (
            <img src={app.photoUrl} alt="" className="h-20 w-20 rounded-md object-cover border" />
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground uppercase">Email</div>
              <div>{app.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Phone</div>
              <div>{app.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Country</div>
              <div>{app.country}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Presentation type</div>
              <div>{app.presentationType}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">About</div>
            <p className="mt-1">{app.about}</p>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">Title</div>
            <p className="font-medium mt-1">{app.title}</p>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">Summary</div>
            <p className="mt-1">{app.summary}</p>
          </div>
          {app.documentName && (
            <div>
              <div className="text-xs text-muted-foreground uppercase">Abstract document</div>
              <p className="font-mono text-xs mt-1">{app.documentName}</p>
            </div>
          )}
          {app.reviewMessage && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-900">{app.reviewMessage}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
