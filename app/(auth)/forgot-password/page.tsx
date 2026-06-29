"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Leaf, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/api/useAuthSession";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPassword.isPending) return;
    try {
      await forgotPassword.mutateAsync({ email: email.trim() });
      setSent(true);
      toast.success("Reset link sent if the account exists.");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl gradient-navy text-white flex items-center justify-center"><Leaf className="h-4 w-4" /></div>
          <div className="font-serif font-bold">NAS 2026</div>
        </Link>
        <h1 className="font-serif text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sent ? "Check your email for password recovery instructions." : "Enter your email and we'll send a reset link."}
        </p>

        {sent ? (
          <div className="mt-6 p-4 rounded-2xl border border-green/20 bg-green/5 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green text-white flex items-center justify-center mb-3">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Verification email sent!</p>
            <p className="text-xs text-muted-foreground mt-1">We sent a recovery link to <strong>{email}</strong>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={forgotPassword.isPending} className="w-full gradient-blue text-accent-foreground">
              {forgotPassword.isPending ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending…</>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <Button asChild variant="ghost" size="sm" className="mt-6 w-full">
          <Link href="/login"><ArrowLeft className="h-4 w-4 mr-1" /> Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
