"use client";

import { useState } from "react";
import { UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminUsers, useAuditLogs, useCreateAdminUser, useRoles, useUpdateAdminUser } from "@/hooks/api/useAdmin";
import { userDisplayName } from "@/lib/api/mappers/user";
import type { UserDto } from "@/lib/api/dto";
import { toast } from "sonner";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";

export default function Page() {
  const { activeTab, onTabChange } = useAdminTabNavigation(["users", "invites", "roles", "audit"], "users");
  const { users, isLoading, isError } = useAdminUsers({ limit: 100 });
  const roles = useRoles();
  const audit = useAuditLogs({ limit: 50 });
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: "",
  });

  useAdminCommandAction({ "invite-user": () => setInviteOpen(true) });

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      {
        email: inviteForm.email.trim(),
        password: inviteForm.password,
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        roleId: inviteForm.roleId || undefined,
      },
      {
        onSuccess: () => {
          toast.success("User created");
          setInviteOpen(false);
          setInviteForm({ email: "", password: "", firstName: "", lastName: "", roleId: "" });
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Create failed"),
      },
    );
  };

  const saveEdit = () => {
    if (!editUser) return;
    updateUser.mutate(
      { id: editUser.id, dto: { firstName: editUser.firstName, lastName: editUser.lastName, isActive: editUser.isActive } },
      {
        onSuccess: () => {
          toast.success("User updated");
          setEditUser(null);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Users & roles</h1>
          <p className="text-muted-foreground">{users.length} registered users</p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-3.5 w-3.5 mr-1" /> Create user
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invites">Invitations (mock)</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && <p className="text-sm text-destructive">Could not load users.</p>}
          <div className="rounded-2xl border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Roles</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{userDisplayName(u)}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{(u.roles ?? []).join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${u.isActive ? "bg-green/15 text-green" : "bg-zinc-200"}`}>
                        {u.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditUser({ ...u })}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="mt-6">
          <p className="text-sm text-muted-foreground">Email invite workflow has no API — use Create user with temporary password.</p>
        </TabsContent>

        <TabsContent value="roles" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roles.data ?? []).map((r) => (
            <div key={r.id} className="rounded-2xl bg-card border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue" />
                <div className="font-serif font-bold">{r.name}</div>
              </div>
              <p className="text-xs text-muted-foreground">{r.description ?? "Seeded role"}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="rounded-md border overflow-x-auto bg-card">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Actor</th>
                  <th className="text-left px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {(audit.data?.items ?? []).map((log, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-3 text-xs">{String((log as Record<string, unknown>).action ?? (log as Record<string, unknown>).message ?? "—")}</td>
                    <td className="px-4 py-3 text-xs">{String((log as Record<string, unknown>).actorName ?? (log as Record<string, unknown>).userId ?? "—")}</td>
                    <td className="px-4 py-3 text-xs">{String((log as Record<string, unknown>).createdAt ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(audit.data?.items ?? []).length === 0 && !audit.isLoading && (
              <p className="p-6 text-sm text-muted-foreground text-center">No audit entries.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
          <form onSubmit={sendInvite} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input value={inviteForm.firstName} onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })} className="mt-1" required /></div>
              <div><Label>Last name</Label><Input value={inviteForm.lastName} onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })} className="mt-1" required /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="mt-1" required /></div>
            <div><Label>Password</Label><Input type="password" value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} className="mt-1" required minLength={8} /></div>
            <div>
              <Label>Role</Label>
              <Select value={inviteForm.roleId} onValueChange={(v) => setInviteForm({ ...inviteForm, roleId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {(roles.data ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createUser.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div><Label>First name</Label><Input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} className="mt-1" /></div>
              <div><Label>Last name</Label><Input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} className="mt-1" /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editUser.isActive} onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })} />
                Active account
              </label>
              <DialogFooter><Button onClick={saveEdit}>Save</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
