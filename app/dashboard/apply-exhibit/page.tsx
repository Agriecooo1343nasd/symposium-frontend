"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import {
    patchStore, uid, calculateOrgPackageFee,
    type OrgType, type ParticipationType, type SponsorshipTier, type Booth,
} from "@/lib/store";
import { ExhibitorPackageEstimator } from "@/components/apply/ExhibitorPackageEstimator";
import { BoothMapPicker } from "@/components/shared/BoothMapPicker";
import { toast } from "sonner";

export default function ApplyExhibitPage() {
    const router = useRouter();
    const store = useStore();
    const { session } = useAuth();

    const [org, setOrg] = useState({
        companyName: "",
        orgType: "company" as OrgType,
        website: "",
        description: "",
        contactName: session?.name ?? "",
        contactEmail: session?.email ?? "",
        contactPhone: "",
        participation: "exhibitor" as ParticipationType,
        sponsorshipTier: "Silver" as SponsorshipTier,
        boothPreference: "",
        preferredBoothId: "",
    });
    const [staffCount, setStaffCount] = useState(2);
    const [pickedBooth, setPickedBooth] = useState<Booth | null>(null);

    const handleBoothPick = (b: Booth) => {
        setPickedBooth(b);
        setOrg((p) => ({ ...p, preferredBoothId: b.id, boothPreference: b.code }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const quote = calculateOrgPackageFee(org.participation, org.sponsorshipTier, staffCount, store);
        patchStore((s) => ({
            ...s,
            organizationApplications: [
                {
                    id: uid("oa"),
                    ...org,
                    staffCount,
                    quotedFeeUsd: quote.feeUsd,
                    status: "pending",
                    paymentStatus: "unpaid",
                    submittedAt: new Date().toISOString().slice(0, 10),
                },
                ...s.organizationApplications,
            ],
        }));
        toast.success("Application submitted — secretariat reviews within 3 business days");
        router.push("/dashboard");
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Store className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold leading-tight">Apply to exhibit or sponsor</h1>
                    <p className="text-muted-foreground text-sm">Reviewed by the admin team within 3 business days. Invoice issued on approval.</p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">

                {/* Package estimator */}
                <div className="rounded-2xl bg-card border border-border p-6">
                    <ExhibitorPackageEstimator
                        store={store}
                        participation={org.participation}
                        tier={org.sponsorshipTier}
                        staffCount={staffCount}
                        onStaffCountChange={setStaffCount}
                    />
                </div>

                {/* Participation + tier */}
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                    <h2 className="font-serif font-bold">Package details</h2>
                    <div>
                        <Label>Participation type *</Label>
                        <Select value={org.participation}
                            onValueChange={(v) => setOrg({ ...org, participation: v as ParticipationType })}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="exhibitor">Exhibitor only</SelectItem>
                                <SelectItem value="sponsor">Sponsor only</SelectItem>
                                <SelectItem value="both">Exhibitor + Sponsor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {(org.participation === "sponsor" || org.participation === "both") && (
                        <div>
                            <Label>Sponsorship tier *</Label>
                            <Select value={org.sponsorshipTier}
                                onValueChange={(v) => setOrg({ ...org, sponsorshipTier: v as SponsorshipTier })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {store.sponsorshipTiers.map((t) => (
                                        <SelectItem key={t.tier} value={t.tier}>
                                            {t.tier} — ${t.baseFeeUsd.toLocaleString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 rounded-lg bg-secondary/60 p-3 text-xs space-y-0.5">
                                {store.sponsorshipTiers
                                    .find((t) => t.tier === org.sponsorshipTier)
                                    ?.benefits.map((b) => <div key={b}>• {b}</div>)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Organisation info */}
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                    <h2 className="font-serif font-bold">Organisation details</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Label>Company name *</Label>
                            <Input required placeholder="Organization legal name" value={org.companyName}
                                onChange={(e) => setOrg({ ...org, companyName: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                            <Label>Organization type</Label>
                            <Select value={org.orgType} onValueChange={(v) => setOrg({ ...org, orgType: v as OrgType })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(["startup", "ngo", "university", "research", "company"] as const).map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input placeholder="https://www.example.org" value={org.website}
                                onChange={(e) => setOrg({ ...org, website: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                            <Label>Contact name *</Label>
                            <Input required placeholder="Primary contact" value={org.contactName}
                                onChange={(e) => setOrg({ ...org, contactName: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                            <Label>Contact email *</Label>
                            <Input required type="email" placeholder="contact@company.com" value={org.contactEmail}
                                onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Contact phone</Label>
                            <Input placeholder="+250 788 000 000" value={org.contactPhone}
                                onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Description *</Label>
                            <Textarea required rows={3} placeholder="What will you showcase at NAS 2026?"
                                value={org.description}
                                onChange={(e) => setOrg({ ...org, description: e.target.value })} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* Booth map picker */}
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                    <div>
                        <h2 className="font-serif font-bold">Choose a preferred booth</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Click an available (green) booth to express your preference. The secretariat assigns
                            final positions on approval. Occupied and reserved booths cannot be selected.
                        </p>
                    </div>

                    <BoothMapPicker
                        booths={store.booths}
                        mode="pick"
                        selectedId={pickedBooth?.id}
                        onSelect={handleBoothPick}
                    />

                    {pickedBooth ? (
                        <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            <span>
                                Preferred: <strong className="font-mono">{pickedBooth.code}</strong>
                                {pickedBooth.location && <span className="text-muted-foreground"> · {pickedBooth.location}</span>}
                                {pickedBooth.dimensions && <span className="text-muted-foreground"> · {pickedBooth.dimensions}</span>}
                            </span>
                            <button
                                type="button"
                                onClick={() => { setPickedBooth(null); setOrg((p) => ({ ...p, preferredBoothId: "", boothPreference: "" })); }}
                                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
                            >
                                Clear
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No booth selected — you can submit with no preference.</p>
                    )}

                    <div>
                        <Label>Additional notes (optional)</Label>
                        <Input value={org.boothPreference}
                            onChange={(e) => setOrg({ ...org, boothPreference: e.target.value })}
                            className="mt-1" placeholder="Near entrance, digital zone, corner booth…" />
                    </div>
                </div>

                <Button type="submit" className="gradient-blue text-accent-foreground w-full sm:w-auto">
                    Submit application
                </Button>
            </form>
        </div>
    );
}
