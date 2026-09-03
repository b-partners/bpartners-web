import { computeOptimisticBalance, getEffectiveCreditBalance } from '@/operations/account/components/billing';
import { CreditBalance } from '@bpartners/typescript-client';

const base: CreditBalance = {
  spendableCredits: 320,
  grantedCredits: 200,
  purchasedCredits: 120,
  creditCostPerAnalysis: 10,
  estimatedRemainingAnalyses: 32,
};

describe('computeOptimisticBalance — coherent optimistic debit', () => {
  it('debits granted first and keeps granted + purchased = spendable', () => {
    const next = computeOptimisticBalance(base, 10);
    expect(next.grantedCredits).to.eq(190);
    expect(next.purchasedCredits).to.eq(120);
    expect(next.spendableCredits).to.eq(310);
    expect((next.grantedCredits ?? 0) + (next.purchasedCredits ?? 0)).to.eq(next.spendableCredits);
    expect(next.estimatedRemainingAnalyses).to.eq(31);
  });

  it('carries the remainder over to purchased when granted does not cover the cost', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 4, spendableCredits: 124 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(114);
    expect(next.spendableCredits).to.eq(114);
    expect((next.grantedCredits ?? 0) + (next.purchasedCredits ?? 0)).to.eq(next.spendableCredits);
  });

  it('debits only purchased when there is no granted left', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 0, spendableCredits: 120 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(110);
    expect(next.spendableCredits).to.eq(110);
  });

  it('never goes below zero', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 0, purchasedCredits: 3, spendableCredits: 3 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(0);
    expect(next.spendableCredits).to.eq(0);
  });
});

describe('getEffectiveCreditBalance — cache / API double check', () => {
  it('keeps the lowest balance when the cache is ahead of the still-stale API', () => {
    const api = { ...base, spendableCredits: 10 };
    const cached = { ...base, spendableCredits: 0 };
    expect(getEffectiveCreditBalance(api, cached)?.spendableCredits).to.eq(0);
  });

  it('keeps the API when it is already lower than the cache', () => {
    const api = { ...base, spendableCredits: 5 };
    const cached = { ...base, spendableCredits: 50 };
    expect(getEffectiveCreditBalance(api, cached)?.spendableCredits).to.eq(5);
  });

  it('falls back to the API when there is no optimistic cache', () => {
    expect(getEffectiveCreditBalance(base, undefined)).to.eq(base);
  });

  it('falls back to the cache when the API is unavailable', () => {
    expect(getEffectiveCreditBalance(undefined, base)).to.eq(base);
  });
});
