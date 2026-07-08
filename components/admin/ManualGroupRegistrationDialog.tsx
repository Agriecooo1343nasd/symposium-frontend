"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { getCountries } from "@/lib/platform-settings";
import { useAdminTicketCategories, useAdminCreateGroup } from "@/hooks/api/useAdmin";
import { useDeskCreateGroup } from "@/hooks/api/useDesk";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { GroupMembersFields } from "@/components/group/GroupMembersFields";
import { GroupPricingSummary } from "@/components/group/GroupPricingSummary";
import type { GroupMemberInput } from "@/lib/group-registration";
import type { AdminGroupDelegateDto, TicketCategoryDto } from "@/lib/api/dto";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import { getServerGroupRegistrationSettings, GROUP_REGISTRATION_POLICY } from "@/lib/group-registration-policy";

const MIN_GROUP_TOTAL = GROUP_REGISTRATION_POLICY.minSize;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Use the desk endpoint instead of admin (same shape, different RBAC path). */
  desk?: boolean;
};

export function ManualGroupRegistrationDialog({ open, onOpenChange, desk = false }: Props) {
  const store = useStore();
  const symposiumId = useSymposiumId();
  const countries = getCountries();
  const { categories } = useAdminTicketCategories();
  const adminCreate = useAdminCreateGroup();
  const deskCreate = useDeskCreateGroup();
  const createGroup = desk ? deskCreate : adminCreate;

  const groupSettings = getServerGroupRegistrationSettings();
  const minSize = Math.max(GROUP_REGISTRATION_POLICY.minSize, groupSettings.minSize);

  const [picked, setPicked] = useState<TicketCategoryDto | null>(null);
  const [groupSize, setGroupSize] = useState(minSize);
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
    setGroupSize(minSize);
    setGroupMembers(
      Array.from({ length: minSize - 1 }, () => ({ name: "", email: "", title: "", phone: "" })),
    );
  }, [open, minSize]);

  const reset = () => {
    setPicked(null);
    setForm({ fullName: "", title: "", org: "", country: countries[0] ?? "Rwanda", email: "", phone: "" });
    setStatus("comp");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createGroup.isPending) return;
    if (!symposiumId) return toast.error("Symposium not loaded yet");
    if (!picked) return toast.error("Select a pass category");
    if (!form.fullName.trim() || !form.email.trim() || !form.org.trim()) {
      return toast.error("Representative name, email, and organization required");
    }

    const delegates: AdminGroupDelegateDto[] = groupMembers
      .slice(0, groupSize - 1)
      .map((m) => ({
        fullName: m.name.trim(),
        email: m.email.trim(),
        jobTitle: m.title?.trim() || undefined,
        phone: m.phone?.trim() || undefined,
      }));

    if (delegates.some((d) => !d.fullName || !d.email)) {
      return toast.error("Every delegate needs a name and email");
    }

    // Representative counts as a seat; backend requires >= 5 total.
    if (delegates.length + 1 < MIN_GROUP_TOTAL) {
      return toast.error(`Group registration requires at least ${MIN_GROUP_TOTAL} delegates (including the representative)`);
    }

    try {
      const group = await createGroup.mutateAsync({
        symposiumId,
        ticketCategoryId: picked.id,
        currency: "USD",
        organizationName: form.org.trim(),
        country: form.country,
        representativeName: form.fullName.trim(),
        representativeEmail: form.email.trim(),
        representativePhone: form.phone.trim() || undefined,
        paymentStatus: status,
        delegates,
      });
      toast.success(`Group ${group.groupCode} created · ${group.seatCount} seats`);
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const activeCategories = categories.filter((t) => t.isActive);

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
                onValueChange={(id) => setPicked(activeCategories.find((t) => t.id === id) ?? null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category for all members" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — ${t.priceUsd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment status" />
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
                placeholder="e.g. Jean Mukamana"
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
                placeholder="e.g. contact@organization.rw"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Organization *</Label>
              <Input
                required
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                placeholder="e.g. Green Harvest Ltd"
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
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +250 788 000 000"
                className="mt-1"
              />
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
                pricePerSeatUsd={picked.priceUsd}
                currency="USD"
                exchangeRate={store.platformSettings.exchangeRate}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createGroup.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={createGroup.isPending}>
              {createGroup.isPending ? "Creating…" : "Create group registration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
