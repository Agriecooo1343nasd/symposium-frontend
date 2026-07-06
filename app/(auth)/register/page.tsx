"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Share2,
  Newspaper,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyToggle, formatPrice } from "@/components/CurrencyToggle";
import { SUB_THEMES, buildEventICS, EVENT } from "@/lib/mock-data";
import { getCountries, isFeatureOpen } from "@/lib/platform-settings";
import { getCancellationPolicy } from "@/lib/registration-ops";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MediaRegistrationFlow } from "@/components/media/MediaRegistrationFlow";
import { GroupMembersFields } from "@/components/group/GroupMembersFields";
import { GroupPricingSummary } from "@/components/group/GroupPricingSummary";
import { GroupDiscountTiersCard } from "@/components/group/GroupDiscountTiersCard";
import { RegistrationPaymentForm } from "@/components/registration/RegistrationPaymentForm";
import {
  calculateGroupPricing,
  type GroupMemberInput,
} from "@/lib/group-registration";
import { getServerGroupRegistrationSettings } from "@/lib/group-registration-policy";
import { useAuth } from "@/hooks/use-auth";
import { useSymposium } from "@/hooks/api/useSymposium";
import { usePublicTicketCategories } from "@/hooks/api/usePublicData";
import { useRegisterAccount } from "@/hooks/api/useAuthSession";
import {
  useCreateGroup,
  useCreateRegistration,
  useSelectCategory,
  useUploadVerificationDoc,
} from "@/hooks/api/useRegistration";
import {
  formatRegistrationExpiry,
  registrationDisplayAmount,
} from "@/lib/api/mappers/registration-helpers";
import { mapTicketCategoryToPlan } from "@/lib/api/mappers/ticketCategory";
import { registrationsService } from "@/lib/api/services";
import { apiErrorMessage } from "@/lib/api/client";
import type { Currency, RegistrationDto } from "@/lib/api/dto";

type Plan = ReturnType<typeof mapTicketCategoryToPlan>;

function TicketQr({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, { width: 220, margin: 1 })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [value]);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Ticket QR code" width={200} height={200} className="mx-auto rounded-xl border border-border bg-white p-2" />
  );
}

export default function Register() {
  const router = useRouter();
  const registrationOpen = isFeatureOpen("registration");
  const countries = getCountries();
  const { isAuthenticated, session } = useAuth();
  const { symposiumId, symposium } = useSymposium();
  const { raw: categories, isLoading: plansLoading } = usePublicTicketCategories();
  const plans: Plan[] = useMemo(() => categories.map(mapTicketCategoryToPlan), [categories]);
  const exchangeRate = symposium?.exchangeRateUsdRwf ?? EVENT.exchangeRate;
  const groupSettings = getServerGroupRegistrationSettings();
  const cancellationPolicy = getCancellationPolicy();

  const registerAccount = useRegisterAccount();
  const createReg = useCreateRegistration();
  const selectCategory = useSelectCategory();
  const createGroup = useCreateGroup();
  const uploadDoc = useUploadVerificationDoc();

  const [regMode, setRegMode] = useState<"delegate" | "media">("delegate");
  const [phase, setPhase] = useState<"wizard" | "done">("wizard");
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [picked, setPicked] = useState<Plan | null>(null);
  const [waitlistPlan, setWaitlistPlan] = useState<Plan | null>(null);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyDocUrl, setVerifyDocUrl] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [regKind, setRegKind] = useState<"individual" | "group">("individual");
  const [groupSize, setGroupSize] = useState(() => groupSettings.minSize);
  const [groupMembers, setGroupMembers] = useState<GroupMemberInput[]>([]);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [finalRegistration, setFinalRegistration] = useState<RegistrationDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    title: "",
    org: "",
    country: countries[0] ?? "Rwanda",
    email: "",
    password: "",
    phone: "",
    dietary: "",
    access: "",
    hear: "",
    linkedin: "",
    interests: [] as string[],
    consent1: false,
    consent2: false,
    consent3: false,
    consentPolicy: false,
    consentExhibitor: true,
  });

  useEffect(() => {
    if (isAuthenticated && session) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || session.name || "",
        email: f.email || session.email || "",
      }));
    }
  }, [isAuthenticated, session]);

  const steps = useMemo(
    () => [
      "Details",
      "Pass",
      ...(picked?.requiresVerification ? ["Verify"] : []),
      "Review",
    ],
    [picked],
  );
  const detailsStep = 0;
  const categoryStep = 1;
  const verifyStep = steps.indexOf("Verify");
  const reviewStep = steps.indexOf("Review");

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const availabilityOf = (p: Plan) => {
    const capacity = p.capacity ?? null;
    const sold = p.soldCount ?? 0;
    return { soldOut: capacity !== null && sold >= capacity, sold, capacity };
  };

  const pickPlan = (p: Plan) => {
    const avail = availabilityOf(p);
    setRegistrationId(null);
    if (avail.soldOut) {
      setWaitlistPlan(p);
      setPicked(null);
    } else {
      setPicked(p);
      setWaitlistPlan(null);
    }
  };

  const groupMembersValid =
    regKind !== "group" ||
    (groupMembers.length >= groupSize - 1 &&
      groupMembers.slice(0, groupSize - 1).every((m) => m.name.trim() && m.email.trim()));

  const detailsValid =
    Boolean(form.fullName && form.email && form.org && form.country) &&
    form.consent1 &&
    form.consent3 &&
    form.consentPolicy &&
    groupMembersValid &&
    (isAuthenticated || form.password.length >= 8);

  const nameParts = () => {
    const parts = form.fullName.trim().split(/\s+/);
    const firstName = parts[0] || form.fullName.trim();
    const lastName = parts.slice(1).join(" ") || firstName;
    return { firstName, lastName };
  };

  const consentsPayload = () => ({
    privacy: form.consent1,
    photography: form.consent2,
    terms: form.consent3,
    cancellationPolicy: form.consentPolicy,
    exhibitorContact: form.consentExhibitor,
  });

  const ensureRegistration = async (): Promise<string> => {
    if (registrationId) return registrationId;
    if (!symposiumId) throw new Error("Symposium not loaded yet — please retry.");
    if (!picked) throw new Error("Select a ticket category first.");
    const { firstName, lastName } = nameParts();
    const draft = await createReg.mutateAsync({
      symposiumId,
      attendanceType: "in_person",
      referralSource: form.hear || undefined,
      consents: consentsPayload(),
      firstName,
      lastName,
      phone: form.phone || undefined,
      organization: form.org || undefined,
      country: form.country || undefined,
      title: form.title || undefined,
    });
    await selectCategory.mutateAsync({
      id: draft.id,
      dto: {
        ticketCategoryId: picked.id,
        currency,
        verificationDocUrl: verifyDocUrl ?? undefined,
      },
    });
    setRegistrationId(draft.id);
    return draft.id;
  };

  const loadFinalRegistration = async (id: string) => {
    try {
      const mine = await registrationsService.listMine();
      setFinalRegistration(mine.find((r) => r.id === id) ?? null);
    } catch {
      setFinalRegistration(null);
    }
  };

  const handleNext = async () => {
    if (step === detailsStep) {
      if (!detailsValid) {
        if (!isAuthenticated && form.password.length < 8)
          return toast.error("Create a password (at least 8 characters).");
        return toast.error("Please fill required fields and accept the terms.");
      }
      if (!isAuthenticated) {
        const { firstName, lastName } = nameParts();
        try {
          setSubmitting(true);
          await registerAccount.mutateAsync({
            email: form.email.trim(),
            password: form.password,
            firstName,
            lastName,
            phone: form.phone || undefined,
            organization: form.org || undefined,
            country: form.country || undefined,
          });
          toast.success("Account created — let's pick your pass.");
        } catch (e) {
          const msg = apiErrorMessage(e);
          if (/already/i.test(msg)) {
            toast.error("That email is already registered. Please sign in to continue.");
          } else {
            toast.error(msg);
          }
          return;
        } finally {
          setSubmitting(false);
        }
      }
      next();
      return;
    }
    if (step === categoryStep) {
      if (!picked) return toast.error("Please choose a pass to continue.");
      next();
      return;
    }
    if (step === verifyStep) {
      next();
      return;
    }
  };

  const handleVerifyFile = async (file: File | null) => {
    if (!file) return;
    setVerifyFile(file);
    try {
      const res = await uploadDoc.mutateAsync(file);
      setVerifyDocUrl(res.url);
      toast.success("Document uploaded");
    } catch {
      setVerifyDocUrl(null);
      toast.message("Document saved locally — the desk will collect it at check-in if upload is unavailable.");
    }
  };

  const handleCompleteRegistration = async () => {
    if (!symposiumId) return toast.error("Symposium not loaded yet — please retry.");
    if (!picked) return toast.error("Select a ticket category first.");

    if (regKind === "group") {
      const additional = groupMembers
        .slice(0, groupSize - 1)
        .filter((m) => m.email.trim())
        .map((m) => ({ email: m.email.trim(), ticketCategoryId: picked.id }));
      try {
        setSubmitting(true);
        const created = await createGroup.mutateAsync({
          symposiumId,
          organizationName: form.org || form.fullName,
          currency,
          members: [{ ticketCategoryId: picked.id }, ...additional],
        });
        const first = created[0] ?? null;
        setFinalRegistration(first);
        if (first) setRegistrationId(first.id);
        toast.success(`Group registration created for ${created.length} delegates.`);
        setPhase("done");
      } catch (e) {
        toast.error(apiErrorMessage(e));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      setSubmitting(true);
      const id = await ensureRegistration();
      await loadFinalRegistration(id);
      toast.success("You're registered — pay now or anytime from your dashboard.");
      setPhase("done");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!registrationId) return;
    await loadFinalRegistration(registrationId);
    setShowPayment(false);
  };

  const confirmStatus = finalRegistration?.status;
  const isConfirmActive = confirmStatus === "active";
  const isPendingVerification = confirmStatus === "pending_verification";
  const isPendingPayment = confirmStatus === "pending_payment";
  const paymentDeadline = formatRegistrationExpiry(finalRegistration?.expiresAt);

  if (!registrationOpen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold">Registration closed</h1>
        <p className="text-muted-foreground mt-2">
          Registration is not open at this time. Check back when the secretariat enables it.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-secondary/30 to-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {regMode === "media" ? "Press accreditation" : "Secure your seat at NAS 2026"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {regMode === "media"
              ? "Complimentary access for accredited media — submit credentials for review."
              : "Register in a few steps. Pay now or later from your dashboard."}
          </p>
        </div>

        <Tabs
          value={regMode}
          onValueChange={(v) => {
            setRegMode(v as "delegate" | "media");
            setStep(0);
            setPhase("wizard");
          }}
          className="max-w-md mx-auto mb-8"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delegate" className="gap-1.5">
              <UserRound className="h-3.5 w-3.5" /> Delegate
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5">
              <Newspaper className="h-3.5 w-3.5" /> Media / Press
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {regMode === "media" ? (
          <div className="rounded-3xl border border-border bg-card shadow-xl p-6 sm:p-10">
            <MediaRegistrationFlow />
          </div>
        ) : (
          <>
            {/* Stepper */}
            {phase === "wizard" && (
            <div className="mb-10">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                        i < step
                          ? "bg-green border-green text-white"
                          : i === step
                            ? "bg-accent border-accent text-accent-foreground"
                            : "bg-card border-border text-muted-foreground",
                      )}
                    >
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
            )}

            <div className="rounded-3xl border border-border bg-card shadow-xl p-6 sm:p-10 min-h-[480px]">
              <AnimatePresence mode="wait">
                {phase === "wizard" && step === detailsStep && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-2xl font-bold mb-2">Your details</h2>
                    {!isAuthenticated && (
                      <p className="text-sm text-muted-foreground mb-6">
                        Already have an account?{" "}
                        <Link href="/login?next=/register" className="text-accent font-semibold hover:underline">
                          Sign in
                        </Link>{" "}
                        to register faster.
                      </p>
                    )}
                    {groupSettings.enabled && (
                      <div className="mb-6">
                        <Label className="mb-2 block">Registration type</Label>
                        <div className="grid grid-cols-2 gap-2 max-w-md">
                          <button
                            type="button"
                            onClick={() => setRegKind("individual")}
                            className={cn(
                              "rounded-xl border p-3 text-left text-sm transition-colors",
                              regKind === "individual" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary/50",
                            )}
                          >
                            <span className="font-semibold">Individual</span>
                            <p className="text-xs text-muted-foreground mt-0.5">One delegate, one pass</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRegKind("group");
                              setGroupSize(groupSettings.minSize);
                              setGroupMembers(
                                Array.from({ length: groupSettings.minSize - 1 }, () => ({ name: "", email: "" })),
                              );
                            }}
                            className={cn(
                              "rounded-xl border p-3 text-left text-sm transition-colors",
                              regKind === "group" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary/50",
                            )}
                          >
                            <span className="font-semibold inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> Group
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {groupSettings.minSize}+ delegates · up to {groupSettings.tier10PlusPercent}% off
                            </p>
                          </button>
                        </div>
                        {regKind === "group" && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                            Each additional delegate must already have a NAS account (same email) before you can add them to a group.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Full name *</Label>
                        <Input
                          required
                          placeholder="Your full legal name"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Professional title</Label>
                        <Input
                          placeholder="e.g. Programme Officer"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Organization *</Label>
                        <Input
                          required
                          placeholder="Employer or institution"
                          value={form.org}
                          onChange={(e) => setForm({ ...form, org: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label>Email *</Label>
                        <Input
                          required
                          type="email"
                          placeholder="you@organization.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="mt-1"
                          disabled={isAuthenticated}
                        />
                      </div>

                      {!isAuthenticated && (
                        <div className="sm:col-span-2">
                          <Label>Create a password *</Label>
                          <Input
                            required
                            type="password"
                            placeholder="At least 8 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Phone (+250…)</Label>
                        <Input
                          placeholder="+250 788 000 000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                      <div>
                        <Label>How did you hear about us?</Label>
                        <Select value={form.hear} onValueChange={(v) => setForm({ ...form, hear: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Email newsletter", "LinkedIn", "Twitter/X", "Colleague", "Partner organization", "Other"].map(
                              (c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>LinkedIn (optional)</Label>
                        <Input
                          value={form.linkedin}
                          onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                          className="mt-1"
                          placeholder="linkedin.com/in/…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Dietary requirements</Label>
                        <Input
                          value={form.dietary}
                          onChange={(e) => setForm({ ...form, dietary: e.target.value })}
                          className="mt-1"
                          placeholder="e.g. vegetarian, halal, gluten-free"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Accessibility needs (optional)</Label>
                        <Textarea
                          value={form.access}
                          onChange={(e) => setForm({ ...form, access: e.target.value })}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="mb-2 block">Your areas of interest (for networking)</Label>
                        <div className="flex flex-wrap gap-2">
                          {SUB_THEMES.map((t) => {
                            const on = form.interests.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    interests: on ? form.interests.filter((x) => x !== t) : [...form.interests, t],
                                  })
                                }
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs font-medium border",
                                  on
                                    ? "bg-accent text-accent-foreground border-accent"
                                    : "bg-card border-border text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {regKind === "group" && (
                      <div className="mt-6">
                        <GroupMembersFields
                          groupSize={groupSize}
                          onGroupSizeChange={setGroupSize}
                          members={groupMembers}
                          onMembersChange={setGroupMembers}
                          representativeEmail={form.email}
                        />
                      </div>
                    )}

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
                          l: "I allow exhibitors to capture my contact when they scan my e-ticket QR at their booth. I can change this later in my profile.",
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

                {phase === "wizard" && step === categoryStep && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-bold">Choose your pass</h2>
                        {regKind === "group" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Group of {groupSize} — {groupSettings.tier5to9Percent}% off ({groupSettings.minSize}–9) or{" "}
                            {groupSettings.tier10PlusPercent}% off (10+)
                          </p>
                        )}
                      </div>
                      <CurrencyToggle currency={currency} onChange={(c) => setCurrency(c as Currency)} />
                    </div>
                    {regKind === "group" && groupSettings.enabled && (
                      <div className="mb-6">
                        <GroupDiscountTiersCard
                          settings={groupSettings}
                          examplePriceUsd={picked?.usd ?? plans.find((p) => p.popular)?.usd ?? 150}
                          currency={currency}
                          exchangeRate={exchangeRate}
                          compact
                        />
                      </div>
                    )}
                    {plansLoading && plans.length === 0 ? (
                      <div className="py-16 text-center text-muted-foreground">Loading passes…</div>
                    ) : plans.length === 0 ? (
                      <div className="py-16 text-center text-muted-foreground">
                        No passes are available right now. Please check back soon.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((t) => {
                          const avail = availabilityOf(t);
                          const groupPricing = regKind === "group" ? calculateGroupPricing(groupSize, t.usd) : null;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => pickPlan(t)}
                              className={cn(
                                "text-left rounded-2xl border-2 p-5 transition-all hover-lift relative",
                                picked?.id === t.id || waitlistPlan?.id === t.id
                                  ? "border-accent ring-2 ring-accent/20 bg-accent/5"
                                  : "border-border bg-card",
                                avail.soldOut && "opacity-90",
                              )}
                            >
                              {t.popular && !avail.soldOut && (
                                <span className="absolute -top-2 -right-2 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                  Popular
                                </span>
                              )}
                              {avail.soldOut && (
                                <span className="absolute -top-2 -right-2 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase px-2 py-0.5">
                                  Sold out
                                </span>
                              )}
                              <div className="font-serif font-bold text-base leading-tight">{t.name}</div>
                              <div className="font-serif text-2xl font-bold mt-2 text-gradient">
                                {regKind === "group" && groupPricing
                                  ? formatPrice(groupPricing.totalUsd, currency, exchangeRate)
                                  : formatPrice(t.usd, currency, exchangeRate)}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {regKind === "group" && groupPricing ? (
                                  <>
                                    {groupSize} delegates ·{" "}
                                    {groupPricing.discountPercent > 0 ? (
                                      <span className="text-green font-semibold">
                                        −{groupPricing.discountPercent}% ({formatPrice(groupPricing.discountUsd, currency, exchangeRate)})
                                      </span>
                                    ) : (
                                      "List price — add delegates for discount"
                                    )}
                                  </>
                                ) : avail.capacity !== null ? (
                                  <>
                                    {avail.sold} / {avail.capacity} seats taken
                                  </>
                                ) : (
                                  <>{avail.sold} registered</>
                                )}
                              </div>
                              {t.note && (
                                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 inline-block">
                                  {t.note}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-3">{t.description}</p>
                              {avail.soldOut ? (
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
                    )}
                    {picked && regKind === "group" && (
                      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 max-w-lg">
                        <h3 className="font-serif font-bold text-sm mb-3">Group total — {picked.name}</h3>
                        <GroupPricingSummary
                          memberCount={groupSize}
                          pricePerSeatUsd={picked.usd}
                          currency={currency}
                          exchangeRate={exchangeRate}
                        />
                      </div>
                    )}
                    {waitlistPlan && (
                      <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 max-w-lg">
                        <h3 className="font-serif font-bold">Waitlist — {waitlistPlan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This pass is full. Waitlist management is handled by the secretariat — please{" "}
                          <Link href="/contact" className="text-accent font-semibold hover:underline">
                            contact us
                          </Link>{" "}
                          and we&apos;ll notify you when a spot opens.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {phase === "wizard" && verifyStep !== -1 && step === verifyStep && picked?.requiresVerification && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-2xl font-bold mb-2">Upload verification</h2>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Upload your supporting document (student ID or farmer organization letter). The registration desk
                      verifies eligibility before your pass is fully activated.
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
                            <div className="text-muted-foreground mt-1">
                              {uploadDoc.isPending ? "Uploading…" : verifyDocUrl ? "Uploaded · click to replace" : "Click to replace"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">Click to upload document</div>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                      You can finish registration without paying now. If your pass requires verification, the desk will
                      review your document after payment.
                    </p>
                  </motion.div>
                )}

                {phase === "wizard" && step === reviewStep && picked && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-2xl font-bold mb-2">Review &amp; complete</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Confirm your details below. You&apos;ll reserve your pass now — payment is optional and can be done
                      later from your dashboard.
                    </p>
                    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
                      <div className="space-y-4 text-sm">
                        <div className="rounded-xl border border-border p-4">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                            Attendee
                          </div>
                          <div className="font-medium">{form.fullName}</div>
                          <div className="text-muted-foreground">{form.email}</div>
                          <div className="text-muted-foreground">{form.org}</div>
                          <div className="text-muted-foreground">{form.country}</div>
                        </div>
                        {regKind === "group" && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                            <p className="font-medium">Group of {groupSize}</p>
                            <p className="text-xs mt-1">
                              We&apos;ll create a pending registration for each delegate. Each person pays separately
                              from their own account.
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Refunds follow the policy you accepted in step 1.
                        </p>
                      </div>

                      <aside className="rounded-2xl bg-secondary/60 border border-border p-5 h-fit">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                          Your pass
                        </div>
                        <div className="font-serif font-bold">{picked.name}</div>
                        <div className="mt-4 pt-4 border-t border-border">
                          {regKind === "group" ? (
                            <GroupPricingSummary
                              memberCount={groupSize}
                              pricePerSeatUsd={picked.usd}
                              currency={currency}
                              exchangeRate={exchangeRate}
                              compact
                            />
                          ) : (
                            <div className="flex justify-between text-base font-serif font-bold">
                              <span>Total due</span>
                              <span className="text-gradient">{formatPrice(picked.usd, currency, exchangeRate)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          Payment not required to complete registration.
                        </p>
                      </aside>
                    </div>
                  </motion.div>
                )}

                {phase === "done" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                      className={cn(
                        "mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 text-white",
                        isPendingPayment ? "bg-amber-500" : "bg-green",
                      )}
                    >
                      <Check className="h-10 w-10" />
                    </motion.div>
                    <h2 className="font-serif text-3xl font-bold">
                      {isConfirmActive
                        ? "You're in 🎉"
                        : isPendingVerification
                          ? "Payment received — pending verification"
                          : isPendingPayment
                            ? "You're registered"
                            : "Registration created"}
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                      {isConfirmActive
                        ? "Your e-ticket is ready. See you in Kigali on 13 August 2026."
                        : isPendingVerification
                          ? "We've received your payment. The registration desk will verify your document and activate your pass shortly."
                          : isPendingPayment
                            ? regKind === "group"
                              ? `Group registrations are set up for ${groupSize} delegates. Each person pays separately from their dashboard to activate their pass.`
                              : `Your seat is reserved. Pay ${finalRegistration ? registrationDisplayAmount(finalRegistration, currency, exchangeRate) : formatPrice(picked?.usd ?? 0, currency, exchangeRate)} to activate your e-ticket.${paymentDeadline ? ` Complete payment by ${paymentDeadline}.` : ""}`
                            : "Check your email for next steps."}
                    </p>

                    {isPendingPayment && registrationId && regKind === "individual" && (
                      <div className="mt-8 max-w-lg mx-auto text-left">
                        {!showPayment ? (
                          <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm">Ready to pay?</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Pay now with mobile money or bank transfer, or do it later from your dashboard.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPayment(true)}
                            >
                              Pay now
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="font-serif font-bold mb-4 text-center">Pay now (optional)</h3>
                            <RegistrationPaymentForm
                              registrationId={registrationId}
                              defaultPhone={form.phone}
                              onPaid={handlePaymentComplete}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {isPendingPayment && registrationId && regKind === "group" && (
                      <div className="mt-8 max-w-lg mx-auto text-left rounded-2xl border border-border bg-secondary/40 p-5">
                        <p className="font-semibold text-sm">Pay for your own pass</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                          As group representative, you can pay for your registration now. Other delegates pay from their
                          accounts.
                        </p>
                        {!showPayment ? (
                          <Button variant="outline" size="sm" onClick={() => setShowPayment(true)}>
                            Pay for my pass
                          </Button>
                        ) : (
                          <RegistrationPaymentForm
                            registrationId={registrationId}
                            defaultPhone={form.phone}
                            onPaid={handlePaymentComplete}
                          />
                        )}
                      </div>
                    )}

                    {isConfirmActive && finalRegistration?.qrData && (
                      <div className="mt-8">
                        <TicketQr value={finalRegistration.qrData} />
                        <p className="text-xs text-muted-foreground mt-2">Show this QR at the registration desk.</p>
                      </div>
                    )}

                    <div className="mt-8 rounded-2xl bg-secondary/60 border border-border p-5 max-w-md mx-auto text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">Next steps</span>
                      </div>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 list-disc pl-5">
                        <li>Your e-ticket and QR live in your attendee dashboard</li>
                        <li>Build your personal agenda from the programme</li>
                        <li>Watch your inbox for symposium updates</li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mt-8">
                      <Button onClick={() => router.push("/dashboard/ticket")} className="gradient-blue text-accent-foreground">
                        {isPendingPayment ? "Pay later — go to dashboard" : "Go to dashboard"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([buildEventICS()], { type: "text/calendar;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "nas-2026.ics";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" /> Add to Calendar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (navigator.share)
                            navigator.share({ title: "I'm attending NAS 2026", url: window.location.origin }).catch(() => {});
                          else {
                            navigator.clipboard.writeText(window.location.origin);
                            toast.success("Link copied");
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-1" /> Share I&apos;m Attending
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nav buttons */}
            {phase === "wizard" && (
              <div className="flex items-center justify-between mt-6">
                <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                {step < reviewStep ? (
                  <Button onClick={handleNext} disabled={submitting} className="gradient-blue text-accent-foreground">
                    {submitting ? "Please wait…" : "Continue"} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteRegistration}
                    disabled={submitting}
                    className="gradient-blue text-accent-foreground"
                  >
                    {submitting ? "Saving…" : "Complete registration"} <Check className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
