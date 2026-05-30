import type { SubTheme } from "./mock-data";
import {
  appendAudit,
  patchStore,
  uid,
  upgradeUserToSpeaker,
  upsertAttendeeProfile,
  type PresentationType,
  type TicketPlan,
} from "./store";
import { loadStore } from "./store";

const FLAG_BY_COUNTRY: Record<string, string> = {
  Rwanda: "🇷🇼",
  Kenya: "🇰🇪",
  Uganda: "🇺🇬",
  Ghana: "🇬🇭",
  Nigeria: "🇳🇬",
  Senegal: "🇸🇳",
  Italy: "🇮🇹",
  Germany: "🇩🇪",
  France: "🇫🇷",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
};

function countryFlag(country: string): string {
  return FLAG_BY_COUNTRY[country] ?? "🌍";
}

export type CreateSpeakerInput = {
  ticketPlanId: string;
  fullName: string;
  jobTitle: string;
  org: string;
  country: string;
  email: string;
  phone: string;
  dietary: string;
  access: string;
  hear: string;
  linkedin: string;
  interests: SubTheme[];
  about: string;
  presentationTitle: string;
  summary: string;
  presentationType: PresentationType;
  photoUrl?: string;
  documentName?: string;
  documentDataUrl?: string;
};

export function validateCreateSpeakerInput(input: CreateSpeakerInput, plan: TicketPlan | undefined): string | null {
  if (!plan) return "Select a pass category";
  if (!input.fullName.trim()) return "Full name is required";
  if (!input.email.trim()) return "Email is required";
  if (!input.org.trim()) return "Organization is required";
  if (!input.phone.trim()) return "Phone is required";
  if (!input.about.trim()) return "Speaker bio is required";
  if (!input.presentationTitle.trim()) return "Presentation title is required";
  if (!input.summary.trim()) return "Abstract summary is required";
  if (!input.documentName?.trim() || !input.documentDataUrl) return "Abstract document (PDF) is required";
  const store = loadStore();
  if (store.registrations.some((r) => r.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return "This email already has a registration";
  }
  if (store.speakerApplications.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return "A speaker application already exists for this email";
  }
  return null;
}

export function createSpeakerManually(input: CreateSpeakerInput, actorName: string): { ok: true } | { ok: false; error: string } {
  const store = loadStore();
  const plan = store.ticketPlans.find((t) => t.id === input.ticketPlanId);
  const err = validateCreateSpeakerInput(input, plan);
  if (err) return { ok: false, error: err };

  const email = input.email.trim().toLowerCase();
  const name = input.fullName.trim();
  const regId = uid("r");
  const appId = uid("sa");
  const profileId = uid("sp");
  const now = new Date().toISOString().slice(0, 10);
  const reviewedAt = new Date().toISOString();
  const photo =
    input.photoUrl?.trim() ||
    `https://i.pravatar.cc/400?u=${encodeURIComponent(email)}`;

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
        org: input.org.trim(),
        phone: input.phone.trim(),
        dietary: input.dietary.trim(),
        access: input.access.trim(),
        hear: input.hear.trim() || "Staff manual speaker onboarding",
        linkedin: input.linkedin.trim(),
        interests: input.interests,
        paymentMethod: "manual",
        roleNote: "speaker",
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
      name,
      email,
      phone: input.phone.trim(),
      country: input.country.trim(),
      photoUrl: photo,
      about: input.about.trim(),
      title: input.presentationTitle.trim(),
      summary: input.summary.trim(),
      presentationType: input.presentationType,
      documentName: input.documentName,
      documentDataUrl: input.documentDataUrl,
      status: "approved" as const,
      reviewMessage: "Approved on manual onboarding",
      reviewedBy: actorName,
      reviewedAt,
      submittedAt: now,
    };

    const speakerProfile = {
      id: profileId,
      name,
      title: input.jobTitle.trim() || input.presentationTitle.trim(),
      org: input.org.trim(),
      country: input.country.trim(),
      flag: countryFlag(input.country.trim()),
      bio: input.about.trim(),
      photo,
      sessions: [] as string[],
      email,
    };

    const existingUser = s.users.find((u) => u.email.toLowerCase() === email);
    const users = existingUser
      ? s.users.map((u) =>
          u.email.toLowerCase() === email ? { ...u, role: "speaker" as const, status: "active" as const, name } : u,
        )
      : [
          ...s.users,
          {
            id: uid("u"),
            name,
            email,
            role: "speaker" as const,
            status: "active" as const,
            lastLogin: "Never",
          },
        ];

    return {
      ...s,
      registrations: [reg, ...s.registrations],
      documentVerifications,
      speakerApplications: [application, ...s.speakerApplications],
      speakerProfiles: [...s.speakerProfiles, speakerProfile],
      users,
    };
  });

  upsertAttendeeProfile({
    email,
    name,
    org: input.org.trim(),
    country: input.country.trim(),
    title: input.jobTitle.trim(),
    bio: input.about.trim(),
    photo,
    subThemeInterests: input.interests,
    publicInDirectory: true,
  });

  appendAudit(actorName, "Created speaker (registration + application)", email);
  return { ok: true };
}
