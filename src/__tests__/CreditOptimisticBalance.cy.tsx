import { computeOptimisticBalance, getEffectiveCreditBalance } from '@/operations/account/components/billing';
import { CreditBalance } from '@bpartners/typescript-client';

const base: CreditBalance = {
  spendableCredits: 320,
  grantedCredits: 200,
  purchasedCredits: 120,
  creditCostPerAnalysis: 10,
  estimatedRemainingAnalyses: 32,
};

describe('computeOptimisticBalance — débit optimiste cohérent', () => {
  it('débite le granted en priorité et garde granted + purchased = spendable', () => {
    const next = computeOptimisticBalance(base, 10);
    expect(next.grantedCredits).to.eq(190);
    expect(next.purchasedCredits).to.eq(120);
    expect(next.spendableCredits).to.eq(310);
    expect((next.grantedCredits ?? 0) + (next.purchasedCredits ?? 0)).to.eq(next.spendableCredits);
    expect(next.estimatedRemainingAnalyses).to.eq(31);
  });

  it('reporte le reliquat sur le purchased quand le granted ne couvre pas le coût', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 4, spendableCredits: 124 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(114);
    expect(next.spendableCredits).to.eq(114);
    expect((next.grantedCredits ?? 0) + (next.purchasedCredits ?? 0)).to.eq(next.spendableCredits);
  });

  it('débite uniquement le purchased quand il n’y a plus de granted', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 0, spendableCredits: 120 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(110);
    expect(next.spendableCredits).to.eq(110);
  });

  it('ne descend jamais en dessous de zéro', () => {
    const next = computeOptimisticBalance({ ...base, grantedCredits: 0, purchasedCredits: 3, spendableCredits: 3 }, 10);
    expect(next.grantedCredits).to.eq(0);
    expect(next.purchasedCredits).to.eq(0);
    expect(next.spendableCredits).to.eq(0);
  });
});

describe('getEffectiveCreditBalance — double vérification cache / API', () => {
  it('retient le solde le plus faible quand le cache est en avance sur l’API encore périmée', () => {
    const api = { ...base, spendableCredits: 10 };
    const cached = { ...base, spendableCredits: 0 };
    expect(getEffectiveCreditBalance(api, cached)?.spendableCredits).to.eq(0);
  });

  it('retient l’API quand elle est déjà plus basse que le cache', () => {
    const api = { ...base, spendableCredits: 5 };
    const cached = { ...base, spendableCredits: 50 };
    expect(getEffectiveCreditBalance(api, cached)?.spendableCredits).to.eq(5);
  });

  it('retombe sur l’API en l’absence de cache optimiste', () => {
    expect(getEffectiveCreditBalance(base, undefined)).to.eq(base);
  });

  it('retombe sur le cache quand l’API est indisponible', () => {
    expect(getEffectiveCreditBalance(undefined, base)).to.eq(base);
  });
});
