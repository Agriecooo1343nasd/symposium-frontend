"use client";

import { useState } from "react";
import { UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore } from "@/hooks/use-store";
import { patchStore, appendAudit, uid } from "@/lib/store";
import { ALL_ROLES, roleLabel } from "@/lib/permissions";
import type { Role } from "@/lib/mock-data";
import type { PlatformUser, UserInvite } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";


export default function Page() {
  const store = useStore();
  const session = getSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["users", "invites", "roles", "audit"];
  const activeTab = validTabs.includes(tabParam ?? "") ? tabParam! : "users";
  const [inviteOpen, setInviteOpen] = useState(false);

  useAdminCommandAction({
    "invite-user": () => setInviteOpen(true),
  });
  const [editUser, setEditUser] = useState<PlatformUser | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "moderator" as Role });

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const invite: UserInvite = {
      id: uid("inv"),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      sentAt: new Date().toISOString(),
      status: "pending",
    };
    patchStore((s) => ({
      ...s,
      invites: [invite, ...s.invites],
      users: [
        ...s.users,
        {
          id: uid("u"),
          name: inviteForm.name,
          email: inviteForm.email,
          role: inviteForm.role,
          status: "invited",
          lastLogin: "Never",
        },
      ],
    }));
    appendAudit(session?.name ?? "Admin", "Invited user", `${inviteForm.email} as ${roleLabel(inviteForm.role)}`);
    toast.success("Invitation sent");
    setInviteOpen(false);
    setInviteForm({ name: "", email: "", role: "moderator" });
  };

  const toggleSuspend = (user: PlatformUser) => {
    const next = user.status === "suspended" ? "active" : "suspended";
    patchStore((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === user.id ? { ...u, status: next } : u)),
    }));
    appendAudit(session?.name ?? "Admin", next === "suspended" ? "Suspended user" : "Reactivated user", user.email);
    toast.success(next === "suspended" ? "User suspended" : "User reactivated");
  };

  const saveEdit = () => {
    if (!editUser) return;
    patchStore((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === editUser.id ? editUser : u)),
    }));
    appendAudit(session?.name ?? "Admin", "Updated user role", `${editUser.email} → ${roleLabel(editUser.role)}`);
    toast.success("User updated");
    setEditUser(null);
  };

  const revokeInvite = (id: string) => {
    patchStore((s) => ({
      ...s,
      invites: s.invites.map((i) => (i.id === id ? { ...i, status: "revoked" as const } : i)),
    }));
    toast.info("Invitation revoked");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Users & roles</h1>
          <p className="text-muted-foreground">
            {store.users.length} users · {store.invites.filter((i) => i.status === "pending").length} pending invites
          </p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite user
        </Button>
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invites">Invitations</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Last login</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {store.users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-blue/15 text-blue font-bold uppercase text-[10px]">
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          u.status === "active"
                            ? "bg-green/15 text-green"
                            : u.status === "invited"
                              ? "bg-blue/15 text-blue"
                              : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditUser({ ...u })}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleSuspend(u)}>
                        {u.status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="mt-6 space-y-3">
          {store.invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            store.invites.map((i) => (
              <div key={i.id} className="rounded-xl bg-card border border-border p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.email} · {roleLabel(i.role)} · {new Date(i.sentAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary">{i.status}</span>
                  {i.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => toast.success("Invitation resent")}>
                        Resend
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => revokeInvite(i.id)}>
                        Revoke
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ROLES.map((r) => (
            <div key={r} className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue" />
                <div className="font-serif font-bold">{roleLabel(r)}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {r === "admin" && "Full platform access including desk and live event audit."}
                {r === "registration_desk" && "Registrations, document verification, speaker application review."}
                {r === "moderator" && "Run of show, Zoom links, remote queue, session recordings."}
                {r === "attendee" && "Dashboard, registration, apply to speak or exhibit."}
                {r === "exhibitor" && "Booth, leads, staff passes, sponsorship assets."}
                {r === "speaker" && "Sessions, materials, profile after application approval."}
              </p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="mt-6 space-y-2">
          {store.auditLog.map((a) => (
            <div key={a.id} className="rounded-xl bg-card border border-border p-4 text-sm flex justify-between gap-2">
              <div>
                <span className="font-medium">{a.who}</span> · <span className="text-muted-foreground">{a.action}</span> ·{" "}
                <span className="font-mono text-xs">{a.target}</span>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">{a.at}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <form onSubmit={sendInvite} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input required value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v as Role })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className="gradient-blue text-accent-foreground">
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div>
                <Label>Role</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v as Role })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={saveEdit} className="gradient-blue text-accent-foreground">
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
