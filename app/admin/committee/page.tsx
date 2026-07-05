"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAdminCommandAction } from "@/hooks/use-admin-command-action";
import {
  useCommitteeMembers,
  useDeleteCommitteeMember,
  useUpsertCommitteeMember,
} from "@/hooks/api/useEngage";
import { useUploadFile } from "@/hooks/api/useFiles";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { apiErrorMessage } from "@/lib/api/client";
import type { CommitteeMemberDto, UpsertCommitteeMemberDto } from "@/lib/api/dto";

type Draft = {
  id?: string;
  name: string;
  role: string;
  organization: string;
  photoUrl: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  role: "",
  organization: "",
  photoUrl: "",
});

function toDraft(member: CommitteeMemberDto): Draft {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    organization: member.organization ?? "",
    photoUrl: member.photoUrl ?? "",
  };
}

export default function Page() {
  const symposiumId = useSymposiumId();
  const { members, isLoading, isError } = useCommitteeMembers();
  const upsert = useUpsertCommitteeMember();
  const removeMember = useDeleteCommitteeMember();
  const uploadFile = useUploadFile();
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));

  const clearForm = () => setDraft(emptyDraft());

  useAdminCommandAction({
    "new-member": clearForm,
  });

  const selectMember = (member: CommitteeMemberDto) => {
    setDraft(toDraft(member));
  };

  const handlePhotoFile = async (file: File) => {
    try {
      const res = await uploadFile.mutateAsync({ file, type: "avatar" });
      setDraft((d) => ({ ...d, photoUrl: res.url }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const save = () => {
    if (!symposiumId) return toast.error("Symposium not loaded");
    if (!draft.name.trim()) return toast.error("Name is required");
    if (!draft.role.trim()) return toast.error("Role is required");

    const dto: UpsertCommitteeMemberDto = {
      symposiumId,
      name: draft.name.trim(),
      role: draft.role.trim(),
      organization: draft.organization.trim() || undefined,
      photoUrl: draft.photoUrl.trim() || undefined,
    };

    upsert.mutate(
      { id: draft.id, dto },
      {
        onSuccess: () => {
          toast.success(draft.id ? "Member updated" : "Member added");
          clearForm();
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      },
    );
  };

  const remove = (id: string) => {
    removeMember.mutate(id, {
      onSuccess: () => {
        if (draft.id === id) clearForm();
        toast.info("Member removed");
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading committee members…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground py-6">
        Could not load committee members. Ensure you are signed in as admin with CMS permissions.
      </p>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-10rem)]">
      <div className="xl:w-[340px] shrink-0 space-y-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Organizing committee</h1>
         
        </div>
        <Button size="sm" className="gradient-blue text-accent-foreground w-full" onClick={clearForm}>
          <Plus className="h-4 w-4 mr-1" /> New member
        </Button>
        <div className="rounded-xl border bg-card divide-y overflow-y-auto max-h-[50vh] xl:max-h-[calc(100vh-14rem)]">
          {sorted.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No members yet.</p>
          ) : (
            sorted.map((c) => (
              <div
                key={c.id}
                className={`p-3 flex gap-3 cursor-pointer hover:bg-secondary/40 ${draft.id === c.id ? "bg-secondary/60" : ""}`}
                onClick={() => selectMember(c)}
              >
                <img
                  src={c.photoUrl ?? `https://i.pravatar.cc/400?u=${encodeURIComponent(c.name)}`}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover shrink-0 border"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                  <div className="text-xs text-accent truncate">{c.role}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{c.organization}</div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-8 w-8"
                  disabled={removeMember.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(c.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 rounded-2xl border bg-card p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h2 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          {draft.id ? "Edit member" : "Add committee member"}
        </h2>

        <div className="grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" /> Profile photo
            </Label>
            <div className="aspect-square max-w-[200px] rounded-2xl border bg-secondary/30 overflow-hidden flex items-center justify-center">
              {draft.photoUrl ? (
                <img src={draft.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground px-4 text-center">Upload or paste URL</span>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              disabled={uploadFile.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhotoFile(file);
              }}
            />
            <Input
              value={draft.photoUrl}
              onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value })}
              placeholder="Image URL"
              className="text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 content-start">
            <div className="sm:col-span-2">
              <Label>Full name *</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-1"
                placeholder="Dr. Jane Doe"
              />
            </div>
            <div>
              <Label>Role on committee *</Label>
              <Input
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="mt-1"
                placeholder="Programme Lead"
              />
            </div>
            <div>
              <Label>Organization</Label>
              <Input
                value={draft.organization}
                onChange={(e) => setDraft({ ...draft, organization: e.target.value })}
                className="mt-1"
                placeholder="MINAGRI"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Preview (About page card)</p>
          <div className="rounded-2xl border p-6 max-w-sm bg-secondary/20">
            {draft.photoUrl && (
              <img src={draft.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover mb-3 border" />
            )}
            <div className="font-serif font-bold">{draft.name || "Member name"}</div>
            <div className="text-sm text-accent font-medium">{draft.role || "Role"}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{draft.organization || "Organization"}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            onClick={save}
            disabled={upsert.isPending}
            className="gradient-blue text-accent-foreground"
          >
            {upsert.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…
              </>
            ) : draft.id ? (
              "Update member"
            ) : (
              "Add member"
            )}
          </Button>
          <Button variant="outline" onClick={clearForm}>
            Clear form
          </Button>
        </div>
      </div>
    </div>
  );
}
