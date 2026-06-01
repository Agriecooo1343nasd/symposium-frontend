"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, getExhibitorOrgId } from "@/lib/store";
import { toast } from "sonner";


export default function Page() {
  const store = useStore();
  const orgId = getExhibitorOrgId();
  const tier = store.sponsorshipTiers.find((t) => t.tier === store.approvedOrganizations.find((o) => o.id === orgId)?.sponsorshipTier);
  const quota = tier?.staffPasses ?? 4;
  const staff = store.exhibitorStaff.filter((s) => s.orgId === orgId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    if (staff.length >= quota) return toast.error("Staff pass quota reached");
    const token = uid("invite");
    patchStore((s) => ({
      ...s,
      exhibitorStaff: [
        ...s.exhibitorStaff,
        { id: uid("st"), orgId, name, email, role: role || "Staff", status: "Invited", inviteToken: token },
      ],
    }));
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/set-password?token=${token}`;
    toast.success("Invitation sent — staff sets password via link (no registration required)");
    navigator.clipboard.writeText(link);
    setOpen(false);
    setName("");
    setEmail("");
    setRole("");
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Staff passes</h1>
          <p className="text-muted-foreground">
            {staff.length} of {quota} passes assigned. Invited staff activate via email link — no public registration.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-blue text-accent-foreground" disabled={staff.length >= quota}>
              <Plus className="h-4 w-4 mr-1" /> Add staff member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite staff member</DialogTitle>
            </DialogHeader>
            <form onSubmit={invite} className="space-y-3">
              <div>
                <Label>Full name *</Label>
                <Input required placeholder="Staff member name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" required placeholder="staff@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Role</Label>
                <Input placeholder="e.g. Booth Lead, Sales" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">
                They receive a link to set a password and enter as an attendee with exhibitor staff check-in rights.
              </p>
              <DialogFooter>
                <Button type="submit" className="gradient-blue text-accent-foreground">
                  Send invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-2 bg-secondary rounded-sm overflow-hidden mb-6">
        <div className="h-full gradient-blue" style={{ width: `${(staff.length / quota) * 100}%` }} />
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Staff</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Check-in ID</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">{s.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${s.status === "Confirmed" ? "bg-green/15 text-green" : "bg-amber-100 text-amber-800"}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">STAFF-{s.id}</td>
                <td className="px-4 py-3 text-right">
                  {s.inviteToken && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const link = `${window.location.origin}/set-password?token=${s.inviteToken}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Setup link copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {s.status === "Invited" && (
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Reminder sent")}>
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        <Link href="/exhibitor/qr" className="text-accent font-semibold hover:underline">
          View booth QR code →
        </Link>{" "}
        for organization companion check-in at the desk.
      </p>
    </div>
  );
}
