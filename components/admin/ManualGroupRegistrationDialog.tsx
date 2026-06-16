"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { getCountries } from "@/lib/platform-settings";
import { getSession } from "@/lib/auth";
import { createGroupRegistration, type GroupMemberInput } from "@/lib/group-registration";
import { GroupMembersFields } from "@/components/group/GroupMembersFields";
import { GroupPricingSummary } from "@/components/group/GroupPricingSummary";
import type { TicketPlan } from "@/lib/store";
import { toast } from "sonner";
import { DEFAULT_GROUP_REGISTRATION_SETTINGS } from "@/lib/store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManualGroupRegistrationDialog({ open, onOpenChange }: Props) {
  const store = useStore();
  const countries = getCountries();
  const groupSettings = {
    ...DEFAULT_GROUP_REGISTRATION_SETTINGS,
    ...store.platformSettings.groupRegistration,
  };
  const [picked, setPicked] = useState<TicketPlan | null>(null);
  const [groupSize, setGroupSize] = useState(groupSettings.minSize);
  const [groupMembers, setGroupMembers] = useState<GroupMemberInput[]>([]);
  const [status, setStatus] = useState<"comp" | "paid" | "pending">("comp");
  const [form, setForm] = useState({
    fullName: "",
    title: "",
    org: "",
    country: countries[0] ?? "Rwanda",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!open) return;
    setGroupSize(groupSettings.minSize);
    setGroupMembers(
      Array.from({ length: groupSettings.minSize - 1 }, () => ({ name: "", email: "", title: "", phone: "" })),
    );
  }, [open, groupSettings.minSize]);

  const reset = () => {
    setPicked(null);
    setForm({ fullName: "", title: "", org: "", country: countries[0] ?? "Rwanda", email: "", phone: "" });
    setStatus("comp");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return toast.error("Select a pass category");
    if (!form.fullName.trim() || !form.email.trim() || !form.org.trim()) {
      return toast.error("Representative name, email, and organization required");
    }

    const admin = getSession()?.name ?? "Admin";
    const result = createGroupRegistration({
      plan: picked,
      representative: {
        name: form.fullName,
        email: form.email,
        title: form.title,
        org: form.org,
        country: form.country,
        phone: form.phone,
        hear: "Admin manual group entry",
      },
      additionalMembers: groupMembers.slice(0, groupSize - 1),
      paymentMethod: status === "comp" ? "manual-comp" : "manual",
      status,
      actorName: admin,
    });

    if (!result.ok) return toast.error(result.error);

    toast.success(`Group ${result.group.code} created · ${result.group.memberCount} seats`);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add group registration</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Creates a delegation with one representative and member passes. Group volume discount is applied automatically.
          </p>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Pass category *</Label>
              <Select
                value={picked?.id ?? ""}
                onValueChange={(id) => setPicked(store.ticketPlans.find((t) => t.id === id && !t.isMediaAccreditation) ?? null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category for all members" />
                </SelectTrigger>
                <SelectContent>
                  {store.ticketPlans
                    .filter((t) => !t.isMediaAccreditation)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — ${t.usd}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comp">Comp (no payment)</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Representative name *</Label>
              <Input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Representative email *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Organization *</Label>
              <Input
                required
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
          </div>

          <GroupMembersFields
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
            members={groupMembers}
            onMembersChange={setGroupMembers}
            representativeEmail={form.email}
          />

          {picked && (
            <div className="rounded-xl border bg-secondary/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Pricing preview (USD)
              </div>
              <GroupPricingSummary
                memberCount={groupSize}
                pricePerSeatUsd={picked.usd}
                currency="USD"
                exchangeRate={store.platformSettings.exchangeRate}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">
              Create group registration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
