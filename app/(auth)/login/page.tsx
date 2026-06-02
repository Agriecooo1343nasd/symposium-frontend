"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Leaf, Mail, Lock, ArrowRight, Store, Sparkles,
    LayoutDashboard, Mic, MonitorPlay, Clipboard, UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, dashboardPathForRole } from "@/lib/auth";
import { loadStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MockSession } from "@/lib/mock-data";

type DemoVariant = {
    label: string;
    icon: React.ElementType;
    role: MockSession["role"];
    participation?: MockSession["participation"];
    groupDemo?: "representative" | "member";
    description: string;
    color: string;
};

const DEMO_VARIANTS: DemoVariant[] = [
    {
        label: "Attendee",
        icon: LayoutDashboard,
        role: "attendee",
        description: "Schedule, networking, e-ticket",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Group representative",
        icon: UsersRound,
        role: "attendee",
        groupDemo: "representative",
        description: "Delegation roster & check-in tracking",
        color: "border-emerald-300/60 hover:border-emerald-400 bg-emerald-50/40",
    },
    {
        label: "Group member",
        icon: UsersRound,
        role: "attendee",
        groupDemo: "member",
        description: "Individual ticket within a group",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Exhibitor",
        icon: Store,
        role: "exhibitor",
        participation: "exhibitor",
        description: "Booth, leads, materials",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Sponsor",
        icon: Sparkles,
        role: "exhibitor",
        participation: "sponsor",
        description: "Sponsorship, invoices, branding",
        color: "border-amber-300/60 hover:border-amber-400 bg-amber-50/30",
    },
    {
        label: "Exhibitor + Sponsor",
        icon: Store,
        role: "exhibitor",
        participation: "both",
        description: "Full booth + sponsorship access",
        color: "border-amber-300/60 hover:border-amber-400 bg-amber-50/30",
    },
    {
        label: "Speaker",
        icon: Mic,
        role: "speaker",
        description: "Sessions, abstracts, AV prep",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Moderator",
        icon: MonitorPlay,
        role: "moderator",
        description: "Run-of-show, queue, Zoom",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Reg. Desk",
        icon: Clipboard,
        role: "registration_desk",
        description: "Check-in, applications",
        color: "border-border hover:border-accent/60",
    },
    {
        label: "Admin",
        icon: LayoutDashboard,
        role: "admin",
        description: "Full platform management",
        color: "border-blue/30 hover:border-blue/60 bg-blue/5",
    },
];

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const session = signIn("attendee");
        toast.success("Welcome back!");
        router.push(dashboardPathForRole(session.role));
    };

    const demoLogin = (variant: DemoVariant) => {
        if (variant.groupDemo === "representative") {
            const store = loadStore();
            const group = store.groupRegistrations[0];
            const rep = store.registrations.find((r) => r.id === group?.representativeRegistrationId);
            const session = signIn("attendee", {
                name: rep?.name ?? "John Okello",
                email: rep?.email ?? "j.okello@example.ug",
                category: rep?.category ?? "NGO / CSO / Private Sector",
                ticketId: rep?.details?.ticketId ?? "NAS26-R2-1001",
                isGroupRepresentative: true,
                groupId: group?.id,
            });
            toast.success(`Signed in as ${variant.label}`);
            router.push(dashboardPathForRole(session.role));
            return;
        }
        if (variant.groupDemo === "member") {
            const store = loadStore();
            const member = store.registrations.find((r) => r.groupRole === "member" && r.groupId);
            const session = signIn("attendee", {
                name: member?.name ?? "Grace Mukamana",
                email: member?.email ?? "grace.mukamana@coop.rw",
                category: member?.category ?? "NGO / CSO / Private Sector",
                ticketId: member?.details?.ticketId ?? "NAS26-GRP-2003",
                groupId: member?.groupId,
            });
            toast.success(`Signed in as ${variant.label}`);
            router.push(dashboardPathForRole(session.role));
            return;
        }
        const session = signIn(variant.role, { participation: variant.participation });
        toast.success(`Signed in as ${variant.label}`);
        router.push(dashboardPathForRole(session.role));
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
                                <Input required type="password" placeholder="••••••••" className="pl-9" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full gradient-blue text-accent-foreground">
                            Sign in <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            Demo accounts
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Choose a role to explore its portal. No password needed.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_VARIANTS.map((v) => (
                                <button
                                    key={v.label}
                                    type="button"
                                    onClick={() => demoLogin(v)}
                                    className={cn(
                                        "text-left rounded-xl border p-3 transition-all hover-lift",
                                        v.color,
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* <v.icon className="h-3.5 w-3.5 text-accent flex-shrink-0" /> */}
                                        <span className="text-xs font-semibold">{v.label}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-tight">{v.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Not registered yet?{" "}
                        <Link href="/register" className="text-accent font-semibold hover:underline">
                            Get your pass
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
