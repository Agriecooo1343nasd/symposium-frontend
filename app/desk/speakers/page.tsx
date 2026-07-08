"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, MailCheck, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSpeakerFormDialog } from "@/components/admin/AdminSpeakerFormDialog";
import { useAdminSpeakers, useDeleteSpeaker } from "@/hooks/api/useAdmin";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import { useSearchParams } from "next/navigation";
import type { SpeakerDto } from "@/lib/api/dto";
import { speakerInitials, speakerPhotoSrc } from "@/lib/utils";
import { toast } from "sonner";

export default function DeskSpeakersPage() {
  const { speakers, isLoading, isError } = useAdminSpeakers({ limit: 100 });
  const remove = useDeleteSpeaker();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SpeakerDto | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Speakers</h1>
          <p className="text-muted-foreground">
            Onboard speakers with portal access — creates profile, user account, complimentary registration, and invitation email.
          </p>
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add speaker
        </Button>
      </div>

      <AdminSpeakerFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEdit(null);
        }}
        speaker={edit}
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Directory ({speakers.length})</TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <Link href="/desk/applications">Pending applications</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && (
            <p className="text-sm text-destructive">
              Could not load speakers — your account may need speakers.manage permission.
            </p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakers.map((s) => {
              const photo = speakerPhotoSrc(s.photoUrl);
              return (
                <div key={s.id} className="rounded-2xl bg-card border border-border p-5">
                  <div className="flex items-start gap-3">
                    {photo ? (
                      <img src={photo} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-navy/90 to-navy/60 text-white flex items-center justify-center text-xs font-bold">
                        {speakerInitials(s.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.organization}</div>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase">
                        {s.userId ? (
                          <>
                            <MailCheck className="h-3 w-3 text-green" />
                            <span className="text-green">Portal linked</span>
                          </>
                        ) : (
                          <>
                            <MailWarning className="h-3 w-3 text-amber-600" />
                            <span className="text-amber-700 dark:text-amber-300">Profile only</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => { setEdit(s); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(s.id, {
                          onSuccess: () => toast.success("Removed"),
                          onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {!isLoading && speakers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center border border-dashed rounded-2xl p-8">
              No speakers yet — add one to send a portal invitation.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
