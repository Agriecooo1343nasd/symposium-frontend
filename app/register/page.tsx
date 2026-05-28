"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, CreditCard, Building2, Smartphone, ShieldCheck, Lock, Sparkles, Download, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CurrencyToggle, formatPrice } from "@/components/CurrencyToggle";
import { SUB_THEMES, buildEventICS, type SubTheme } from "@/lib/mock-data";
import { getTicketPlans, patchStore, uid, upsertAttendeeProfile } from "@/lib/store";
import { getCountries, getEventConfig, isFeatureOpen } from "@/lib/platform-settings";
import { getCancellationPolicy, getPlanAvailability, joinWaitlist } from "@/lib/registration-ops";
import { useStore } from "@/hooks/use-store";
import type { TicketPlan } from "@/lib/store";
import { signIn } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const registrationOpen = isFeatureOpen("registration");
  const event = getEventConfig();
  const countries = getCountries();
  useStore();
  const ticketPlans = getTicketPlans();
  const cancellationPolicy = getCancellationPolicy();
  const [step, setStep] = useState(0);
  const [waitlistPlan, setWaitlistPlan] = useState<TicketPlan | null>(null);
  const [currency, setCurrency] = useState<"USD" | "RWF">("USD");
  const [picked, setPicked] = useState<TicketPlan | null>(null);
  const [verifyFile, setVerifyFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [form, setForm] = useState({
    fullName: "", title: "", org: "", country: countries[0] ?? "Rwanda", email: "", phone: "",
    dietary: "", access: "", hear: "", linkedin: "", interests: [] as string[],
    consent1: false,
    consent2: false,
    consent3: false,
    consentPolicy: false,
    consentExhibitor: true,
  });
  const [paymentMethod, setPaymentMethod] = useState("momo");

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const steps = ["Details", "Category", ...(picked?.requiresVerification ? ["Verification"] : []), "Payment", "Confirm"];
  const paymentStep = steps.indexOf("Payment");
  const confirmStep = steps.indexOf("Confirm");
  const verifyStep = steps.indexOf("Verification");

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const canStep1 = form.fullName && form.email && emailVerified && form.org && form.country && form.consent1 && form.consent3 && form.consentPolicy;
  const canStep2 = !!picked && !waitlistPlan;
  const canVerify = !!verifyFile;

  const completeRegistration = () => {
    if (!picked) return;
    const regId = uid("r");
    patchStore((s) => {
      const reg = {
        id: regId,
        name: form.fullName,
        email: form.email,
        country: form.country,
        category: picked.name,
        categoryId: picked.id,
        amountUsd: picked.usd,
        status: "paid" as const,
        verificationStatus: picked.requiresVerification ? ("pending" as const) : ("none" as const),
        createdAt: new Date().toISOString().slice(0, 10),
        details: {
          ticketId: `NAS26-${regId.replace("r", "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          title: form.title,
          org: form.org,
          phone: form.phone,
          dietary: form.dietary,
          access: form.access,
          hear: form.hear,
          linkedin: form.linkedin,
          interests: form.interests,
          paymentMethod,
        },
      };
      const verifications = [...s.documentVerifications];
      if (picked.requiresVerification && verifyFile) {
        verifications.unshift({
          id: uid("dv"),
          registrationId: regId,
          registrantName: form.fullName,
          registrantEmail: form.email,
          type: picked.requiresVerification,
          fileName: verifyFile.name,
          fileDataUrl: verifyFile.dataUrl,
          status: "pending",
          submittedAt: new Date().toISOString(),
        });
      }
      return { ...s, registrations: [reg, ...s.registrations], documentVerifications: verifications };
    });
    upsertAttendeeProfile({
      email: form.email,
      name: form.fullName,
      title: form.title,
      org: form.org,
      country: form.country,
      interests: form.interests,
      subThemeInterests: form.interests.filter((x): x is SubTheme => SUB_THEMES.includes(x as SubTheme)),
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: form.consentExhibitor,
    });
    signIn("attendee", { name: form.fullName, email: form.email, category: picked.name });
  };

  const submitWaitlist = () => {
    if (!waitlistPlan) return;
    if (!form.fullName || !form.email) return toast.error("Complete your details in step 1 first");
    const res = joinWaitlist({
      email: form.email,
      name: form.fullName,
      phone: form.phone,
      categoryId: waitlistPlan.id,
      categoryName: waitlistPlan.name,
      country: form.country,
      org: form.org,
    });
    if (!res.ok) return toast.error(res.error);
    toast.success("You're on the waitlist — we'll email you when a spot opens");
    setWaitlistPlan(null);
  };

  const handleVerifyFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVerifyFile({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  if (!registrationOpen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold">Registration closed</h1>
        <p className="text-muted-foreground mt-2">Registration is not open at this time. Check back when the secretariat enables it in Settings.</p>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-secondary/30 to-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">Secure your seat at NAS 2026</h1>
          <p className="text-muted-foreground mt-2">Takes under 5 minutes. Pay online or via bank transfer.</p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                  i < step ? "bg-green border-green text-white"
                    : i === step ? "bg-accent border-accent text-accent-foreground"
                    : "bg-card border-border text-muted-foreground"
                )}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className="ml-2 text-xs font-semibold hidden sm:block">{s}</div>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2 sm:mx-4", i < step ? "bg-green" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-xl p-6 sm:p-10 min-h-[480px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="font-serif text-2xl font-bold">Choose your pass</h2>
                  <CurrencyToggle currency={currency} onChange={setCurrency} />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticketPlans.map((t) => {
                    const avail = getPlanAvailability(t);
                    const soldOut = avail.soldOut;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (soldOut) {
                            setWaitlistPlan(t);
                            setPicked(null);
                          } else {
                            setPicked(t);
                            setWaitlistPlan(null);
                          }
                        }}
                        className={cn(
                          "text-left rounded-2xl border-2 p-5 transition-all hover-lift relative",
                          (picked?.id === t.id || waitlistPlan?.id === t.id) ? "border-accent ring-2 ring-accent/20 bg-accent/5" : "border-border bg-card",
                          soldOut && "opacity-90",
                        )}
                      >
                        {t.popular && !soldOut && (
                          <span className="absolute -top-2 -right-2 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">Popular</span>
                        )}
                        {soldOut && (
                          <span className="absolute -top-2 -right-2 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase px-2 py-0.5">Sold out</span>
                        )}
                        <div className="font-serif font-bold text-base leading-tight">{t.name}</div>
                        <div className="font-serif text-2xl font-bold mt-2 text-gradient">{formatPrice(t.usd, currency, event.exchangeRate)}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{avail.sold} / {avail.capacity} seats taken</div>
                        {t.note && <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 inline-block">{t.note}</div>}
                        <p className="text-xs text-muted-foreground mt-3">{t.description}</p>
                        {soldOut ? (
                          <p className="text-xs font-semibold text-accent mt-3">Join waitlist →</p>
                        ) : (
                          <ul className="mt-3 space-y-1">
                            {t.features.slice(0, 3).map((f) => (
                              <li key={f} className="text-xs text-foreground flex items-start gap-1.5">
                                <Check className="h-3 w-3 text-green mt-0.5 flex-shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                    );
                  })}
                </div>
                {waitlistPlan && (
                  <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 max-w-lg">
                    <h3 className="font-serif font-bold">Waitlist — {waitlistPlan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">This pass is full. Join the waitlist and we'll notify you when a spot opens.</p>
                    <Button type="button" className="mt-4 gradient-blue text-accent-foreground" onClick={submitWaitlist}>Join waitlist</Button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 0 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <h2 className="font-serif text-2xl font-bold mb-6">Your details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><Label>Full name *</Label><Input required placeholder="Your full legal name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1" /></div>
                  <div><Label>Professional title</Label><Input placeholder="e.g. Programme Officer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
                  <div><Label>Organization *</Label><Input required placeholder="Employer or institution" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="mt-1" /></div>
                  
                  {/* Email & Email Verification Section */}
                  <div className="sm:col-span-2">
                    <Label>Email *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input required type="email" placeholder="you@organization.com" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailVerified(false); }} className="flex-1" disabled={emailVerified} />
                      {emailVerified ? (
                        <span className="bg-green/10 text-green border border-green/20 px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 select-none">
                          <Check className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        form.email && (
                          <Button type="button" size="sm" onClick={() => { setVerifying(true); toast.success("Verification code 1234 sent to " + form.email); }} className="gradient-navy text-white text-xs">
                            Verify
                          </Button>
                        )
                      )}
                    </div>
                    {verifying && !emailVerified && (
                      <div className="mt-2 p-3 bg-secondary/50 border border-border rounded-xl space-y-2 max-w-sm">
                        <div className="text-xs text-muted-foreground">Enter the 4-digit code sent to your email (Demo: 1234)</div>
                        <div className="flex gap-2">
                          <Input placeholder="Code" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} className="w-24 text-center h-8" />
                          <Button type="button" size="sm" onClick={() => {
                            if (verifyCode === "1234") {
                              setEmailVerified(true);
                              setVerifying(false);
                              toast.success("Email verified successfully!");
                            } else {
                              toast.error("Invalid verification code");
                            }
                          }} className="gradient-blue text-accent-foreground text-xs h-8">
                            Confirm
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div><Label>Phone (+250…)</Label><Input placeholder="+250 788 000 000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
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
                  <div>
                    <Label>How did you hear about us?</Label>
                    <Select value={form.hear} onValueChange={(v) => setForm({ ...form, hear: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {["Email newsletter", "LinkedIn", "Twitter/X", "Colleague", "Partner organization", "Other"].map((c) =>
                          <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>LinkedIn (optional)</Label><Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="mt-1" placeholder="linkedin.com/in/…" /></div>
                  <div className="sm:col-span-2"><Label>Dietary requirements</Label><Input value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} className="mt-1" placeholder="e.g. vegetarian, halal, gluten-free" /></div>
                  <div className="sm:col-span-2"><Label>Accessibility needs (optional)</Label><Textarea value={form.access} onChange={(e) => setForm({ ...form, access: e.target.value })} className="mt-1" rows={2} /></div>

                  <div className="sm:col-span-2">
                    <Label className="mb-2 block">Your areas of interest (for networking)</Label>
                    <div className="flex flex-wrap gap-2">
                      {SUB_THEMES.map((t) => {
                        const on = form.interests.includes(t);
                        return (
                          <button key={t} type="button"
                            onClick={() => setForm({ ...form, interests: on ? form.interests.filter((x) => x !== t) : [...form.interests, t] })}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border", on ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 leading-relaxed max-h-40 overflow-y-auto">
                  <div className="font-semibold uppercase tracking-wider mb-2">Cancellation &amp; refund policy</div>
                  {cancellationPolicy}
                </div>

                <div className="mt-6 space-y-3 pt-4 border-t border-border">
                  {[
                    { k: "consent1", l: "I accept the privacy policy and data handling terms.", req: true },
                    { k: "consent2", l: "I consent to being photographed for symposium publicity.", req: false },
                    {
                      k: "consentExhibitor",
                      l: "I allow exhibitors to capture my contact when they scan my e-ticket QR at their booth (FR-5.2). I can change this later in my profile.",
                      req: false,
                    },
                    { k: "consent3", l: "I agree to the symposium Terms & Conditions.", req: true },
                    { k: "consentPolicy", l: "I have read and accept the cancellation & refund policy above.", req: true },
                  ].map((c) => (
                    <label key={c.k} className="flex items-start gap-3 cursor-pointer" htmlFor={c.k}>
                      <Checkbox
                        id={c.k}
                        checked={form[c.k as keyof typeof form] as boolean}
                        onCheckedChange={(v) => setForm({ ...form, [c.k]: !!v })}
                      />
                      <span className="text-sm text-foreground select-none">
                        {c.l} {c.req && <span className="text-destructive">*</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {step === verifyStep && picked?.requiresVerification && (
              <motion.div key="verify" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <h2 className="font-serif text-2xl font-bold mb-2">Upload verification</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  {picked.requiresVerification === "student"
                    ? "Upload a valid student ID card. Registration desk will verify before your pass is fully activated."
                    : "Upload your farmer organization letter. Registration desk will verify your eligibility."}
                </p>
                <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="verify-upload"
                    onChange={(e) => handleVerifyFile(e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor="verify-upload" className="cursor-pointer">
                    {verifyFile ? (
                      <div className="text-sm">
                        <div className="font-medium text-green">{verifyFile.name}</div>
                        <div className="text-muted-foreground mt-1">Click to replace</div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">Click to upload document</div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                  You may complete payment now. Your pass remains pending verification until approved by the registration desk.
                </p>
              </motion.div>
            )}

            {step === paymentStep && picked && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <h2 className="font-serif text-2xl font-bold mb-2">Payment</h2>
                <p className="text-xs text-muted-foreground mb-4">Refunds follow the policy you accepted in step 1. Manage requests later in your dashboard.</p>
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
                  <div>
                    <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                      <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4 h-auto">
                        <TabsTrigger value="momo" className="flex-col h-auto py-2 gap-1"><Smartphone className="h-4 w-4" /><span className="text-[11px]">MTN MoMo</span></TabsTrigger>
                        <TabsTrigger value="airtel" className="flex-col h-auto py-2 gap-1"><Smartphone className="h-4 w-4" /><span className="text-[11px]">Airtel Money</span></TabsTrigger>
                        <TabsTrigger value="card" className="flex-col h-auto py-2 gap-1"><CreditCard className="h-4 w-4" /><span className="text-[11px]">Card</span></TabsTrigger>
                        <TabsTrigger value="bank" className="flex-col h-auto py-2 gap-1"><Building2 className="h-4 w-4" /><span className="text-[11px]">Bank Transfer</span></TabsTrigger>
                      </TabsList>

                      <TabsContent value="momo" className="space-y-3">
                        <Label>Mobile Money number</Label>
                        <Input placeholder="07X XXX XXXX" />
                        <Button className="w-full gradient-blue text-accent-foreground" onClick={() => { toast.success("Payment confirmed"); completeRegistration(); next(); }}>Send Payment Request</Button>
                        <p className="text-xs text-muted-foreground">You&apos;ll receive a USSD prompt to authorize the payment.</p>
                      </TabsContent>
                      <TabsContent value="airtel" className="space-y-3">
                        <Label>Airtel number</Label>
                        <Input placeholder="07X XXX XXXX" />
                        <Button className="w-full gradient-blue text-accent-foreground" onClick={() => { toast.success("Payment confirmed"); completeRegistration(); next(); }}>Send Payment Request</Button>
                      </TabsContent>
                      <TabsContent value="card" className="space-y-3">
                        <div><Label>Card number</Label><Input placeholder="1234 5678 9012 3456" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Expiry</Label><Input placeholder="MM/YY" /></div>
                          <div><Label>CVC</Label><Input placeholder="123" /></div>
                        </div>
                        <div><Label>Cardholder name</Label><Input /></div>
                        <Button className="w-full gradient-blue text-accent-foreground mt-2" onClick={() => { toast.success("Payment confirmed"); completeRegistration(); next(); }}>Pay &amp; Confirm</Button>
                      </TabsContent>
                      <TabsContent value="bank" className="space-y-2 text-sm">
                        <p className="text-muted-foreground font-sans">A proforma invoice will be emailed to you with these details:</p>
                        <div className="rounded-xl bg-secondary p-4 space-y-1 font-mono text-xs">
                          <div>Bank: Bank of Kigali</div>
                          <div>Account: NAS 2026 Secretariat</div>
                          <div>Account #: 00040-12345678-90</div>
                          <div>Swift: BKIGRWRW</div>
                          <div>Ref: Your registration ID (sent by email)</div>
                        </div>
                        <Button className="w-full gradient-blue text-accent-foreground mt-4" onClick={() => { completeRegistration(); next(); }}>Generate Proforma Invoice</Button>
                      </TabsContent>
                    </Tabs>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Secured</span>
                      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> PCI-DSS Compliant</span>
                    </div>
                  </div>

                  <aside className="rounded-2xl bg-secondary/60 border border-border p-5 h-fit">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Order summary</div>
                    <div className="font-serif font-bold">{picked.name}</div>
                    <div className="text-sm text-muted-foreground">{form.fullName || "Attendee"}</div>
                    <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatPrice(picked.usd, currency, event.exchangeRate)}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>VAT</span><span>—</span></div>
                      <div className="flex justify-between text-base font-serif font-bold pt-2 border-t border-border mt-2">
                        <span>Total</span><span className="text-gradient">{formatPrice(picked.usd, currency, event.exchangeRate)}</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </motion.div>
            )}

            {step === confirmStep && picked && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                  className="mx-auto h-20 w-20 rounded-full bg-green text-white flex items-center justify-center mb-6"
                >
                  <Check className="h-10 w-10" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold">You&apos;re in 🎉</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Your e-ticket is on its way to <span className="font-medium text-foreground">{form.email || "your inbox"}</span>. See you in Kigali on 13 August 2026.
                </p>

                <div className="mt-8 rounded-2xl bg-secondary/60 border border-border p-5 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Next steps</span>
                  </div>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 list-disc pl-5">
                    <li>Check your email for the e-ticket with QR code</li>
                    <li>Sign in to access your attendee dashboard</li>
                    <li>Build your personal agenda</li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mt-8">
                  <Button onClick={() => { signIn("attendee"); router.push("/dashboard"); }} className="gradient-blue text-accent-foreground">
                    Go to dashboard
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("E-ticket downloaded")}><Download className="h-4 w-4 mr-1" /> Download E-Ticket</Button>
                  <Button variant="outline" onClick={() => {
                    const blob = new Blob([buildEventICS()], { type: "text/calendar;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "nas-2026.ics"; a.click();
                    URL.revokeObjectURL(url);
                  }}><Calendar className="h-4 w-4 mr-1" /> Add to Calendar</Button>
                  <Button variant="outline" onClick={() => {
                    if (navigator.share) navigator.share({ title: "I'm attending NAS 2026", url: window.location.origin }).catch(() => {});
                    else { navigator.clipboard.writeText(window.location.origin); toast.success("Link copied"); }
                  }}><Share2 className="h-4 w-4 mr-1" /> Share I&apos;m Attending</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        {step < confirmStep && (
          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" onClick={back} disabled={step === 0}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <Button
              onClick={() => {
                if (step === 0 && !canStep1) {
                  if (!emailVerified) return toast.error("Please click 'Verify' next to your email and confirm the code first.");
                  return toast.error("Please fill required fields and accept terms.");
                }
                if (step === 1 && !canStep2) return toast.error("Please choose a pass to continue.");
                if (step === verifyStep && !canVerify) return toast.error("Please upload your verification document.");
                if (step === paymentStep) {
                  toast.success("Payment confirmed");
                  completeRegistration();
                }
                next();
              }}
              className="gradient-blue text-accent-foreground"
            >
              {step === paymentStep ? "Pay & confirm" : "Continue"} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
