import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  SessionEditorFields,
  normalizeSessionForm,
  validateSessionForm,
} from "@/components/programme/SessionEditorFields";
import { SUB_THEMES, type Session } from "@/lib/mock-data";
import { getRooms } from "@/lib/platform-settings";
import { upsertSession } from "@/lib/programme-sync";
import { uid } from "@/lib/store";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: Session | null;
  onSaved?: () => void;
};

function emptySession(): Session {
  const rooms = getRooms();
  return {
    id: uid("ss"),
    day: 1,
    start: "09:00",
    end: "10:00",
    title: "",
    type: "Plenary",
    room: rooms[0]?.name ?? "Grand Ballroom",
    subTheme: SUB_THEMES[0],
    speakers: [],
    description: "",
    longDescription: "",
    learningObjectives: [""],
    capacity: 100,
    visibility: "public",
  };
}

export function SessionFormDialog({ open, onOpenChange, session, onSaved }: Props) {
  const [form, setForm] = useState<Session>(session ?? emptySession());

  useEffect(() => {
    if (open) setForm(session ?? emptySession());
  }, [open, session]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateSessionForm(form);
    if (err) return toast.error(err);
    upsertSession(normalizeSessionForm(form));
    toast.success(session ? "Session updated" : "Session created");
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? "Edit session" : "New session"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <SessionEditorFields form={form} onChange={setForm} />
          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Save session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
