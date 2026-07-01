import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTicketCategories, useWalkInRegistration } from "@/hooks/api/useAdmin";
import { useSymposiumId } from "@/hooks/api/useSymposium";
import { toast } from "sonner";
import type { Currency } from "@/lib/api/dto";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManualRegistrationDialog({ open, onOpenChange }: Props) {
  const symposiumId = useSymposiumId();
  const { categories } = useAdminTicketCategories();
  const walkIn = useWalkInRegistration();
  const [ticketCategoryId, setTicketCategoryId] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symposiumId || !ticketCategoryId) return toast.error("Select a pass category");
    if (!form.email.trim()) return toast.error("Email is required");
    walkIn.mutate(
      {
        symposiumId,
        ticketCategoryId,
        currency,
        email: form.email.trim(),
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        attendanceType: "in_person",
      },
      {
        onSuccess: () => {
          toast.success("Walk-in registration created");
          onOpenChange(false);
          setForm({ email: "", firstName: "", lastName: "", phone: "" });
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Walk-in failed"),
      },
    );
  };

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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="RWF">RWF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First name</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
          </div>
          <DialogFooter>
            <Button type="submit" className="gradient-blue text-accent-foreground" disabled={walkIn.isPending}>
              Create walk-in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
