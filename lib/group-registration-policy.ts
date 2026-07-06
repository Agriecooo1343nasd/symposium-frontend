export type GroupRegistrationSettings = {
  enabled: boolean;
  minSize: number;
  tier5to9Percent: number;
  tier10PlusPercent: number;
  maxSize: number;
};

/**
 * Mirrors backend `registrations.constants.ts` (`GROUP_DISCOUNT_TIER_*`).
 * Single source of truth for UI previews until a settings API exists.
 */
export const GROUP_REGISTRATION_POLICY = {
  enabled: true,
  minSize: 5,
  maxSize: 30,
  tier5to9Percent: 10,
  tier10PlusPercent: 15,
  tier5to9Max: 9,
  tier10Min: 10,
} as const;

export function getServerGroupRegistrationSettings(): GroupRegistrationSettings {
  return {
    enabled: GROUP_REGISTRATION_POLICY.enabled,
    minSize: GROUP_REGISTRATION_POLICY.minSize,
    maxSize: GROUP_REGISTRATION_POLICY.maxSize,
    tier5to9Percent: GROUP_REGISTRATION_POLICY.tier5to9Percent,
    tier10PlusPercent: GROUP_REGISTRATION_POLICY.tier10PlusPercent,
  };
}

export function calculateServerGroupDiscountPercent(memberCount: number): number {
  if (memberCount >= GROUP_REGISTRATION_POLICY.tier10Min) {
    return GROUP_REGISTRATION_POLICY.tier10PlusPercent;
  }
  if (
    memberCount >= GROUP_REGISTRATION_POLICY.minSize &&
    memberCount <= GROUP_REGISTRATION_POLICY.tier5to9Max
  ) {
    return GROUP_REGISTRATION_POLICY.tier5to9Percent;
  }
  return 0;
}
