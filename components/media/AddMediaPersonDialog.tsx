"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Newspaper, Plus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountries } from "@/lib/platform-settings";
import { MEDIA_PRESS_TYPE_LABELS } from "@/lib/media-registration";
import type { MediaPressType } from "@/lib/store";
import { useCreateMediaAccreditationAdmin } from "@/hooks/api/useMediaAccreditation";
import { useUploadFile } from "@/hooks/api/useFiles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in admin notes / audit context */
  addedBy?: "admin" | "desk";
};

const steps = ["Journalist", "Outlet", "Documents & options"];

const emptyForm = (countries: string[]) => ({
  fullName: "",
  email: "",
  phone: "",
  country: countries[0] ?? "Rwanda",
  jobTitle: "",
  pressName: "",
  pressType: "digital" as MediaPressType,
  pressWebsite: "",
  pressCountry: countries[0] ?? "Rwanda",
  editorName: "",
  editorEmail: "",
  coverageBrief: "",
  socialHandle: "",
  autoApprove: true,
  sendWelcomeEmail: true,
  adminNotes: "",
});

export function AddMediaPersonDialog({ open, onOpenChange, addedBy = "admin" }: Props) {
  const countries = getCountries();
  const create = useCreateMediaAccreditationAdmin();
  const uploadFile = useUploadFile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => emptyForm(countries));
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setStep(0);
    setForm(emptyForm(countries));
    setCredentialFile(null);
    setLetterFile(null);
    setAssignmentFile(null);
  };

  const canStep0 = form.fullName.trim() && form.email.trim() && form.phone.trim() && form.country;
  const canStep1 =
    form.jobTitle.trim() && form.pressName.trim() && form.pressCountry && form.coverageBrief.trim();

  const uploadOptional = async (file: File | null) => {
    if (!file) return undefined;
    const res = await uploadFile.mutateAsync({ file, type: "verification_doc" });
    return res.url;
  };

  const submit = async () => {
    try {
      setUploading(true);
      const [pressCardUrl, letterUrl, assignmentUrl] = await Promise.all([
        uploadOptional(credentialFile),
        uploadOptional(letterFile),
        uploadOptional(assignmentFile),
      ]);

      const result = await create.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        jobTitle: form.jobTitle.trim(),
        outletName: form.pressName.trim(),
        outletType: MEDIA_PRESS_TYPE_LABELS[form.pressType] ?? form.pressType,
        outletWebsite: form.pressWebsite.trim() || undefined,
        outletCountry: form.pressCountry,
        editorName: form.editorName.trim() || undefined,
        editorEmail: form.editorEmail.trim() || undefined,
        coverageType: form.coverageBrief.trim(),
        equipmentNeeds: form.socialHandle.trim() || undefined,
        pressCardUrl,
        letterUrl,
        assignmentUrl,
        autoApprove: form.autoApprove,
        sendWelcomeEmail: form.sendWelcomeEmail,
        adminNotes:
          form.adminNotes.trim() ||
          `Added manually by ${addedBy === "desk" ? "registration desk" : "admin"} on ${new Date().toLocaleDateString()}.`,
      });

      if (result.simulated) {
        toast.success(`Media person added locally`, {
          description: result.welcomeEmailSent
            ? `Simulated welcome email to ${form.email} — API unavailable, using local fallback.`
            : undefined,
          duration: 6000,
        });
      } else {
        toast.success(`${form.fullName} added`, {
          description: result.welcomeEmailSent
            ? `Welcome email sent to ${form.email} with password setup instructions.`
            : "Accreditation created.",
        });
      }

      onOpenChange(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add media person");
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || create.isPending || uploadFile.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Newspaper className="h-5 w-5 text-accent" /> Add media person
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Register a journalist manually — same details as the public media tab. Creates their accreditation and
            optionally sends a welcome email with portal instructions.
          </p>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <span
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center font-bold border",
                  i === step ? "bg-accent text-accent-foreground border-accent" : i < step ? "bg-green text-white border-green" : "text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("hidden sm:inline", i === step && "font-semibold")}>{label}</span>
              {i < steps.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-green" : "bg-border")} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Full name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Professional role *</Label>
              <Input
                placeholder="Reporter, Photographer…"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Country *</Label>
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
            <div className="sm:col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
                placeholder="journalist@outlet.com"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Mobile phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
                placeholder="+250…"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Press / media outlet *</Label>
                <Input
                  value={form.pressName}
                  onChange={(e) => setForm({ ...form, pressName: e.target.value })}
                  className="mt-1"
                  placeholder="Outlet legal name"
                />
              </div>
              <div>
                <Label>Outlet type *</Label>
                <Select value={form.pressType} onValueChange={(v) => setForm({ ...form, pressType: v as MediaPressType })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEDIA_PRESS_TYPE_LABELS) as MediaPressType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {MEDIA_PRESS_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Outlet country *</Label>
                <Select value={form.pressCountry} onValueChange={(v) => setForm({ ...form, pressCountry: v })}>
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
              <div className="sm:col-span-2">
                <Label>Outlet website</Label>
                <Input
                  value={form.pressWebsite}
                  onChange={(e) => setForm({ ...form, pressWebsite: e.target.value })}
                  className="mt-1"
                  placeholder="https://"
                />
              </div>
              <div>
                <Label>Editor / producer name</Label>
                <Input value={form.editorName} onChange={(e) => setForm({ ...form, editorName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Editor email</Label>
                <Input
                  type="email"
                  value={form.editorEmail}
                  onChange={(e) => setForm({ ...form, editorEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Social handle (optional)</Label>
                <Input
                  value={form.socialHandle}
                  onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
                  className="mt-1"
                  placeholder="@outlet"
                />
              </div>
            </div>
            <div>
              <Label>Coverage plan *</Label>
              <Textarea
                rows={3}
                value={form.coverageBrief}
                onChange={(e) => setForm({ ...form, coverageBrief: e.target.value })}
                className="mt-1"
                placeholder="Sessions and themes they will cover…"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload press credentials when available. Files are stored via the authenticated upload API.
            </p>
            {[
              { label: "Press credential or ID", file: credentialFile, set: setCredentialFile },
              { label: "Letter from outlet", file: letterFile, set: setLetterFile },
              { label: "Assignment letter (optional)", file: assignmentFile, set: setAssignmentFile, optional: true },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-3">
                <Label>
                  {item.label}
                  {!item.optional && " (recommended)"}
                </Label>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    className="max-w-xs"
                    onChange={(e) => item.set(e.target.files?.[0] ?? null)}
                  />
                  {item.file && (
                    <span className="text-xs text-green flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> {item.file.name}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="auto-approve"
                  checked={form.autoApprove}
                  onCheckedChange={(v) => setForm({ ...form, autoApprove: !!v })}
                />
                <label htmlFor="auto-approve" className="text-sm leading-relaxed cursor-pointer">
                  Approve accreditation immediately (recommended for verified walk-ins)
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="send-welcome"
                  checked={form.sendWelcomeEmail}
                  onCheckedChange={(v) => setForm({ ...form, sendWelcomeEmail: !!v })}
                />
                <label htmlFor="send-welcome" className="text-sm leading-relaxed cursor-pointer">
                  Send welcome email with password setup link (simulated until backend ships invite flow)
                </label>
              </div>
            </div>

            <div>
              <Label>Internal note (optional)</Label>
              <Textarea
                rows={2}
                value={form.adminNotes}
                onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                className="mt-1"
                placeholder="Desk reference, verification notes…"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => (step > 0 ? setStep(step - 1) : onOpenChange(false))} disabled={busy}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              className="gradient-blue text-accent-foreground"
              disabled={(step === 0 && !canStep0) || (step === 1 && !canStep1)}
              onClick={() => setStep(step + 1)}
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" className="gradient-blue text-accent-foreground" disabled={busy} onClick={() => void submit()}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Add media person
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
