import type { SubTheme } from "./mock-data";
import {
  appendAudit,
  calculateOrgPackageFee,
  patchStore,
  uid,
  type OrganizationApplication,
  type PresentationType,
} from "./store";
import { loadStore } from "./store";
import type { CreateSpeakerInput } from "./create-speaker";

export type UpdateSpeakerInput = Partial<CreateSpeakerInput> & { applicationId?: string; email: string };

export function updateSpeakerOnboarding(
  input: UpdateSpeakerInput,
  actorName: string,
): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const store = loadStore();
  const app = store.speakerApplications.find((a) => a.email.toLowerCase() === email);
  const reg = store.registrations.find((r) => r.email.toLowerCase() === email);
  const profile = store.speakerProfiles.find((p) => p.email?.toLowerCase() === email);
  if (!app && !reg) return { ok: false, error: "No speaker record found for this email" };

  patchStore((s) => {
    const name = input.fullName?.trim() ?? app?.name ?? reg?.name ?? "";
    return {
      ...s,
      registrations: s.registrations.map((r) => {
        if (r.email.toLowerCase() !== email) return r;
        const baseDetails = r.details ?? {
          ticketId: `NAS26-${r.id.toUpperCase()}`,
          title: "",
          org: "",
          phone: "",
          dietary: "",
          access: "",
          hear: "",
          linkedin: "",
          interests: [],
          paymentMethod: "manual",
        };
        return {
          ...r,
          name: name || r.name,
          country: input.country?.trim() ?? r.country,
          categoryId: input.ticketPlanId ?? r.categoryId,
          category: s.ticketPlans.find((t) => t.id === (input.ticketPlanId ?? r.categoryId))?.name ?? r.category,
          details: {
            ...baseDetails,
            title: input.jobTitle?.trim() ?? baseDetails.title,
            org: input.org?.trim() ?? baseDetails.org,
            phone: input.phone?.trim() ?? baseDetails.phone,
            dietary: input.dietary?.trim() ?? baseDetails.dietary,
            access: input.access?.trim() ?? baseDetails.access,
            hear: input.hear?.trim() ?? baseDetails.hear,
            linkedin: input.linkedin?.trim() ?? baseDetails.linkedin,
            interests: input.interests ?? baseDetails.interests,
          },
        };
      }),
      speakerApplications: s.speakerApplications.map((a) =>
        a.email.toLowerCase() !== email
          ? a
          : {
              ...a,
              name: name || a.name,
              phone: input.phone?.trim() ?? a.phone,
              country: input.country?.trim() ?? a.country,
              about: input.about?.trim() ?? a.about,
              title: input.presentationTitle?.trim() ?? a.title,
              summary: input.summary?.trim() ?? a.summary,
              presentationType: (input.presentationType ?? a.presentationType) as PresentationType,
              photoUrl: input.photoUrl?.trim() || a.photoUrl,
              documentName: input.documentName ?? a.documentName,
              documentDataUrl: input.documentDataUrl ?? a.documentDataUrl,
            },
      ),
      speakerProfiles: s.speakerProfiles.map((p) =>
        p.email?.toLowerCase() !== email
          ? p
          : {
              ...p,
              name: name || p.name,
              title: input.jobTitle?.trim() ?? p.title,
              org: input.org?.trim() ?? p.org,
              country: input.country?.trim() ?? p.country,
              bio: input.about?.trim() ?? p.bio,
              photo: input.photoUrl?.trim() || p.photo,
            },
      ),
      users: s.users.map((u) =>
        u.email.toLowerCase() === email ? { ...u, name: name || u.name } : u,
      ),
    };
  });

  appendAudit(actorName, "Updated speaker onboarding", email);
  return { ok: true };
}

export type UpdateOrganizationInput = {
  applicationId: string;
  companyName?: string;
  orgType?: OrganizationApplication["orgType"];
  website?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  participation?: OrganizationApplication["participation"];
  sponsorshipTier?: OrganizationApplication["sponsorshipTier"];
  packageId?: string;
  staffCount?: number;
  staffEmails?: string[];
  boothAssignment?: string;
  boothPreference?: string;
  ticketPlanId?: string;
  contactCountry?: string;
  contactJobTitle?: string;
  speakingSlot?: string;
  sponsorshipContractRef?: string;
};

export function updateOrganizationOnboarding(
  input: UpdateOrganizationInput,
  actorName: string,
): { ok: true } | { ok: false; error: string } {
  const store = loadStore();
  const app = store.organizationApplications.find((a) => a.id === input.applicationId);
  if (!app) return { ok: false, error: "Application not found" };

  const contactEmail = (input.contactEmail ?? app.contactEmail).trim().toLowerCase();
  const staffEmails = input.staffEmails
    ? [...new Set(input.staffEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))]
    : app.staffMemberEmails;

  patchStore((s) => {
    const participation = input.participation ?? app.participation;
    const tier = input.sponsorshipTier ?? app.sponsorshipTier;
    const staffCount = input.staffCount ?? app.staffCount ?? 2;
    const quote = calculateOrgPackageFee(participation, tier, staffCount, s);
    const org = s.approvedOrganizations.find((o) => o.applicationId === app.id);

    const nextApp: OrganizationApplication = {
      ...app,
      companyName: input.companyName?.trim() ?? app.companyName,
      orgType: input.orgType ?? app.orgType,
      website: input.website?.trim() ?? app.website,
      description: input.description?.trim() ?? app.description,
      contactName: input.contactName?.trim() ?? app.contactName,
      contactEmail,
      contactPhone: input.contactPhone?.trim() ?? app.contactPhone,
      participation,
      sponsorshipTier: tier,
      packageId: input.packageId ?? app.packageId,
      staffCount,
      staffMemberEmails: staffEmails,
      quotedFeeUsd: quote.feeUsd,
      boothAssignment: input.boothAssignment?.trim() ?? app.boothAssignment,
      boothPreference: input.boothPreference?.trim() ?? app.boothPreference,
    };

    let exhibitorStaff = s.exhibitorStaff;
    if (org && staffEmails) {
      const existing = s.exhibitorStaff.filter((st) => st.orgId === org.id);
      const kept = existing.filter((st) => staffEmails.includes(st.email.toLowerCase()));
      const added = staffEmails
        .filter((e) => !existing.some((st) => st.email.toLowerCase() === e))
        .map((e, i) => ({
          id: uid("st"),
          orgId: org.id,
          name: e.split("@")[0].replace(/[._-]/g, " "),
          email: e,
          role: "Staff",
          status: "Invited" as const,
          inviteToken: `invite-${org.id}-${i}`,
        }));
      exhibitorStaff = [
        ...s.exhibitorStaff.filter((st) => st.orgId !== org.id),
        ...kept,
        ...added,
      ];
    }

    return {
      ...s,
      organizationApplications: s.organizationApplications.map((a) => (a.id === app.id ? nextApp : a)),
      approvedOrganizations: s.approvedOrganizations.map((o) =>
        o.applicationId !== app.id
          ? o
          : {
              ...o,
              name: nextApp.companyName,
              participation: nextApp.participation,
              sponsorshipTier: nextApp.sponsorshipTier,
              booth: nextApp.boothAssignment ?? o.booth,
              category: nextApp.orgType,
              description: nextApp.description,
              contact: contactEmail,
              speakingSlot: input.speakingSlot !== undefined ? input.speakingSlot.trim() || undefined : o.speakingSlot,
              sponsorshipContractRef:
                input.sponsorshipContractRef !== undefined
                  ? input.sponsorshipContractRef.trim() || undefined
                  : o.sponsorshipContractRef,
            },
      ),
      registrations: s.registrations.map((r) => {
        if (r.email.toLowerCase() !== app.contactEmail.toLowerCase()) return r;
        const baseDetails = r.details ?? {
          ticketId: `NAS26-${r.id.toUpperCase()}`,
          title: "",
          org: "",
          phone: "",
          dietary: "",
          access: "",
          hear: "",
          linkedin: "",
          interests: [],
          paymentMethod: "manual",
        };
        return {
          ...r,
          name: nextApp.contactName,
          email: contactEmail,
          country: input.contactCountry?.trim() ?? r.country,
          categoryId: input.ticketPlanId ?? r.categoryId,
          category: s.ticketPlans.find((t) => t.id === (input.ticketPlanId ?? r.categoryId))?.name ?? r.category,
          details: {
            ...baseDetails,
            title: input.contactJobTitle?.trim() ?? baseDetails.title,
            org: nextApp.companyName,
            phone: nextApp.contactPhone,
          },
        };
      }),
      exhibitorStaff,
    };
  });

  appendAudit(actorName, "Updated organization onboarding", app.companyName);
  return { ok: true };
}

export function speakerInputFromStore(email: string): Partial<CreateSpeakerInput> | null {
  const store = loadStore();
  const key = email.toLowerCase();
  const app = store.speakerApplications.find((a) => a.email.toLowerCase() === key);
  const reg = store.registrations.find((r) => r.email.toLowerCase() === key);
  if (!app && !reg) return null;
  return {
    ticketPlanId: reg?.categoryId ?? "",
    fullName: app?.name ?? reg?.name ?? "",
    jobTitle: reg?.details?.title ?? "",
    org: reg?.details?.org ?? "",
    country: app?.country ?? reg?.country ?? "",
    email: app?.email ?? reg?.email ?? email,
    phone: app?.phone ?? reg?.details?.phone ?? "",
    dietary: reg?.details?.dietary ?? "",
    access: reg?.details?.access ?? "",
    hear: reg?.details?.hear ?? "",
    linkedin: reg?.details?.linkedin ?? "",
    interests: (reg?.details?.interests ?? []) as SubTheme[],
    about: app?.about ?? "",
    presentationTitle: app?.title ?? "",
    summary: app?.summary ?? "",
    presentationType: app?.presentationType ?? "Panel",
    photoUrl: app?.photoUrl ?? "",
    documentName: app?.documentName,
    documentDataUrl: app?.documentDataUrl,
  };
}
