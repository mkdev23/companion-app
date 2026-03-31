/**
 * Wallet tier tests — pure logic only, no React context required.
 * Tests: resolveCompanionTier boundaries + buildGate feature flags.
 *
 * Thresholds: FREE=0, HOLDER=10k, STAKER=1.5M, BUILDER=15M (1.5% of 1B supply)
 */

import { resolveCompanionTier, CompanionTier } from '../src/wallet/CompanionTier';
import { buildGate } from '../src/wallet/useTierGate';

describe('resolveCompanionTier', () => {
  it('returns FREE at 0',       () => expect(resolveCompanionTier(0)).toBe('FREE'));
  it('returns FREE at 9999',    () => expect(resolveCompanionTier(9_999)).toBe('FREE'));
  it('returns HOLDER at 10000', () => expect(resolveCompanionTier(10_000)).toBe('HOLDER'));
  it('returns HOLDER at 1.4M',  () => expect(resolveCompanionTier(1_499_999)).toBe('HOLDER'));
  it('returns STAKER at 1.5M',  () => expect(resolveCompanionTier(1_500_000)).toBe('STAKER'));
  it('returns STAKER at 14.9M', () => expect(resolveCompanionTier(14_999_999)).toBe('STAKER'));
  it('returns BUILDER at 15M',  () => expect(resolveCompanionTier(15_000_000)).toBe('BUILDER'));
  it('returns BUILDER at 100M', () => expect(resolveCompanionTier(100_000_000)).toBe('BUILDER'));
});

describe('buildGate — FREE tier', () => {
  const gate = buildGate('FREE');
  it('tier is FREE',                   () => expect(gate.tier).toBe('FREE'));
  it('canUseAvatarCreate is false',             () => expect(gate.canUseAvatarCreate).toBe(false));
  it('canUseFullVrmLibrary is false',  () => expect(gate.canUseFullVrmLibrary).toBe(false));
  it('maxCompanions is 1',             () => expect(gate.maxCompanions).toBe(1));
  it('memoryDays is 7',                () => expect(gate.memoryDays).toBe(7));
  it('hostedAiMinutesPerDay is 30',    () => expect(gate.hostedAiMinutesPerDay).toBe(30));
  it('hasApiAccess is false',          () => expect(gate.hasApiAccess).toBe(false));
  it('upgradeMessage mentions HOLDER', () => {
    expect(gate.upgradeMessage('RPM')).toContain('HOLDER');
  });
  it('upgradeMessage mentions 10,000', () => {
    expect(gate.upgradeMessage('RPM')).toContain('10,000');
  });
});

describe('buildGate — HOLDER tier', () => {
  const gate = buildGate('HOLDER');
  it('canUseAvatarCreate is true',               () => expect(gate.canUseAvatarCreate).toBe(true));
  it('canUseFullVrmLibrary is true',    () => expect(gate.canUseFullVrmLibrary).toBe(true));
  it('maxCompanions is 1',              () => expect(gate.maxCompanions).toBe(1));
  it('memoryDays is 90',                () => expect(gate.memoryDays).toBe(90));
  it('hostedAiMinutesPerDay is 180',    () => expect(gate.hostedAiMinutesPerDay).toBe(180));
  it('upgradeMessage mentions STAKER',  () => {
    expect(gate.upgradeMessage('Unlimited memory')).toContain('STAKER');
  });
  it('upgradeMessage mentions 1,500,000', () => {
    expect(gate.upgradeMessage('Unlimited memory')).toContain('1,500,000');
  });
});

describe('buildGate — STAKER tier', () => {
  const gate = buildGate('STAKER');
  it('maxCompanions is 3',               () => expect(gate.maxCompanions).toBe(3));
  it('memoryDays is unlimited',          () => expect(gate.memoryDays).toBe(-1));
  it('hostedAiMinutesPerDay is unlimited (BYOK)', () => expect(gate.hostedAiMinutesPerDay).toBe(-1));
  it('upgradeMessage mentions BUILDER',  () => {
    expect(gate.upgradeMessage('API access')).toContain('BUILDER');
  });
  it('upgradeMessage mentions 15,000,000', () => {
    expect(gate.upgradeMessage('API access')).toContain('15,000,000');
  });
});

describe('buildGate — BUILDER tier', () => {
  const gate = buildGate('BUILDER');
  it('hasApiAccess is true',            () => expect(gate.hasApiAccess).toBe(true));
  it('maxCompanions is unlimited',      () => expect(gate.maxCompanions).toBe(-1));
  it('memoryDays is unlimited',         () => expect(gate.memoryDays).toBe(-1));
  it('upgradeMessage is empty (top tier)', () => {
    expect(gate.upgradeMessage('anything')).toBe('');
  });
});
