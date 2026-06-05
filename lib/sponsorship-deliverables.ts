import { appendAudit, loadStore, patchStore, uid, type SponsorshipDeliverable, type SponsorshipDeliverableStatus } from "./store";

export function getDeliverablesForOrg(orgId: string): SponsorshipDeliverable[] {
  return loadStore().sponsorshipDeliverables.filter((d) => d.orgId === orgId);
}

export function getAllDeliverables(): SponsorshipDeliverable[] {
  return loadStore().sponsorshipDeliverables;
}

export type DeliverableInput = {
  orgId: string;
  title: string;
  description: string;
  channel: SponsorshipDeliverable["channel"];
  dueDate: string;
  status?: SponsorshipDeliverableStatus;
  secretariatNote?: string;
};

export function addDeliverable(input: DeliverableInput, actorName: string): SponsorshipDeliverable {
  const d: SponsorshipDeliverable = {
    id: uid("sd"),
    orgId: input.orgId,
    title: input.title.trim(),
    description: input.description.trim(),
    channel: input.channel,
    status: input.status ?? "pending",
    dueDate: input.dueDate,
    secretariatNote: input.secretariatNote?.trim(),
  };
  patchStore((s) => ({ ...s, sponsorshipDeliverables: [d, ...s.sponsorshipDeliverables] }));
  appendAudit(actorName, "Added sponsorship deliverable", d.title);
  return d;
}

export function updateDeliverable(
  id: string,
  patch: Partial<Pick<SponsorshipDeliverable, "title" | "description" | "channel" | "status" | "dueDate" | "secretariatNote" | "submittedAt" | "liveAt">>,
  actorName: string,
) {
  patchStore((s) => ({
    ...s,
    sponsorshipDeliverables: s.sponsorshipDeliverables.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  }));
  appendAudit(actorName, "Updated sponsorship deliverable", id);
}

export function removeDeliverable(id: string, actorName: string) {
  patchStore((s) => ({
    ...s,
    sponsorshipDeliverables: s.sponsorshipDeliverables.filter((d) => d.id !== id),
  }));
  appendAudit(actorName, "Removed sponsorship deliverable", id);
}
