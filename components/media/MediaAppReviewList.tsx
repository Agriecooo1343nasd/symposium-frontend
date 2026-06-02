"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Eye, FileText, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MediaApplication } from "@/lib/store";
import { approveMediaApplication, rejectMediaApplication, MEDIA_PRESS_TYPE_LABELS } from "@/lib/media-registration";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  apps: MediaApplication[];
  readOnly?: boolean;
  detailBasePath: "/admin/media" | "/desk/media";
};

export function MediaAppReviewList({ apps, readOnly = false, detailBasePath }: Props) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const approve = (app: MediaApplication) => {
    const reviewer = getSession()?.name ?? "Staff";
    const res = approveMediaApplication(app.id, reviewer);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${app.name} accredited`);
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    const app = apps.find((a) => a.id === rejectId);
    const reviewer = getSession()?.name ?? "Staff";
    const res = rejectMediaApplication(rejectId, reviewer, message.trim());
    if (!res.ok) return toast.error(res.error);
    toast.info(`Rejected ${app?.name ?? "application"}`);
    setRejectId(null);
    setMessage("");
  };

  const statusClass = (s: MediaApplication["status"]) =>
    s === "approved"
      ? "bg-green/15 text-green"
      : s === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  if (apps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
        No media applications yet.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Journalist</th>
              <th className="text-left px-4 py-3">Outlet</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3">Documents</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.pressName}</div>
                  <div className="text-xs text-muted-foreground">{a.pressCountry}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs">
                  {MEDIA_PRESS_TYPE_LABELS[a.pressType]}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-accent" />
                    {a.credentialFileName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", statusClass(a.status))}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${detailBasePath}/${a.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Link>
                  </Button>
                  {!readOnly && a.status === "pending" && (
                    <>
                      <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => approve(a)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectId(a.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" /> Reject media application
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message to applicant</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
              rows={4}
              placeholder="Explain what is missing from the press credentials…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={reject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
