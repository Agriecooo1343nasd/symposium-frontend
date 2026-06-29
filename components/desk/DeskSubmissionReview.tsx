"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { SubmissionDto } from "@/lib/api/dto";
import { submissionPrimaryAuthor, submissionReviewStatus } from "@/lib/api/mappers/desk";
import { useSubmissionDecision } from "@/hooks/api/useDesk";
import { FileViewLink } from "@/components/file-viewer";

export function DeskSubmissionReviewList({
  submissions,
  readOnly = false,
}: {
  submissions: SubmissionDto[];
  readOnly?: boolean;
}) {
  const decision = useSubmissionDecision();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const approve = (sub: SubmissionDto) => {
    decision.mutate(
      { id: sub.id, dto: { decision: "accept" } },
      {
        onSuccess: () => toast.success("Submission accepted"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Decision failed"),
      },
    );
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    decision.mutate(
      { id: rejectId, dto: { decision: "reject", comments: message.trim() } },
      {
        onSuccess: () => {
          toast.info("Submission rejected");
          setRejectId(null);
          setMessage("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Decision failed"),
      },
    );
  };

  if (submissions.length === 0) {
    return <p className="text-sm text-muted-foreground">No submissions found.</p>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const uiStatus = submissionReviewStatus(sub.status);
        const author = submissionPrimaryAuthor(sub);
        return (
          <div key={sub.id} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-serif font-bold">{author}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      uiStatus === "approved"
                        ? "bg-green/15 text-green"
                        : uiStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {sub.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">{sub.presentationType}</span>
                </div>
                <div className="font-medium mt-2">{sub.title}</div>
                <p className="text-sm mt-1 line-clamp-3">{sub.abstract}</p>
                {sub.fileUrl && (
                  <div className="mt-2">
                    <FileViewLink src={sub.fileUrl} fileName="abstract.pdf" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/desk/applications/speaker/${sub.id}`}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Link>
                </Button>
                {uiStatus === "pending" && !readOnly && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gradient-blue text-accent-foreground"
                      disabled={decision.isPending}
                      onClick={() => approve(sub)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectId(sub.id)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject submission</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message to applicant *</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button onClick={reject} disabled={!message.trim() || decision.isPending}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
