export type CompanionTier = 'FREE' | 'HOLDER' | 'STAKER' | 'BUILDER';

// Total supply: 1,000,000,000 — Builder = 1.5% = 15,000,000
export const TIER_THRESHOLDS: Record<CompanionTier, number> = {
  FREE:    0,
  HOLDER:  10_000,
  STAKER:  1_500_000,
  BUILDER: 15_000_000,
};

export const TIER_BENEFITS: Record<CompanionTier, string[]> = {
  FREE:    ['3 preset VRMs', '7-day memory', '1 companion', '30 min/day hosted AI'],
  HOLDER:  ['Full VRM library', '90-day memory', '1 companion', '3h/day hosted AI'],
  STAKER:  ['Full VRM library', 'Unlimited memory', '3 companions', 'Bring your own API key'],
  BUILDER: ['Full VRM library', 'Unlimited memory', 'Unlimited companions', 'API access + host for others'],
};

export function resolveCompanionTier(balance: number): CompanionTier {
  if (balance >= TIER_THRESHOLDS.BUILDER) return 'BUILDER';
  if (balance >= TIER_THRESHOLDS.STAKER)  return 'STAKER';
  if (balance >= TIER_THRESHOLDS.HOLDER)  return 'HOLDER';
  return 'FREE';
}
