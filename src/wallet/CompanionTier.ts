export type CompanionTier = 'FREE' | 'HOLDER' | 'STAKER' | 'BUILDER';

export const TIER_THRESHOLDS: Record<CompanionTier, number> = {
  FREE: 0,
  HOLDER: 100,
  STAKER: 1_000,
  BUILDER: 10_000,
};

export const TIER_BENEFITS: Record<CompanionTier, string[]> = {
  FREE: ['3 preset VRMs', '7-day memory window', '1 companion', '30 min/day hosted AI'],
  HOLDER: ['Full VRM library', '90-day memory', 'Ready Player Me import', '3h/day hosted AI'],
  STAKER: ['Unlimited memory', '3 companions', 'Early features', 'Bring your own API key'],
  BUILDER: ['API access', 'Host companions for others', 'Referral revenue share'],
};

export function resolveCompanionTier(balance: number): CompanionTier {
  if (balance >= TIER_THRESHOLDS.BUILDER) return 'BUILDER';
  if (balance >= TIER_THRESHOLDS.STAKER) return 'STAKER';
  if (balance >= TIER_THRESHOLDS.HOLDER) return 'HOLDER';
  return 'FREE';
}
