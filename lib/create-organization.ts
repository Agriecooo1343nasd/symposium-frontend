import {
  appendAudit,
  calculateOrgPackageFee,
  patchStore,
  uid,
  upgradeUserToExhibitor,
  type OrgType,
  type ParticipationType,
  type SponsorshipTier,
  type TicketPlan,
} from "./store";
import { loadStore } from "./store";
import { issueSponsorshipInvoice } from "./sponsorship-invoices";

export type CreateOrganizationInput = {
  ticketPlanId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  jobTitle: string;
  companyName: string;
  orgType: OrgType;
  website: string;
  description: string;
  participation: ParticipationType;
  sponsorshipTier?: SponsorshipTier;
  staffCount: number;
  staffEmails: string[];
  boothPreference?: string;
  preferredBoothId?: string;
  boothAssignment?: string;
  logoFileName?: string;
  /** When true (default for staff onboarding), creates approved org + portal access */
  approveImmediately?: boolean;
};

function normalizeEmails(emails: string[]) {
  return [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

function staffDisplayName(email: string) {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function validateCreateOrganizationInput(
  input: CreateOrganizationInput,
  plan: TicketPlan | undefined,
): string | null {
  if (!plan) return "Select a pass category for the primary contact";
  if (!input.companyName.trim()) return "Company name is required";
  if (!input.contactName.trim()) return "Contact name is required";
  if (!input.contactEmail.trim()) return "Contact email is required";
  if (!input.contactPhone.trim()) return "Contact phone is required";
  if (!input.description.trim()) return "Showcase description is required";
  if (input.staffCount < 1) return "Staff count must be at least 1";
  if (
    (input.participation === "sponsor" || input.participation === "both") &&
    !input.sponsorshipTier
  ) {
    return "Select a sponsorship tier";
  }
  const contact = input.contactEmail.trim().toLowerCase();
  const store = loadStore();
  if (store.organizationApplications.some((a) => a.contactEmail.toLowerCase() === contact && a.status !== "rejected")) {
    return "An organization application already exists for this contact email";
  }
  const staff = normalizeEmails(input.staffEmails);
  if (staff.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) return "One or more staff emails are invalid";
  return null;
}

export function createOrganizationManually(
  input: CreateOrganizationInput,
  actorName: string,
): { ok: true; applicationId: string } | { ok: false; error: string } {
  const store = loadStore();
  const plan = store.ticketPlans.find((t) => t.id === input.ticketPlanId);
  const err = validateCreateOrganizationInput(input, plan);
  if (err) return { ok: false, error: err };

  const approve = input.approveImmediately !== false;
  const email = input.contactEmail.trim().toLowerCase();
  const name = input.contactName.trim();
  const appId = uid("oa");
  const orgId = uid("org");
  const regId = uid("r");
  const now = new Date().toISOString().slice(0, 10);
  const staffEmails = normalizeEmails(input.staffEmails).filter((e) => e !== email);
  const quote = calculateOrgPackageFee(
    input.participation,
    input.sponsorshipTier,
    input.staffCount,
    store,
  );
  const preferred = input.preferredBoothId
    ? store.booths.find((b) => b.id === input.preferredBoothId)
    : null;
  const booth =
    input.boothAssignment?.trim() ||
    preferred?.code ||
    `B-${Math.floor(Math.random() * 20) + 1}`;
  const isSponsor = input.participation === "sponsor" || input.participation === "both";

  patchStore((s) => {
    const needsVerify = plan!.requiresVerification;
    const reg = {
      id: regId,
      name,
      email,
      country: input.country.trim(),
      category: plan!.name,
      categoryId: plan!.id,
      amountUsd: 0,
      status: "comp" as const,
      verificationStatus: needsVerify ? ("pending" as const) : ("none" as const),
      createdAt: now,
      certificateGranted: false,
      details: {
        ticketId: `NAS26-${regId.replace(/^r/, "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: input.jobTitle.trim(),
        org: input.companyName.trim(),
        phone: input.contactPhone.trim(),
        dietary: "",
        access: "",
        hear: "Staff manual exhibitor/sponsor onboarding",
        linkedin: "",
        interests: [] as string[],
        paymentMethod: "manual",
        roleNote: input.participation,
      },
    };

    let documentVerifications = s.documentVerifications;
    if (needsVerify) {
      documentVerifications = [
        ...documentVerifications,
        {
          id: uid("dv"),
          registrationId: regId,
          registrantName: name,
          registrantEmail: email,
          type: plan!.requiresVerification!,
          fileName: "pending-upload",
          status: "pending" as const,
          submittedAt: now,
        },
      ];
    }

    const application = {
      id: appId,
      companyName: input.companyName.trim(),
      orgType: input.orgType,
      website: input.website.trim(),
      description: input.description.trim(),
      contactName: name,
      contactEmail: email,
      contactPhone: input.contactPhone.trim(),
      participation: input.participation,
      sponsorshipTier: input.sponsorshipTier,
      boothPreference: input.boothPreference?.trim(),
      preferredBoothId: input.preferredBoothId || undefined,
      logoFileName: input.logoFileName,
      staffCount: input.staffCount,
      staffMemberEmails: staffEmails,
      quotedFeeUsd: quote.feeUsd,
      status: (approve ? "approved" : "pending") as "approved" | "pending",
      paymentStatus: (isSponsor ? "unpaid" : "comp") as "unpaid" | "comp",
      boothAssignment: approve ? booth : undefined,
      submittedAt: now,
      reviewMessage: approve ? "Approved on manual onboarding" : undefined,
    };

    const staffRecords = staffEmails.map((staffEmail, i) => ({
      id: uid("st"),
      orgId,
      name: staffDisplayName(staffEmail),
      email: staffEmail,
      role: i === 0 ? "Booth Lead" : "Staff",
      status: "Invited" as const,
      inviteToken: `invite-${orgId}-${i}`,
    }));

    let approvedOrganizations = s.approvedOrganizations;
    let booths = s.booths;
    if (approve) {
      approvedOrganizations = [
        ...s.approvedOrganizations.filter((o) => o.applicationId !== appId),
        {
          id: orgId,
          applicationId: appId,
          name: input.companyName.trim(),
          participation: input.participation,
          sponsorshipTier: input.sponsorshipTier,
          booth,
          category: input.orgType,
          description: input.description.trim(),
          contact: email,
          leads: 0,
          profileViews: 0,
          brochureDownloads: 0,
        },
      ];
      booths = s.booths.map((b) =>
        b.code === booth ? { ...b, status: "occupied" as const, assignedOrgId: orgId } : b,
      );
    }

    return {
      ...s,
      registrations: [reg, ...s.registrations],
      documentVerifications,
      organizationApplications: [application, ...s.organizationApplications],
      approvedOrganizations,
      exhibitorStaff: [...staffRecords, ...s.exhibitorStaff.filter((st) => st.orgId !== orgId)],
      booths,
    };
  });

  upgradeUserToExhibitor(email, name);

  if (approve && isSponsor && input.sponsorshipTier) {
    const app = loadStore().organizationApplications.find((a) => a.id === appId)!;
    issueSponsorshipInvoice(app, actorName, orgId);
  }

  appendAudit(
    actorName,
    approve ? `Created ${input.participation} (approved)` : `Created ${input.participation} application`,
    input.companyName.trim(),
  );
  return { ok: true, applicationId: appId };
}
