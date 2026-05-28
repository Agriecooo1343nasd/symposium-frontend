import { EVENT } from "./mock-data";
import { loadStore, type FeatureFlags } from "./store";

export function getPlatformSettings() {
  return loadStore().platformSettings;
}

export function getEventConfig() {
  const s = getPlatformSettings();
  return {
    name: s.eventName,
    shortName: s.shortName,
    theme: s.theme,
    startDate: new Date(`${s.startDate}T09:00:00+02:00`),
    endDate: new Date(`${s.endDate}T17:30:00+02:00`),
    venue: s.venue,
    organizer: s.organizer,
    exchangeRate: s.exchangeRate,
  };
}

export function getCountdownTarget() {
  return getEventConfig().startDate;
}

export function isFeatureOpen(flag: keyof FeatureFlags): boolean {
  const store = loadStore();
  if (store.platformSettings.features.maintenanceMode && flag !== "registration") return false;
  return store.platformSettings.features[flag] ?? false;
}

export function getCountries() {
  return loadStore().platformSettings.countries;
}

export function getCertificateTemplate() {
  return loadStore().certificateTemplate;
}

export function getNewsPosts() {
  return loadStore().newsPosts;
}

export function getCommitteeMembers() {
  return [...loadStore().committeeMembers].sort((a, b) => a.order - b.order);
}

export function getRooms() {
  return loadStore().rooms;
}
