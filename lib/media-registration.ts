import type { MediaApplication, MediaPressType } from "./store";
import {
  appendAudit,
  loadStore,
  patchStore,
  uid,
  upsertAttendeeProfile,
  type StoreRegistration,
} from "./store";

export type SubmitMediaRegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  jobTitle: string;
  pressName: string;
  pressType: MediaPressType;
  pressWebsite: string;
  pressCountry: string;
  editorName: string;
  editorEmail: string;
  coverageBrief: string;
  socialHandle: string;
  credentialFileName: string;
  credentialDataUrl: string;
  letterFileName: string;
  letterDataUrl: string;
  assignmentFileName?: string;
  assignmentDataUrl?: string;
  consentPolicy: boolean;
};

export function validateMediaRegistration(input: SubmitMediaRegistrationInput): string | null {
  if (!input.fullName.trim()) return "Full name is required";
  if (!input.email.trim()) return "Email is required";
  if (!input.pressName.trim()) return "Press / outlet name is required";
  if (!input.jobTitle.trim()) return "Role / beat is required";
  if (!input.coverageBrief.trim()) return "Describe what you plan to cover";
  if (!input.credentialFileName || !input.credentialDataUrl) return "Upload your press credential or ID";
  if (!input.letterFileName || !input.letterDataUrl) return "Upload a letter from your outlet";
  if (!input.consentPolicy) return "Accept the privacy policy to continue";
  const store = loadStore();
  const email = input.email.trim().toLowerCase();
  if (store.registrations.some((r) => r.email.toLowerCase() === email)) {
    return "This email already has a registration on file";
  }
  if (store.mediaApplications.some((a) => a.email.toLowerCase() === email && a.status !== "rejected")) {
    return "A media application already exists for this email";
  }
  return null;
}

export function submitMediaRegistration(
  input: SubmitMediaRegistrationInput,
): { ok: true; registrationId: string } | { ok: false; error: string } {
  const err = validateMediaRegistration(input);
  if (err) return { ok: false, error: err };

  const email = input.email.trim().toLowerCase();
  const name = input.fullName.trim();
  const regId = uid("r");
  const appId = uid("ma");
  const now = new Date().toISOString().slice(0, 10);

  const application: MediaApplication = {
    id: appId,
    registrationId: regId,
    name,
    email,
    phone: input.phone.trim(),
    country: input.country.trim(),
    jobTitle: input.jobTitle.trim(),
    pressName: input.pressName.trim(),
    pressType: input.pressType,
    pressWebsite: input.pressWebsite.trim(),
    pressCountry: input.pressCountry.trim(),
    editorName: input.editorName.trim() || undefined,
    editorEmail: input.editorEmail.trim() || undefined,
    coverageBrief: input.coverageBrief.trim(),
    socialHandle: input.socialHandle.trim() || undefined,
    credentialFileName: input.credentialFileName,
    credentialDataUrl: input.credentialDataUrl,
    letterFileName: input.letterFileName,
    letterDataUrl: input.letterDataUrl,
    assignmentFileName: input.assignmentFileName,
    assignmentDataUrl: input.assignmentDataUrl,
    status: "pending",
    submittedAt: now,
  };

  const reg: StoreRegistration = {
    id: regId,
    name,
    email,
    country: input.country.trim(),
    category: "Media / Press",
    categoryId: "media",
    amountUsd: 0,
    status: "pending",
    verificationStatus: "none",
    createdAt: now,
    details: {
      ticketId: `NAS26-MEDIA-${regId.replace(/^r/, "").toUpperCase()}`,
      title: input.jobTitle.trim(),
      org: input.pressName.trim(),
      phone: input.phone.trim(),
      hear: "Media accreditation",
      roleNote: "media",
    },
  };

  patchStore((s) => {
    const existingUser = s.users.find((u) => u.email.toLowerCase() === email);
    const users = existingUser
      ? s.users.map((u) =>
          u.email.toLowerCase() === email ? { ...u, name, status: "active" as const } : u,
        )
      : [
          ...s.users,
          {
            id: uid("u"),
            name,
            email,
            role: "attendee" as const,
            status: "active" as const,
            lastLogin: "Never",
          },
        ];
    return {
      ...s,
      registrations: [reg, ...s.registrations],
      mediaApplications: [application, ...s.mediaApplications],
      users,
    };
  });

  upsertAttendeeProfile({
    email,
    name,
    org: input.pressName.trim(),
    country: input.country.trim(),
    title: input.jobTitle.trim(),
    publicInDirectory: false,
    allowMessages: false,
    allowExhibitorContact: false,
  });

  return { ok: true, registrationId: regId };
}

export function approveMediaApplication(appId: string, reviewerName: string) {
  const store = loadStore();
  const app = store.mediaApplications.find((a) => a.id === appId);
  if (!app) return { ok: false as const, error: "Application not found" };

  patchStore((s) => ({
    ...s,
    mediaApplications: s.mediaApplications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: "approved" as const,
            reviewMessage: "Press accreditation approved",
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString(),
          }
        : a,
    ),
    registrations: s.registrations.map((r) =>
      r.id === app.registrationId ? { ...r, status: "comp" as const } : r,
    ),
  }));
  appendAudit(reviewerName, "Approved media accreditation", app.email);
  return { ok: true as const };
}

export function rejectMediaApplication(appId: string, reviewerName: string, message: string) {
  const store = loadStore();
  const app = store.mediaApplications.find((a) => a.id === appId);
  if (!app) return { ok: false as const, error: "Application not found" };

  patchStore((s) => ({
    ...s,
    mediaApplications: s.mediaApplications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: "rejected" as const,
            reviewMessage: message,
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString(),
          }
        : a,
    ),
    registrations: s.registrations.map((r) =>
      r.id === app.registrationId ? { ...r, status: "pending" as const } : r,
    ),
  }));
  appendAudit(reviewerName, "Rejected media accreditation", app.email);
  return { ok: true as const };
}

export const MEDIA_PRESS_TYPE_LABELS: Record<MediaPressType, string> = {
  tv: "Television",
  radio: "Radio",
  print: "Print / newspaper",
  digital: "Digital / online",
  photo: "Photo / video",
  other: "Other",
};
