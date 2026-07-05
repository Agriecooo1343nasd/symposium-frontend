import type {
  CreateMediaAccreditationAdminDto,
  CreateMediaAccreditationAdminResultDto,
  MediaAccreditationDto,
  MediaAccreditationExtended,
  UpdateMediaAccreditationDto,
} from "@/lib/api/dto";

const STORAGE_KEY = "nas_media_accreditation_manual";

function readStore(): MediaAccreditationExtended[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MediaAccreditationExtended[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(items: MediaAccreditationExtended[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isMockMediaAccreditationId(id: string) {
  return id.startsWith("mock-ma-");
}

export function loadMockMediaAccreditations(): MediaAccreditationExtended[] {
  return readStore();
}

export function getMockMediaAccreditation(id: string): MediaAccreditationExtended | null {
  return readStore().find((a) => a.id === id) ?? null;
}

export function mockCreateMediaAccreditationAdmin(
  dto: CreateMediaAccreditationAdminDto,
): CreateMediaAccreditationAdminResultDto {
  const email = dto.email.trim().toLowerCase();
  const existing = readStore().find((a) => a.email.toLowerCase() === email && a.status !== "rejected");
  if (existing) {
    throw new Error("A media accreditation already exists for this email");
  }

  const now = new Date().toISOString();
  const accreditation: MediaAccreditationExtended = {
    id: `mock-ma-${crypto.randomUUID()}`,
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    phone: dto.phone?.trim() || null,
    outletName: dto.outletName.trim(),
    outletType: dto.outletType?.trim() || null,
    jobTitle: dto.jobTitle?.trim() || null,
    country: dto.country?.trim() || null,
    pressCardUrl: dto.pressCardUrl?.trim() || null,
    coverageType: dto.coverageType?.trim() || null,
    equipmentNeeds: dto.equipmentNeeds?.trim() || null,
    status: dto.autoApprove ? "approved" : "pending",
    adminNotes: dto.adminNotes?.trim() || "Added manually by staff (pending backend invite API).",
    createdAt: now,
    outletWebsite: dto.outletWebsite?.trim() || null,
    outletCountry: dto.outletCountry?.trim() || null,
    editorName: dto.editorName?.trim() || null,
    editorEmail: dto.editorEmail?.trim() || null,
    letterUrl: dto.letterUrl?.trim() || null,
    assignmentUrl: dto.assignmentUrl?.trim() || null,
    manuallyAdded: true,
  };

  writeStore([accreditation, ...readStore()]);

  return {
    accreditation,
    userCreated: true,
    registrationCreated: true,
    welcomeEmailSent: dto.sendWelcomeEmail !== false,
    simulated: true,
  };
}

export function mockUpdateMediaAccreditation(
  id: string,
  dto: UpdateMediaAccreditationDto,
): MediaAccreditationDto {
  const items = readStore();
  const idx = items.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("Application not found");

  const updated: MediaAccreditationExtended = {
    ...items[idx],
    status: dto.status,
    adminNotes: dto.adminNotes ?? items[idx].adminNotes,
  };
  items[idx] = updated;
  writeStore(items);
  return updated;
}

export function mergeMediaAccreditations(apiItems: MediaAccreditationDto[]): MediaAccreditationExtended[] {
  const mock = readStore();
  const apiEmails = new Set(apiItems.map((a) => a.email.toLowerCase()));
  const mockOnly = mock.filter((m) => !apiEmails.has(m.email.toLowerCase()));
  return [...apiItems, ...mockOnly];
}
