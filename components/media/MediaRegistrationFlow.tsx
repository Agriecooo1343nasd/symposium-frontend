"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Newspaper, Upload, ShieldCheck } from "lucide-react";
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
import { cmsService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = ["Your details", "Press outlet", "Documents", "Submit"];

export function MediaRegistrationFlow() {
  const router = useRouter();
  const countries = getCountries();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
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
    consentPolicy: false,
  });

  const [credential, setCredential] = useState<{ name: string; dataUrl: string } | null>(null);
  const [letter, setLetter] = useState<{ name: string; dataUrl: string } | null>(null);
  const [assignment, setAssignment] = useState<{ name: string; dataUrl: string } | null>(null);

  const readFile = (file: File, cb: (name: string, dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(file.name, reader.result as string);
    reader.readAsDataURL(file);
  };

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const canStep0 = form.fullName && form.email && form.phone && form.country;
  const canStep1 = form.jobTitle && form.pressName && form.pressCountry && form.coverageBrief;
  const canStep2 = !!credential && !!letter;

  const submit = async () => {
    try {
      setSubmitting(true);
      await cmsService.submitMediaAccreditation({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        outletName: form.pressName.trim(),
        outletType: MEDIA_PRESS_TYPE_LABELS[form.pressType] ?? form.pressType,
        jobTitle: form.jobTitle || undefined,
        country: form.country || undefined,
        coverageType: form.coverageBrief || undefined,
        equipmentNeeds: form.socialHandle || undefined,
      });
      setStep(3);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-secondary/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Newspaper className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold">Media & press accreditation</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Complimentary access for accredited journalists covering NAS 2026. No registration fee — the secretariat
              reviews your outlet letter and press credentials before issuing your badge.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-2xl">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                i < step
                  ? "bg-green border-green text-white"
                  : i === step
                    ? "bg-accent border-accent text-accent-foreground"
                    : "bg-card border-border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className="ml-2 text-[10px] sm:text-xs font-semibold hidden sm:inline">{s}</span>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2", i < step ? "bg-green" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="m0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Full name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Professional role *</Label>
              <Input placeholder="e.g. Reporter, Photographer" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Country *</Label>
              <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
                placeholder="you@outlet.com"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Mobile phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="+250…" />
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="m1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Press / media outlet *</Label>
                <Input value={form.pressName} onChange={(e) => setForm({ ...form, pressName: e.target.value })} className="mt-1" placeholder="Outlet legal name" />
              </div>
              <div>
                <Label>Outlet type *</Label>
                <Select value={form.pressType} onValueChange={(v) => setForm({ ...form, pressType: v as MediaPressType })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEDIA_PRESS_TYPE_LABELS) as MediaPressType[]).map((t) => (
                      <SelectItem key={t} value={t}>{MEDIA_PRESS_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Outlet country *</Label>
                <Select value={form.pressCountry} onValueChange={(v) => setForm({ ...form, pressCountry: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Outlet website</Label>
                <Input value={form.pressWebsite} onChange={(e) => setForm({ ...form, pressWebsite: e.target.value })} className="mt-1" placeholder="https://" />
              </div>
              <div>
                <Label>Editor / producer name</Label>
                <Input value={form.editorName} onChange={(e) => setForm({ ...form, editorName: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Editor email</Label>
                <Input type="email" value={form.editorEmail} onChange={(e) => setForm({ ...form, editorEmail: e.target.value })} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Social handle (optional)</Label>
                <Input value={form.socialHandle} onChange={(e) => setForm({ ...form, socialHandle: e.target.value })} className="mt-1" placeholder="@outlet or personal" />
              </div>
            </div>
            <div>
              <Label>What will you cover at NAS 2026? *</Label>
              <Textarea
                rows={4}
                value={form.coverageBrief}
                onChange={(e) => setForm({ ...form, coverageBrief: e.target.value })}
                className="mt-1"
                placeholder="Sessions, interviews, themes you plan to report on…"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="m2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Upload PDF or image files. These are reviewed by the registration desk before your press badge is issued.
            </p>
            {[
              {
                label: "Press credential or national ID *",
                hint: "Press card, outlet ID, or government ID with photo",
                file: credential,
                set: setCredential,
              },
              {
                label: "Letter from your outlet *",
                hint: "On letterhead — confirms assignment to cover NAS 2026",
                file: letter,
                set: setLetter,
              },
              {
                label: "Assignment letter / additional proof (optional)",
                hint: "Foreign correspondents may add a ministry or embassy note",
                file: assignment,
                set: setAssignment,
                optional: true,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-4">
                <Label>{item.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">{item.hint}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    className="max-w-xs"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) readFile(f, (name, dataUrl) => item.set({ name, dataUrl }));
                    }}
                  />
                  {item.file && (
                    <span className="text-xs font-mono text-green flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> {item.file.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-4">
              <Checkbox
                id="media-policy"
                checked={form.consentPolicy}
                onCheckedChange={(v) => setForm({ ...form, consentPolicy: !!v })}
              />
              <label htmlFor="media-policy" className="text-sm leading-relaxed cursor-pointer">
                I agree to NAS 2026 media guidelines, accreditation terms, and the privacy policy. I will not share
                attendee contact details without consent.
              </label>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="m3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green/15 text-green flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Application submitted</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Thank you, {form.fullName}. The registration desk will review your press documents. You will receive email
              when your complimentary media pass is approved — usually within 2 business days.
            </p>
            <Button className="gradient-blue text-accent-foreground" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 3 && (
        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              className="gradient-blue text-accent-foreground"
              onClick={next}
              disabled={(step === 0 && !canStep0) || (step === 1 && !canStep1)}
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="gradient-blue text-accent-foreground"
              onClick={submit}
              disabled={!canStep2 || !form.consentPolicy || submitting}
            >
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
