import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { patchStore, uid, appendAudit, type TicketPlan } from "@/lib/store";
import { getCountries } from "@/lib/platform-settings";
import { getSession } from "@/lib/auth";
import { SUB_THEMES } from "@/lib/mock-data";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManualRegistrationDialog({ open, onOpenChange }: Props) {
  const store = useStore();
  const countries = getCountries();
  const [picked, setPicked] = useState<TicketPlan | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    title: "",
    org: "",
    country: countries[0] ?? "Rwanda",
    email: "",
    phone: "",
    dietary: "",
    access: "",
    hear: "Admin manual entry",
    linkedin: "",
    interests: [] as string[],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return toast.error("Select a pass category");
    if (!form.fullName || !form.email || !form.org) return toast.error("Name, email, and organization required");

    const regId = uid("r");
    const admin = getSession()?.name ?? "Admin";
    const needsVerify = picked.requiresVerification;

    patchStore((s) => {
      const reg = {
        id: regId,
        name: form.fullName,
        email: form.email,
        country: form.country,
        category: picked.name,
        categoryId: picked.id,
        amountUsd: 0,
        status: "comp" as const,
        verificationStatus: needsVerify ? ("pending" as const) : ("none" as const),
        createdAt: new Date().toISOString().slice(0, 10),
        certificateGranted: false,
        details: {
          ticketId: `NAS26-${regId.replace(/^r/, "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          title: form.title,
          org: form.org,
          phone: form.phone,
          dietary: form.dietary,
          access: form.access,
          hear: form.hear,
          linkedin: form.linkedin,
          interests: form.interests,
          paymentMethod: "manual",
        },
      };
      let documentVerifications = s.documentVerifications;
      if (needsVerify) {
        documentVerifications = [
          ...documentVerifications,
          {
            id: uid("dv"),
            registrationId: regId,
            registrantName: form.fullName,
            registrantEmail: form.email,
            type: picked.requiresVerification!,
            fileName: "pending-upload",
            status: "pending" as const,
            submittedAt: new Date().toISOString().slice(0, 10),
          },
        ];
      }
      return {
        ...s,
        registrations: [reg, ...s.registrations],
        documentVerifications,
      };
    });

    appendAudit(admin, "Manual registration", form.email);
    toast.success(`${form.fullName} registered (comp pass)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <p className="text-xs text-muted-foreground">Same fields as public registration step 1 — no payment; comp pass issued.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Pass category *</Label>
              <Select
                value={picked?.id ?? ""}
                onValueChange={(id: string) => setPicked(store.ticketPlans.find((t) => t.id === id) || null)}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {store.ticketPlans.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Full name *</Label>
              <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Organization *</Label>
              <Input required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v: string) => setForm({ ...form, country: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Dietary</Label>
              <Input value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Accessibility</Label>
              <Input value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUB_THEMES.map((t) => (
                <label key={t} className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.interests.includes(t)}
                    onChange={() =>
                      setForm({
                        ...form,
                        interests: form.interests.includes(t)
                          ? form.interests.filter((x) => x !== t)
                          : [...form.interests, t],
                      })
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-blue text-accent-foreground">Create registration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
