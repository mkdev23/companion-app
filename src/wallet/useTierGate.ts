/**
 * useTierGate — enforces $COMPANION tier limits throughout the app.
 *
 * Usage:
 *   const gate = useTierGate();
 *   if (!gate.canUseRpm) { show upgrade prompt }
 */

import { useWalletStore } from './walletStore';
import { CompanionTier } from './CompanionTier';

export interface TierGate {
  tier: CompanionTier;
  // Feature flags
  canUseAvatarCreate: boolean;   // Avaturn in-app avatar creator
  canUseFullVrmLibrary: boolean; // All preset VRMs (vs. 3 presets)
  maxCompanions: number;
  memoryDays: number;           // -1 = unlimited
  hostedAiMinutesPerDay: number; // -1 = unlimited (BYOK)
  hasApiAccess: boolean;        // Builder only
  // Upgrade prompt
  upgradeMessage: (feature: string) => string;
}

export function useTierGate(): TierGate {
  const tier = useWalletStore((s) => s.tier);

  return buildGate(tier);
}

export function buildGate(tier: CompanionTier): TierGate {
  const gates: Record<CompanionTier, Omit<TierGate, 'tier' | 'upgradeMessage'>> = {
    FREE:    { canUseAvatarCreate: false, canUseFullVrmLibrary: false, maxCompanions: 1,  memoryDays: 7,  hostedAiMinutesPerDay: 30,  hasApiAccess: false },
    HOLDER:  { canUseAvatarCreate: true,  canUseFullVrmLibrary: true,  maxCompanions: 1,  memoryDays: 90, hostedAiMinutesPerDay: 180, hasApiAccess: false },
    STAKER:  { canUseAvatarCreate: true,  canUseFullVrmLibrary: true,  maxCompanions: 3,  memoryDays: -1, hostedAiMinutesPerDay: -1,  hasApiAccess: false },
    BUILDER: { canUseAvatarCreate: true,  canUseFullVrmLibrary: true,  maxCompanions: -1, memoryDays: -1, hostedAiMinutesPerDay: -1,  hasApiAccess: true  },
  };

  const g = gates[tier];

  return {
    tier,
    ...g,
    upgradeMessage: (feature: string) => {
      if (tier === 'BUILDER') return '';
      const next: Record<CompanionTier, string> = {
        FREE:    'Hold 10,000 $COMPANION (HOLDER tier)',
        HOLDER:  'Hold 1,500,000 $COMPANION (STAKER tier)',
        STAKER:  'Hold 15,000,000 $COMPANION — 1.5% supply (BUILDER tier)',
        BUILDER: '',
      };
      return `${feature} requires ${next[tier]}. Get $COMPANION at companion-os.xyz/token`;
    },
  };
}
