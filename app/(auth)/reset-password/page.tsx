"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findStaffByInviteToken, patchStore } from "@/lib/store";
import { signIn } from "@/lib/auth";
import { useResetPassword } from "@/hooks/api/useAuthSession";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const staff = token ? findStaffByInviteToken(token) : undefined;
  const resetPassword = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    // Exhibitor staff invite onboarding (local flow until exhibitor sprint).
    if (token && staff) {
      patchStore((s) => ({
        ...s,
        exhibitorStaff: s.exhibitorStaff.map((x) =>
          x.inviteToken === token ? { ...x, status: "Confirmed" as const, inviteToken: undefined } : x
        ),
      }));
      signIn("attendee", { name: staff.name, email: staff.email, category: "Exhibitor Staff Pass" });
      toast.success("Account activated — welcome to NAS 2026");
      router.push("/dashboard");
      return;
    }

    if (!token) return toast.error("Missing or invalid reset link. Request a new one.");

    try {
      await resetPassword.mutateAsync({ token, newPassword: password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="mx-auto h-16 w-16 text-green flex items-center justify-center">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="font-serif text-2xl font-bold">Password Reset Complete</h2>
        <p className="text-muted-foreground text-sm">Your password has been successfully reset. You can now log in with your new password.</p>
        <Button asChild className="w-full gradient-blue text-accent-foreground">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-bold">Set your password</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {staff ? `Hi ${staff.name} — set a password for your ${staff.role} pass.` : "Set a new secure password for your account."}
        </p>
      </div>
      <div>
        <Label>New password</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="password" required placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div>
        <Label>Confirm password</Label>
        <Input type="password" required placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" />
      </div>
      <Button type="submit" disabled={resetPassword.isPending} className="w-full gradient-blue text-accent-foreground">
        {resetPassword.isPending ? (
          <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Resetting…</>
        ) : staff ? (
          "Reset & Sign In"
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex gradient-navy text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-60" />
        <div className="relative flex items-center gap-2 z-10">
          <Leaf className="h-6 w-6" />
          <span className="font-serif font-bold text-lg">NAS 2026</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold">Secure your account</h1>
          <p className="mt-3 text-white/80">
            Keep your attendee credentials secure to protect your e-ticket and networking data.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/50">© 2026 NAS Secretariat</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
