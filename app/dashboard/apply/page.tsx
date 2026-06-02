"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { patchStore, uid, type PresentationType } from "@/lib/store";
import { toast } from "sonner";

export default function ApplySpeakerPage() {
    const router = useRouter();
    const store = useStore();
    const { session } = useAuth();
    const canApply = !!store.registrations.find(
        (r) => r.email === session?.email && r.status === "paid",
    );

    const [form, setForm] = useState({
        name: session?.name ?? "",
        email: session?.email ?? "",
        phone: "",
        country: "Rwanda",
        about: "",
        title: "",
        summary: "",
        presentationType: "Panel" as PresentationType,
        photoUrl: "",
        documentName: "",
        documentDataUrl: "",
    });

    const readFile = (file: File, cb: (n: string, d: string) => void) => {
        const r = new FileReader();
        r.onload = () => cb(file.name, r.result as string);
        r.readAsDataURL(file);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canApply) return toast.error("Paid registration required.");
        patchStore((s) => ({
            ...s,
            speakerApplications: [
                { id: uid("sa"), ...form, status: "pending", submittedAt: new Date().toISOString().slice(0, 10) },
                ...s.speakerApplications,
            ],
        }));
        toast.success("Speaker application submitted — the programme committee will be in touch");
        router.push("/dashboard");
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl gradient-blue text-accent-foreground flex items-center justify-center">
                    <Mic className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold leading-tight">Apply to speak</h1>
                    <p className="text-muted-foreground text-sm">Reviewed by the programme committee within 10 business days.</p>
                </div>
            </div>

            {!canApply && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
                    You need a confirmed paid registration before applying to speak.{" "}
                    <a href="/register" className="font-semibold underline">Register now</a>
                </div>
            )}

            <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Full name *</Label>
                        <Input required placeholder="Jean Uwimana" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                        <Label>Email *</Label>
                        <Input required type="email" placeholder="name@org.rw" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                        <Label>Phone *</Label>
                        <Input required placeholder="+250 788 000 000" value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                        <Label>Country *</Label>
                        <Input required placeholder="Rwanda" value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" />
                    </div>
                </div>

                <div>
                    <Label>Profile photo</Label>
                    <Input type="file" accept="image/*" className="mt-1"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) readFile(f, (_n, d) => setForm({ ...form, photoUrl: d }));
                        }} />
                </div>

                <div>
                    <Label>About you *</Label>
                    <Textarea required rows={3}
                        placeholder="Brief professional background for the programme committee…"
                        value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="mt-1" />
                </div>

                <div>
                    <Label>Presentation title *</Label>
                    <Input required placeholder="Proposed title" value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
                </div>

                <div>
                    <Label>Abstract summary *</Label>
                    <Textarea required rows={4} placeholder="Max 300 words…"
                        value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="mt-1" />
                </div>

                <div>
                    <Label>Presentation type *</Label>
                    <Select value={form.presentationType}
                        onValueChange={(v) => setForm({ ...form, presentationType: v as PresentationType })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {(["Keynote", "Panel", "Workshop", "Poster"] as const).map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Abstract document (PDF) *</Label>
                    <Input type="file" accept=".pdf,image/*" required className="mt-1"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) readFile(f, (n, d) => setForm({ ...form, documentName: n, documentDataUrl: d }));
                        }} />
                </div>

                <Button type="submit" disabled={!canApply} className="gradient-blue text-accent-foreground">
                    Submit speaker application
                </Button>
            </form>
        </div>
    );
}
