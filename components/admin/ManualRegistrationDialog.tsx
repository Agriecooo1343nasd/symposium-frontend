import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTicketCategories, useWalkInRegistration } from "@/hooks/api/useAdmin";
import { useDeskCashPayment } from "@/hooks/api/useDesk";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import type { Currency } from "@/lib/api/dto";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Desk-only: show an option to record an on-site cash payment for the new registration. */
  enableCashPayment?: boolean;
};

export function ManualRegistrationDialog({ open, onOpenChange, enableCashPayment = false }: Props) {
  const symposiumId = useSymposiumId();
  const { categories } = useAdminTicketCategories();
  const walkIn = useWalkInRegistration();
  const cashPayment = useDeskCashPayment();
  const [ticketCategoryId, setTicketCategoryId] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [recordCash, setRecordCash] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId || !ticketCategoryId) return toast.error("Select a pass category");
    if (!form.email.trim()) return toast.error("Email is required");
    try {
      const registration = await walkIn.mutateAsync({
        symposiumId,
        ticketCategoryId,
        currency,
        email: form.email.trim(),
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        attendanceType: "in_person",
      });
      if (enableCashPayment && recordCash) {
        await cashPayment.mutateAsync({ registrationId: registration.id, notes: "On-site cash payment (desk)" });
        toast.success("Walk-in created and cash payment recorded");
      } else {
        toast.success("Walk-in registration created");
      }
      onOpenChange(false);
      setForm({ email: "", firstName: "", lastName: "", phone: "" });
      setRecordCash(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const pending = walkIn.isPending || cashPayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Walk-in registration</DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Creates a walk-in registration. The attendee must already exist or be created separately.
          </p>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Pass category *</Label>
            <Select value={ticketCategoryId} onValueChange={setTicketCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} (${c.priceUsd})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="RWF">RWF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. attendee@company.rw"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="e.g. Jean"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="e.g. Mukamana"
                className="mt-1"
              />
            </div>
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
          {enableCashPayment && (
            <label className="flex items-center gap-2 text-sm rounded-lg border bg-secondary/40 px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recordCash}
                onChange={(e) => setRecordCash(e.target.checked)}
                className="h-4 w-4"
              />
              Record on-site cash payment for this registration
            </label>
          )}
          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={pending}>
              {pending ? "Processing…" : "Create walk-in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
