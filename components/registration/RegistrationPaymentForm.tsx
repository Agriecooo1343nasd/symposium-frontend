"use client";

import { useState } from "react";
import { Building2, CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBankTransfer, useInitiatePayment } from "@/hooks/api/useRegistration";
import { apiErrorMessage } from "@/lib/api/client";
import type { PaymentProvider } from "@/lib/api/dto";
import { cn } from "@/lib/utils";

function normalizeRwandanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250")) return digits;
  if (digits.startsWith("0")) return `250${digits.slice(1)}`;
  if (digits.length === 9) return `250${digits}`;
  return digits;
}

type RegistrationPaymentFormProps = {
  registrationId: string;
  defaultPhone?: string;
  onPaid?: () => void;
  className?: string;
};

export function RegistrationPaymentForm({
  registrationId,
  defaultPhone = "",
  onPaid,
  className,
}: RegistrationPaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [momoPhone, setMomoPhone] = useState(defaultPhone);
  const initiatePayment = useInitiatePayment();
  const bankTransfer = useBankTransfer();
  const submitting = initiatePayment.isPending || bankTransfer.isPending;

  const handleMobilePay = async (provider: PaymentProvider) => {
    const phone = normalizeRwandanPhone(momoPhone);
    if (!/^250\d{9}$/.test(phone)) {
      toast.error("Enter a valid Rwandan number, e.g. 0788123456.");
      return;
    }
    try {
      const res = await initiatePayment.mutateAsync({ registrationId, provider, phone });
      if (res.registrationCompleted) {
        toast.success("Payment confirmed");
      } else {
        toast.message(res.message ?? "Payment is processing — we'll confirm shortly.");
      }
      onPaid?.();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const handleBankTransfer = async () => {
    try {
      await bankTransfer.mutateAsync({ registrationId });
      toast.success("Proforma invoice generated — check your email.");
      onPaid?.();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto">
          <TabsTrigger value="momo" className="flex-col h-auto py-2 gap-1">
            <Smartphone className="h-4 w-4" />
            <span className="text-[11px]">MTN MoMo</span>
          </TabsTrigger>
          <TabsTrigger value="airtel" className="flex-col h-auto py-2 gap-1">
            <Smartphone className="h-4 w-4" />
            <span className="text-[11px]">Airtel Money</span>
          </TabsTrigger>
          <TabsTrigger value="card" className="flex-col h-auto py-2 gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-[11px]">Card</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex-col h-auto py-2 gap-1">
            <Building2 className="h-4 w-4" />
            <span className="text-[11px]">Bank Transfer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="momo" className="space-y-3 mt-4">
          <Label>MTN Mobile Money number</Label>
          <Input placeholder="0788 123 456" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} />
          <Button
            className="w-full gradient-blue text-accent-foreground"
            disabled={submitting}
            onClick={() => handleMobilePay("mtn")}
          >
            {submitting ? "Waiting for approval…" : "Pay with MTN MoMo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive a prompt on your phone to authorize the payment. This can take up to 2 minutes —
            keep this page open until you see a result.
          </p>
        </TabsContent>

        <TabsContent value="airtel" className="space-y-3 mt-4">
          <Label>Airtel Money number</Label>
          <Input placeholder="0730 123 456" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} />
          <Button
            className="w-full gradient-blue text-accent-foreground"
            disabled={submitting}
            onClick={() => handleMobilePay("airtel")}
          >
            {submitting ? "Waiting for approval…" : "Pay with Airtel Money"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Approve the prompt on your phone. This can take up to 2 minutes — keep this page open.
          </p>
        </TabsContent>

        <TabsContent value="card" className="mt-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Card payments aren&apos;t available online yet. Please use MTN MoMo, Airtel Money, or bank transfer. Card
            payment can be taken at the registration desk.
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-2 text-sm mt-4">
          <p className="text-muted-foreground">
            A proforma invoice will be emailed with the secretariat&apos;s bank details. Your pass activates once
            finance confirms your transfer.
          </p>
          <Button
            className="w-full gradient-blue text-accent-foreground mt-2"
            disabled={submitting}
            onClick={handleBankTransfer}
          >
            {submitting ? "Generating…" : "Generate Proforma Invoice"}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3 w-3" /> SSL Secured
        </span>
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Payments via ITEC Pay
        </span>
      </div>
    </div>
  );
}
