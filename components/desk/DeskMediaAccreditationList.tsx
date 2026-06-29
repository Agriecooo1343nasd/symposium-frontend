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
import { FileViewLink } from "@/components/file-viewer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MediaAccreditationDto } from "@/lib/api/dto";
import { useUpdateMediaAccreditation } from "@/hooks/api/useDesk";

type Props = {
  accreditations: MediaAccreditationDto[];
  readOnly?: boolean;
  detailBasePath: "/admin/media" | "/desk/media";
};

export function DeskMediaAccreditationList({ accreditations, readOnly = false, detailBasePath }: Props) {
  const update = useUpdateMediaAccreditation();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const approve = (app: MediaAccreditationDto) => {
    update.mutate(
      { id: app.id, dto: { status: "approved" } },
      {
        onSuccess: () => toast.success(`${app.fullName} accredited`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Approval failed"),
      },
    );
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    const app = accreditations.find((a) => a.id === rejectId);
    update.mutate(
      { id: rejectId, dto: { status: "rejected", adminNotes: message.trim() } },
      {
        onSuccess: () => {
          toast.info(`Rejected ${app?.fullName ?? "application"}`);
          setRejectId(null);
          setMessage("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Rejection failed"),
      },
    );
  };

  const statusClass = (s: MediaAccreditationDto["status"]) =>
    s === "approved"
      ? "bg-green/15 text-green"
      : s === "rejected" || s === "revoked"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  if (accreditations.length === 0) {
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
              <th className="text-left px-4 py-3 hidden md:table-cell">Coverage</th>
              <th className="text-left px-4 py-3">Documents</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accreditations.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{a.fullName}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.outletName}</div>
                  <div className="text-xs text-muted-foreground">{a.country ?? a.outletType ?? "—"}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs">{a.coverageType ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {a.pressCardUrl ? (
                    <FileViewLink
                      src={a.pressCardUrl}
                      fileName="press-credential"
                      className="inline-flex items-center gap-1"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" /> None on file
                    </span>
                  )}
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
                      <Button
                        size="sm"
                        className="gradient-blue text-accent-foreground"
                        disabled={update.isPending}
                        onClick={() => approve(a)}
                      >
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={reject} disabled={!message.trim() || update.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
