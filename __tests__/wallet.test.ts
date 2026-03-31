/**
 * Wallet tier tests — pure logic only, no React context required.
 * Tests: resolveCompanionTier boundaries + buildGate feature flags.
 */

import { resolveCompanionTier, CompanionTier } from '../src/wallet/CompanionTier';
import { buildGate } from '../src/wallet/useTierGate';

describe('resolveCompanionTier', () => {
  it('returns FREE at 0', () => expect(resolveCompanionTier(0)).toBe('FREE'));
  it('returns FREE at 99', () => expect(resolveCompanionTier(99)).toBe('FREE'));
  it('returns HOLDER at 100', () => expect(resolveCompanionTier(100)).toBe('HOLDER'));
  it('returns HOLDER at 999', () => expect(resolveCompanionTier(999)).toBe('HOLDER'));
  it('returns STAKER at 1000', () => expect(resolveCompanionTier(1000)).toBe('STAKER'));
  it('returns STAKER at 9999', () => expect(resolveCompanionTier(9999)).toBe('STAKER'));
  it('returns BUILDER at 10000', () => expect(resolveCompanionTier(10000)).toBe('BUILDER'));
  it('returns BUILDER at 1M', () => expect(resolveCompanionTier(1_000_000)).toBe('BUILDER'));
});

describe('buildGate — FREE tier', () => {
  const gate = buildGate('FREE');
  it('tier is FREE', () => expect(gate.tier).toBe('FREE'));
  it('canUseRpm is false', () => expect(gate.canUseRpm).toBe(false));
  it('canUseFullVrmLibrary is false', () => expect(gate.canUseFullVrmLibrary).toBe(false));
  it('maxCompanions is 1', () => expect(gate.maxCompanions).toBe(1));
  it('memoryDays is 7', () => expect(gate.memoryDays).toBe(7));
  it('hostedAiMinutesPerDay is 30', () => expect(gate.hostedAiMinutesPerDay).toBe(30));
  it('hasApiAccess is false', () => expect(gate.hasApiAccess).toBe(false));
  it('upgradeMessage mentions HOLDER', () => {
    expect(gate.upgradeMessage('RPM')).toContain('HOLDER');
  });
});

describe('buildGate — HOLDER tier', () => {
  const gate = buildGate('HOLDER');
  it('canUseRpm is true', () => expect(gate.canUseRpm).toBe(true));
  it('canUseFullVrmLibrary is true', () => expect(gate.canUseFullVrmLibrary).toBe(true));
  it('memoryDays is 90', () => expect(gate.memoryDays).toBe(90));
  it('hostedAiMinutesPerDay is 180', () => expect(gate.hostedAiMinutesPerDay).toBe(180));
  it('upgradeMessage mentions STAKER', () => {
    expect(gate.upgradeMessage('Unlimited memory')).toContain('STAKER');
  });
});

describe('buildGate — STAKER tier', () => {
  const gate = buildGate('STAKER');
  it('maxCompanions is 3', () => expect(gate.maxCompanions).toBe(3));
  it('memoryDays is unlimited', () => expect(gate.memoryDays).toBe(-1));
  it('hostedAiMinutesPerDay is unlimited', () => expect(gate.hostedAiMinutesPerDay).toBe(-1));
  it('upgradeMessage mentions BUILDER', () => {
    expect(gate.upgradeMessage('API access')).toContain('BUILDER');
  });
});

describe('buildGate — BUILDER tier', () => {
  const gate = buildGate('BUILDER');
  it('hasApiAccess is true', () => expect(gate.hasApiAccess).toBe(true));
  it('maxCompanions is unlimited', () => expect(gate.maxCompanions).toBe(-1));
  it('upgradeMessage is empty for BUILDER (top tier)', () => {
    expect(gate.upgradeMessage('anything')).toBe('');
  });
});
