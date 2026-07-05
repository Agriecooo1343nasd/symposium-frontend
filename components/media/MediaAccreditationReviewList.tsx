"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Eye, FileText, Newspaper, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useUpdateMediaAccreditation } from "@/hooks/api/useMediaAccreditation";
import { apiErrorMessage } from "@/lib/api/client";

type Props = {
  accreditations: MediaAccreditationDto[];
  readOnly?: boolean;
  detailBasePath: "/admin/media" | "/desk/media";
  showSearch?: boolean;
  viewMode?: "table" | "cards";
};

function formatSubmitted(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function MediaAccreditationReviewList({
  accreditations,
  readOnly = false,
  detailBasePath,
  showSearch = true,
  viewMode = "table",
}: Props) {
  const update = useUpdateMediaAccreditation();
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? accreditations.filter((a) =>
          [a.fullName, a.email, a.outletName, a.country, a.coverageType, a.jobTitle]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)),
        )
      : accreditations;
    return [...base].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [accreditations, search]);

  const mutateStatus = (
    id: string,
    dto: { status: MediaAccreditationDto["status"]; adminNotes?: string },
    successMsg: string,
  ) => {
    update.mutate(
      { id, dto },
      {
        onSuccess: () => toast.success(successMsg),
        onError: (err) => toast.error(apiErrorMessage(err)),
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
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const statusClass = (s: MediaAccreditationDto["status"]) =>
    s === "approved"
      ? "bg-green/15 text-green"
      : s === "rejected" || s === "revoked"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-800";

  return (
    <>
      {showSearch && (
        <Input
          placeholder="Search by name, email, outlet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md mb-4"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
          {accreditations.length === 0 ? "No media applications yet." : "No matches for your search."}
        </p>
      ) : viewMode === "cards" ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <article key={a.id} className="rounded-2xl border bg-card p-5 space-y-3 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold">{a.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{a.outletName}</p>
                </div>
                <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0", statusClass(a.status))}>
                  {a.status}
                </span>
              </div>
              <dl className="text-sm space-y-1 flex-1">
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="truncate">{a.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Coverage</dt>
                  <dd className="line-clamp-2">{a.coverageType ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Submitted</dt>
                  <dd>{formatSubmitted(a.createdAt)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
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
                      onClick={() => mutateStatus(a.id, { status: "approved" }, `${a.fullName} accredited`)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectId(a.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {!readOnly && a.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={update.isPending}
                    onClick={() =>
                      mutateStatus(a.id, { status: "revoked", adminNotes: "Accreditation revoked by admin" }, `${a.fullName} revoked`)
                    }
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto bg-card">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Journalist</th>
                <th className="text-left px-4 py-3">Outlet</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Coverage</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Submitted</th>
                <th className="text-left px-4 py-3">Documents</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.fullName}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                    {a.phone && <div className="text-xs text-muted-foreground">{a.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.outletName}</div>
                    <div className="text-xs text-muted-foreground">{a.outletType ?? a.country ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs max-w-[200px] truncate">
                    {a.coverageType ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {formatSubmitted(a.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {a.pressCardUrl ? (
                      <FileViewLink src={a.pressCardUrl} fileName="press-credential" className="inline-flex items-center gap-1" />
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
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
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
                          onClick={() => mutateStatus(a.id, { status: "approved" }, `${a.fullName} accredited`)}
                        >
                          {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectId(a.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {!readOnly && a.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={update.isPending}
                        onClick={() =>
                          mutateStatus(a.id, { status: "revoked", adminNotes: "Accreditation revoked by admin" }, `${a.fullName} revoked`)
                        }
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" /> Reject media application
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message to applicant</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" rows={4} placeholder="Reason for rejection…" />
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
