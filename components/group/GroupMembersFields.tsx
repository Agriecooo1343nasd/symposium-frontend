"use client";

import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServerGroupRegistrationSettings } from "@/lib/group-registration-policy";
import type { GroupMemberInput } from "@/lib/group-registration";

type Props = {
  groupSize: number;
  onGroupSizeChange: (n: number) => void;
  members: GroupMemberInput[];
  onMembersChange: (members: GroupMemberInput[]) => void;
  representativeEmail: string;
};

export function GroupMembersFields({
  groupSize,
  onGroupSizeChange,
  members,
  onMembersChange,
  representativeEmail,
}: Props) {
  const settings = getServerGroupRegistrationSettings();
  const additionalCount = Math.max(0, groupSize - 1);

  const syncMembers = (size: number) => {
    const next: GroupMemberInput[] = [];
    for (let i = 0; i < size - 1; i++) {
      next.push(members[i] ?? { name: "", email: "", title: "", phone: "" });
    }
    onMembersChange(next);
  };

  const setSize = (n: number) => {
    const clamped = Math.min(settings.maxSize, Math.max(settings.minSize, n));
    onGroupSizeChange(clamped);
    syncMembers(clamped);
  };

  const updateMember = (index: number, patch: Partial<GroupMemberInput>) => {
    const next = [...members];
    next[index] = { ...next[index], ...patch };
    onMembersChange(next);
  };

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Users className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="font-serif font-bold">Group registration (FR-2.3)</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            You are the representative — one invoice covers the whole delegation. Each member receives their own e-ticket
            QR. Discounts: {settings.minSize}–9 attendees ({settings.tier5to9Percent}% off), 10+ (
            {settings.tier10PlusPercent}% off).
          </p>
        </div>
      </div>

      <div>
        <Label>Total delegates (including you) *</Label>
        <Input
          type="number"
          min={settings.minSize}
          max={settings.maxSize}
          value={groupSize}
          onChange={(e) => setSize(parseInt(e.target.value, 10) || settings.minSize)}
          placeholder={`e.g. ${settings.minSize}`}
          className="mt-1 max-w-[120px]"
        />
      </div>

      {additionalCount > 0 && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Other delegates ({additionalCount})
          </Label>
          {Array.from({ length: additionalCount }).map((_, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-3 rounded-lg border bg-card p-3">
              <div>
                <Label className="text-xs">Full name *</Label>
                <Input
                  required
                  value={members[i]?.name ?? ""}
                  onChange={(e) => updateMember(i, { name: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. Pierre Ndayisaba"
                />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input
                  required
                  type="email"
                  value={members[i]?.email ?? ""}
                  onChange={(e) => updateMember(i, { email: e.target.value })}
                  className="mt-1"
                  placeholder="name@organization.org"
                />
              </div>
              <div>
                <Label className="text-xs">Job title</Label>
                <Input
                  value={members[i]?.title ?? ""}
                  onChange={(e) => updateMember(i, { title: e.target.value })}
                  placeholder="e.g. Programme Director"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={members[i]?.phone ?? ""}
                  onChange={(e) => updateMember(i, { phone: e.target.value })}
                  placeholder="e.g. +250 788 000 000"
                  className="mt-1"
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Representative email ({representativeEmail}) is excluded. Members can sign in with their own email to view
            their ticket.
          </p>
        </div>
      )}
    </div>
  );
}
