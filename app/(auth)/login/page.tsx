"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/api/useAuthSession";
import { dashboardPathForRole } from "@/lib/auth";
import { resolveLegacyRole } from "@/lib/api/mappers/role";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

// Demo credentials (6 canonical roles from backend)
const DEMO_CREDENTIALS = [
    { role: "Admin", email: "admin@nas2026.rw", password: "Admin123!" },
    { role: "Registration Desk", email: "desk@nas2026.rw", password: "TestPass123!" },
    { role: "Moderator", email: "moderator@nas2026.rw", password: "TestPass123!" },
    { role: "Attendee", email: "attendee@nas2026.rw", password: "TestPass123!" },
    { role: "Speaker", email: "speaker@nas2026.rw", password: "TestPass123!" },
    { role: "Exhibitor", email: "exhibitor@nas2026.rw", password: "TestPass123!" },
];

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const autofillDemo = (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (login.isPending) return;
        try {
            const { roles } = await login.mutateAsync({ email: email.trim(), password });
            toast.success("Welcome back!");
            const next = searchParams.get("next");
            router.push(next || dashboardPathForRole(resolveLegacyRole(roles)));
        } catch (error) {
            toast.error(apiErrorMessage(error));
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left branding panel */}
            <div className="hidden lg:flex gradient-navy grain-overlay text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 leaf-texture opacity-60" />
                <Link href="/" className="relative flex items-center gap-2 z-10">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Leaf className="h-5 w-5" />
                    </div>
                    <div className="font-serif font-bold text-lg">NAS 2026</div>
                </Link>
                <div className="relative z-10">
                    <h1 className="font-serif text-4xl font-bold leading-tight">
                        &quot;The future of food systems is being written in Kigali this August.&quot;
                    </h1>
                    <p className="mt-4 text-white/80">
                        Welcome to the official NAS 2026 portal — your gateway to sessions, networking, and conference resources.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-white/50">© 2026 NAS Secretariat</div>
            </div>

            {/* Right sign-in panel */}
            <div className="flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="h-9 w-9 rounded-xl gradient-navy text-white flex items-center justify-center">
                            <Leaf className="h-4 w-4" />
                        </div>
                        <div className="font-serif font-bold">NAS 2026</div>
                    </Link>

                    <h2 className="font-serif text-3xl font-bold">Sign in</h2>
                    <p className="text-muted-foreground mt-1">Access your conference portal.</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <div>
                            <Label>Email</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-9"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <Label>Password</Label>
                                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-9 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full gradient-blue text-accent-foreground"
                        >
                            {login.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in <ArrowRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Not registered yet?{" "}
                        <Link href="/register" className="text-accent font-semibold hover:underline">
                            Get your pass
                        </Link>
                    </p>

                    {/* Demo credentials for development/testing */}
                    <div className="mt-10 pt-8 border-t">
                        <p className="text-xs text-muted-foreground mb-3 font-semibold">Demo accounts (testing):</p>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_CREDENTIALS.map((cred) => (
                                <button
                                    key={cred.email}
                                    type="button"
                                    onClick={() => autofillDemo(cred.email, cred.password)}
                                    className="px-3 py-2 rounded-lg border border-muted-foreground/20 hover:bg-muted text-xs transition-colors text-left"
                                    title={`${cred.role}: ${cred.email}`}
                                >
                                    <div className="font-semibold text-foreground">{cred.role}</div>
                                    <div className="text-muted-foreground truncate">{cred.email}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
