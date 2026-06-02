import type { SubTheme } from "./mock-data";
import {
  appendAudit,
  loadStore,
  patchStore,
  uid,
  upsertAttendeeProfile,
  type GroupRegistration,
  type GroupRegistrationSettings,
  type StoreRegistration,
  type TicketPlan,
} from "./store";

export type GroupMemberInput = {
  name: string;
  email: string;
  title?: string;
  phone?: string;
};

export type GroupPricing = {
  memberCount: number;
  pricePerSeatUsd: number;
  subtotalUsd: number;
  discountPercent: number;
  discountUsd: number;
  totalUsd: number;
  tierLabel: string;
};

export function getGroupSettings(): GroupRegistrationSettings {
  return loadStore().platformSettings.groupRegistration;
}

export function calculateGroupPricing(memberCount: number, pricePerSeatUsd: number): GroupPricing {
  const settings = getGroupSettings();
  const count = Math.max(1, memberCount);
  const subtotalUsd = Math.round(pricePerSeatUsd * count * 100) / 100;
  let discountPercent = 0;
  let tierLabel = "No group discount";

  if (count >= 10) {
    discountPercent = settings.tier10PlusPercent;
    tierLabel = `10+ delegates (${discountPercent}% off)`;
  } else if (count >= settings.minSize) {
    discountPercent = settings.tier5to9Percent;
    tierLabel = `${settings.minSize}–9 delegates (${discountPercent}% off)`;
  }

  const discountUsd = Math.round(subtotalUsd * (discountPercent / 100) * 100) / 100;
  const totalUsd = Math.round((subtotalUsd - discountUsd) * 100) / 100;

  return {
    memberCount: count,
    pricePerSeatUsd,
    subtotalUsd,
    discountPercent,
    discountUsd,
    totalUsd,
    tierLabel,
  };
}

export function getGroupById(groupId: string): GroupRegistration | undefined {
  return loadStore().groupRegistrations.find((g) => g.id === groupId);
}

export function getGroupForRegistration(registrationId: string): GroupRegistration | undefined {
  const reg = loadStore().registrations.find((r) => r.id === registrationId);
  if (!reg?.groupId) return undefined;
  return getGroupById(reg.groupId);
}

export function getGroupByRepresentativeEmail(email: string): GroupRegistration | undefined {
  const key = email.trim().toLowerCase();
  return loadStore().groupRegistrations.find((g) => g.representativeEmail.toLowerCase() === key);
}

export function getGroupMemberRegistrations(groupId: string): StoreRegistration[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  const ids = new Set(group.memberRegistrationIds);
  return loadStore().registrations.filter((r) => ids.has(r.id));
}

export function getGroupCheckInSummary(groupId: string) {
  const members = getGroupMemberRegistrations(groupId);
  const checkedIn = members.filter((m) => m.checkedIn).length;
  return { members, checkedIn, total: members.length };
}

type RepresentativeInput = {
  name: string;
  email: string;
  title?: string;
  org: string;
  country: string;
  phone?: string;
  dietary?: string;
  access?: string;
  hear?: string;
  linkedin?: string;
  interests?: string[];
  subThemeInterests?: SubTheme[];
  allowExhibitorContact?: boolean;
};

type CreateGroupInput = {
  plan: TicketPlan;
  representative: RepresentativeInput;
  additionalMembers: GroupMemberInput[];
  paymentMethod: string;
  status?: "paid" | "pending" | "comp";
  actorName?: string;
};

function buildTicketId(regId: string) {
  return `NAS26-${regId.replace(/^r/, "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createMemberRegistration(
  member: GroupMemberInput,
  plan: TicketPlan,
  groupId: string,
  role: "representative" | "member",
  amountUsd: number,
  status: "paid" | "pending" | "comp",
  paymentMethod: string,
  shared: { org: string; country: string; hear?: string },
): StoreRegistration {
  const regId = uid("r");
  return {
    id: regId,
    name: member.name.trim(),
    email: member.email.trim().toLowerCase(),
    country: shared.country,
    category: plan.name,
    categoryId: plan.id,
    amountUsd,
    status,
    verificationStatus: plan.requiresVerification ? "pending" : "none",
    createdAt: new Date().toISOString().slice(0, 10),
    groupId,
    groupRole: role,
    details: {
      ticketId: buildTicketId(regId),
      title: member.title?.trim(),
      org: shared.org,
      phone: member.phone?.trim(),
      dietary: role === "representative" ? undefined : undefined,
      access: "",
      hear: shared.hear ?? "Group registration",
      linkedin: "",
      interests: [],
      paymentMethod,
      roleNote: role === "representative" ? "group-representative" : "group-member",
    },
  };
}

export function createGroupRegistration(
  input: CreateGroupInput,
): { ok: true; group: GroupRegistration; representativeRegId: string } | { ok: false; error: string } {
  const settings = getGroupSettings();
  if (!settings.enabled) return { ok: false, error: "Group registration is not enabled" };

  const members = input.additionalMembers.filter((m) => m.name.trim() && m.email.trim());
  const memberCount = 1 + members.length;

  if (memberCount < settings.minSize) {
    return { ok: false, error: `Group registration requires at least ${settings.minSize} attendees` };
  }
  if (memberCount > settings.maxSize) {
    return { ok: false, error: `Maximum group size is ${settings.maxSize}` };
  }

  const repEmail = input.representative.email.trim().toLowerCase();
  const emails = [repEmail, ...members.map((m) => m.email.trim().toLowerCase())];
  if (new Set(emails).size !== emails.length) {
    return { ok: false, error: "Each group member must have a unique email" };
  }

  const store = loadStore();
  if (emails.some((e) => store.registrations.some((r) => r.email.toLowerCase() === e && r.status !== "pending"))) {
    return { ok: false, error: "One or more emails already have an active registration" };
  }

  const pricing = calculateGroupPricing(memberCount, input.plan.usd);
  const perSeat = Math.round((pricing.totalUsd / memberCount) * 100) / 100;
  const status = input.status ?? "paid";
  const groupId = uid("grp");
  const groupCode = `GRP-${groupId.replace(/^grp/, "").toUpperCase().slice(0, 6)}`;

  const repReg = createMemberRegistration(
    {
      name: input.representative.name,
      email: input.representative.email,
      title: input.representative.title,
      phone: input.representative.phone,
    },
    input.plan,
    groupId,
    "representative",
    perSeat,
    status,
    input.paymentMethod,
    {
      org: input.representative.org,
      country: input.representative.country,
      hear: input.representative.hear,
    },
  );
  repReg.details = {
    ...repReg.details!,
    dietary: input.representative.dietary,
    access: input.representative.access,
    linkedin: input.representative.linkedin,
    interests: input.representative.interests,
  };

  const memberRegs = members.map((m) =>
    createMemberRegistration(m, input.plan, groupId, "member", perSeat, status, input.paymentMethod, {
      org: input.representative.org,
      country: input.representative.country,
      hear: input.representative.hear,
    }),
  );

  const allRegs = [repReg, ...memberRegs];
  const group: GroupRegistration = {
    id: groupId,
    code: groupCode,
    orgName: input.representative.org.trim(),
    representativeRegistrationId: repReg.id,
    representativeEmail: repEmail,
    representativeName: input.representative.name.trim(),
    country: input.representative.country,
    categoryId: input.plan.id,
    categoryName: input.plan.name,
    memberCount,
    memberRegistrationIds: allRegs.map((r) => r.id),
    pricePerSeatUsd: input.plan.usd,
    subtotalUsd: pricing.subtotalUsd,
    discountPercent: pricing.discountPercent,
    discountUsd: pricing.discountUsd,
    totalUsd: pricing.totalUsd,
    status,
    paymentMethod: input.paymentMethod,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  patchStore((s) => {
    let documentVerifications = s.documentVerifications;
    if (input.plan.requiresVerification) {
      for (const reg of allRegs) {
        documentVerifications = [
          ...documentVerifications,
          {
            id: uid("dv"),
            registrationId: reg.id,
            registrantName: reg.name,
            registrantEmail: reg.email,
            type: input.plan.requiresVerification!,
            fileName: "pending-upload",
            status: "pending" as const,
            submittedAt: new Date().toISOString(),
          },
        ];
      }
    }
    return {
      ...s,
      registrations: [...allRegs, ...s.registrations],
      groupRegistrations: [group, ...s.groupRegistrations],
      documentVerifications,
    };
  });

  upsertAttendeeProfile({
    email: repEmail,
    name: input.representative.name,
    title: input.representative.title,
    org: input.representative.org,
    country: input.representative.country,
    interests: input.representative.interests,
    subThemeInterests: input.representative.subThemeInterests,
    publicInDirectory: true,
    allowMessages: true,
    allowExhibitorContact: input.representative.allowExhibitorContact ?? true,
  });

  for (const m of members) {
    upsertAttendeeProfile({
      email: m.email,
      name: m.name,
      title: m.title,
      org: input.representative.org,
      country: input.representative.country,
      publicInDirectory: true,
      allowMessages: true,
      allowExhibitorContact: true,
    });
  }

  if (input.actorName) {
    appendAudit(input.actorName, "Created group registration", `${group.code} · ${memberCount} seats`);
  }

  return { ok: true, group, representativeRegId: repReg.id };
}

export function formatGroupDiscountLine(pricing: GroupPricing, currency: "USD" | "RWF", rate: number) {
  const fmt = (usd: number) =>
    currency === "USD" ? `$${usd.toFixed(2)}` : `RWF ${Math.round(usd * rate).toLocaleString()}`;
  return {
    subtotal: fmt(pricing.subtotalUsd),
    discount: pricing.discountUsd > 0 ? `−${fmt(pricing.discountUsd)} (${pricing.discountPercent}%)` : "—",
    total: fmt(pricing.totalUsd),
    perSeat: fmt(pricing.totalUsd / pricing.memberCount),
  };
}
