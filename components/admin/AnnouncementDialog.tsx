import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { patchStore, uid, appendAudit } from "@/lib/store";
import { getSession } from "@/lib/auth";
import type { Role } from "@/lib/mock-data";
import { toast } from "sonner";

const AUDIENCE_OPTIONS: { id: Role | "all"; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "attendee", label: "Attendees" },
  { id: "speaker", label: "Speakers" },
  { id: "exhibitor", label: "Exhibitors" },
  { id: "moderator", label: "Moderators" },
  { id: "registration_desk", label: "Registration desk" },
  { id: "admin", label: "Admins" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AnnouncementDialog({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audiences, setAudiences] = useState<(Role | "all")[]>(["all"]);

  const toggleAudience = (id: Role | "all") => {
    if (id === "all") {
      setAudiences(["all"]);
      return;
    }
    setAudiences((prev) => {
      const withoutAll = prev.filter((a) => a !== "all");
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter((a) => a !== id);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, id];
    });
  };

  const submit = () => {
    if (!title.trim() || !body.trim()) return toast.error("Title and message required");
    const session = getSession();
    patchStore((s) => ({
      ...s,
      announcements: [
        {
          id: uid("ann"),
          title: title.trim(),
          body: body.trim(),
          audiences,
          createdAt: new Date().toISOString(),
          createdBy: session?.name ?? "Admin",
        },
        ...s.announcements,
      ],
    }));
    appendAudit(session?.name ?? "Admin", "Posted announcement", title);
    toast.success("Announcement sent to selected portals");
    setTitle("");
    setBody("");
    setAudiences(["all"]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send announcement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" placeholder="e.g. Plenary room change" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1" placeholder="Full message shown in portal banners…" />
          </div>
          <div>
            <Label className="mb-2 block">Audience</Label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={audiences.includes(a.id)}
                    onCheckedChange={() => toggleAudience(a.id)}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gradient-blue text-accent-foreground" onClick={submit}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
