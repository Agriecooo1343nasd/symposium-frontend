"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
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
import { FileViewButton } from "@/components/file-viewer";
import { toast } from "sonner";
import {
  usePendingVerifications,
  useVerifyRegistration,
} from "@/hooks/api/useDesk";
import type { PendingVerificationDto } from "@/lib/api/dto";

export function VerificationReviewList({
  readOnly = false,
  highlightId,
}: {
  readOnly?: boolean;
  highlightId?: string;
}) {
  const { items, isLoading, isError, error } = usePendingVerifications();
  const verify = useVerifyRegistration();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const approve = (item: PendingVerificationDto) => {
    verify.mutate(
      { id: item.id, dto: { action: "approve" } },
      {
        onSuccess: () => toast.success("Verification approved"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Approval failed"),
      },
    );
  };

  const reject = () => {
    if (!rejectId || !message.trim()) return;
    verify.mutate(
      { id: rejectId, dto: { action: "reject", notes: message.trim() } },
      {
        onSuccess: () => {
          toast.info("Verification rejected");
          setRejectId(null);
          setMessage("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Rejection failed"),
      },
    );
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading verifications…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load verifications"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No verification requests.</p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          id={`verify-${item.id}`}
          className={`rounded-2xl bg-card border p-5 flex flex-wrap gap-4 ${
            highlightId === item.id ? "border-accent ring-2 ring-accent/30" : "border-border"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="font-serif font-bold">{item.userName ?? "Delegate"}</div>
            <div className="text-sm text-muted-foreground">{item.userEmail ?? item.userId}</div>
            <div className="text-xs mt-1 text-muted-foreground">
              Registration · {item.status.replace(/_/g, " ")}
            </div>
            {item.verificationDocUrl && (
              <FileViewButton
                src={item.verificationDocUrl}
                fileName="verification-document"
                label="View verification document"
                className="mt-2"
                variant="outline"
              />
            )}
            <span className="inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              pending
            </span>
            <div className="mt-2">
              <Link
                href={`/desk/registrations/${item.id}`}
                className="text-xs text-accent hover:underline"
              >
                View registration
              </Link>
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-2 items-start">
              <Button
                size="sm"
                className="gradient-blue text-accent-foreground"
                disabled={verify.isPending}
                onClick={() => approve(item)}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejectId(item.id)}>
                <X className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject verification</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Message *</Label>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button onClick={reject} disabled={!message.trim() || verify.isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
