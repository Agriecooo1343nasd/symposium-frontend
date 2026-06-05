"use client";

import { useState } from "react";
import { Send, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMAIL_CAMPAIGNS, AUTOMATED_TEMPLATES } from "@/lib/mock-data";
import { useStore } from "@/hooks/use-store";
import { roleLabel } from "@/lib/permissions";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";
import { patchStore } from "@/lib/store";
import { toast } from "sonner";
import type { Role } from "@/lib/mock-data";
import { useAdminCommandAction, useAdminTabNavigation } from "@/hooks/use-admin-command-action";

const SEGMENTS = ["All Attendees", "By Category", "By Country", "Pending Payment", "Checked In", "Speakers", "Exhibitors", "Custom"];
const COMM_TABS = ["email", "invites", "auto", "announce"] as const;

export default function Page() {
  const [auto, setAuto] = useState(AUTOMATED_TEMPLATES);
  const [annOpen, setAnnOpen] = useState(false);
  const store = useStore();
  const { activeTab, onTabChange } = useAdminTabNavigation([...COMM_TABS], "email");

  useAdminCommandAction({
    "new-announcement": () => setAnnOpen(true),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">Send emails, manage invitations, automated triggers, and in-app announcements.</p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="invites">Invitations</TabsTrigger>
          <TabsTrigger value="auto">Automated</TabsTrigger>
          <TabsTrigger value="announce">In-app</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-6">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Email campaign sent"); }} className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif font-bold">Compose email</h2>
            <div><Label>Recipient segment</Label><Select defaultValue={SEGMENTS[0]}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Subject</Label><Input required className="mt-1" /></div>
            <div><Label>Body</Label><Textarea rows={8} required className="mt-1" /></div>
            <div className="flex gap-2"><Button type="button" variant="outline" size="sm">Preview</Button><Button type="submit" className="gradient-blue text-accent-foreground" size="sm"><Send className="h-3.5 w-3.5 mr-1" /> Send</Button></div>
          </form>
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">Sent campaigns</h2>
            <div className="space-y-3">
              {EMAIL_CAMPAIGNS.map((c) => (
                <div key={c.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="font-medium text-sm">{c.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.segment} · {c.sent} · {c.recipients} recipients · {c.openRate} opens</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="mt-6 max-w-2xl space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Pending invitations including moderators. Manage full user invites in Users &amp; Roles.
          </p>
          {store.invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invitations.</p>
          ) : (
            store.invites.map((i) => (
              <div key={i.id} className="rounded-xl bg-card border border-border p-4 flex justify-between gap-3">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.email} · {roleLabel(i.role)} · {i.status}
                  </div>
                </div>
                {i.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => toast.success("Invitation resent")}>
                    Resend
                  </Button>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="auto" className="mt-6 space-y-3 max-w-2xl">
          {auto.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between">
              <div><div className="font-medium">{t.label}</div><div className="text-xs text-muted-foreground">Triggered automatically by system events.</div></div>
              <div className="flex items-center gap-3"><Button size="sm" variant="ghost">Edit template</Button><Switch checked={t.enabled} onCheckedChange={(c) => setAuto(auto.map((x) => x.id === t.id ? { ...x, enabled: c } : x))} /></div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="announce" className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button className="gradient-blue text-accent-foreground" onClick={() => setAnnOpen(true)}>
              <Bell className="h-4 w-4 mr-1" /> New announcement
            </Button>
          </div>
          <AnnouncementDialog open={annOpen} onOpenChange={setAnnOpen} />
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-serif font-bold mb-4">Active announcements</h2>
            {store.announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No in-app announcements yet.</p>
            ) : (
              <ul className="space-y-3">
                {store.announcements.map((a) => (
                  <li key={a.id} className="border-b border-border last:border-0 pb-3 last:pb-0 flex justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.audiences.map((x) => (x === "all" ? "Everyone" : roleLabel(x as Role))).join(", ")} · {a.createdAt.slice(0, 10)} · {a.createdBy}
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{a.body}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        patchStore((s) => ({ ...s, announcements: s.announcements.filter((x) => x.id !== a.id) }));
                        toast.info("Announcement removed");
                      }}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
