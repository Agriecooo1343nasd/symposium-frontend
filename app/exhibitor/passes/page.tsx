"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateExhibitorStaffPass,
  useExhibitorProfile,
  useExhibitorStaffPasses,
  useRemoveExhibitorStaffPass,
} from "@/hooks/api/useExhibitor";
import { staffPassQuota } from "@/lib/exhibitor/participation";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function Page() {
  const { profile } = useExhibitorProfile();
  const { passes, isLoading } = useExhibitorStaffPasses();
  const createPass = useCreateExhibitorStaffPass();
  const removePass = useRemoveExhibitorStaffPass();
  const quota = staffPassQuota(profile);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passes.length >= quota) return toast.error("Staff pass quota reached");
    try {
      await createPass.mutateAsync({ holderName: name.trim(), email: email.trim() });
      toast.success("Staff pass allocated");
      setOpen(false);
      setName("");
      setEmail("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const revoke = async (id: string) => {
    try {
      await removePass.mutateAsync(id);
      toast.info("Staff pass revoked");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Staff passes</h1>
          <p className="text-muted-foreground">
            {passes.length} of {quota} passes allocated.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-accent-foreground" disabled={passes.length >= quota}>
              <Plus className="h-4 w-4 mr-1" /> Add staff member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Allocate staff pass</DialogTitle>
            </DialogHeader>
            <form onSubmit={invite} className="space-y-3">
              <div>
                <Label>Full name *</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gradient-blue text-accent-foreground" disabled={createPass.isPending}>
                  {createPass.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Allocate pass"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-2 bg-secondary rounded-sm overflow-hidden mb-6">
        <div className="h-full gradient-blue" style={{ width: `${quota ? (passes.length / quota) * 100 : 0}%` }} />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Staff</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Allocated</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {passes.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.holderName}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => void revoke(s.id)} disabled={removePass.isPending}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {passes.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No staff passes allocated yet.</p>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-4">
        <Link href="/exhibitor/qr" className="text-accent font-semibold hover:underline">
          View booth QR code →
        </Link>
      </p>
    </div>
  );
}
