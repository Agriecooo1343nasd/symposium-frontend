"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, dashboardPathForRole } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = signIn("attendee");
    toast.success("Welcome back!");
    router.push(dashboardPathForRole(session.role));
  };

  const demoLogin = (
    role: "attendee" | "admin" | "registration_desk" | "moderator" | "exhibitor" | "speaker",
  ) => {
    const session = signIn(role);
    toast.success(`Signed in as ${role}`);
    router.push(dashboardPathForRole(session.role));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex gradient-navy grain-overlay text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-60" />
        <Link href="/" className="relative flex items-center gap-2 z-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><Leaf className="h-5 w-5" /></div>
          <div className="font-serif font-bold text-lg">NAS 2026</div>
        </Link>
        <div className="relative z-10">
          <h1 className="font-serif text-4xl font-bold leading-tight">&quot;The future of food systems is being written in Kigali this August.&quot;</h1>
          <p className="mt-4 text-white/80">Welcome to the official attendee portal — your gateway to sessions, networking, and conference resources.</p>
        </div>
        <div className="relative z-10 text-xs text-white/50">© 2026 NAS Secretariat</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-navy text-white flex items-center justify-center"><Leaf className="h-4 w-4" /></div>
            <div className="font-serif font-bold">NAS 2026</div>
          </Link>
          <h2 className="font-serif text-3xl font-bold">Sign in</h2>
          <p className="text-muted-foreground mt-1">Access your attendee dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label>Password</Label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot?</Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input required type="password" placeholder="••••••••" className="pl-9" />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-blue text-accent-foreground">
              Sign in <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Demo accounts</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                ["attendee", "admin", "registration_desk", "moderator", "exhibitor", "speaker"] as const
              ).map((r) => (
                <Button key={r} variant="outline" size="sm" onClick={() => demoLogin(r)} className="capitalize text-xs">
                  {r.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Not registered yet? <Link href="/register" className="text-accent font-semibold hover:underline">Get your pass</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
