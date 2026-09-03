import App from '@/App';
import { useOptimisticCreditBalanceStore } from '@/common/store';
import { useDialog } from '@/common/store/dialog';
import { BillingInterval, CreditBalance, User } from '@bpartners/typescript-client';
import { accountHolders1, accounts1, businessActivities, creditBalance, creditPacks, visaPaymentMethods } from './mocks/responses';
import { user1 } from './mocks/responses/security-api';
import { ongoingSubscriptionCommitments } from './mocks/responses/subscription-commitments-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

Cypress.on('uncaught:exception', () => false);

const proPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;

const withPlan = (billingInterval: BillingInterval): User => ({
  ...user1,
  subscription: { status: 'ACTIVE', start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-04-01T00:00:00Z'), plan: proPlan, billingInterval },
});

const OPTIMISTIC_BALANCE: CreditBalance = {
  spendableCredits: 310,
  grantedCredits: 190,
  purchasedCredits: 120,
  creditCostPerAnalysis: 10,
  estimatedRemainingAnalyses: 31,
  nextGrantDatetime: creditBalance.nextGrantDatetime,
  expirations: creditBalance.expirations,
};

const STALE_API_BALANCE = creditBalance;

const UPDATED_API_BALANCE: CreditBalance = {
  ...creditBalance,
  spendableCredits: 310,
  grantedCredits: 190,
  purchasedCredits: 120,
  estimatedRemainingAnalyses: 31,
};

const openBilling = (balance: CreditBalance) => {
  cy.cognitoLogin({ whoami: { user: withPlan('MONTHLY') }, user: withPlan('MONTHLY') });

  cy.intercept('GET', `/users/${user1.id}/accounts`, accounts1).as('getAccount1');
  cy.intercept('GET', `/users/${user1.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', `**/users/${user1.id}/subscriptionCommitments*`, ongoingSubscriptionCommitments).as('getCommitments');
  cy.intercept('GET', `/users/${user1.id}/creditBalance`, balance).as('getCreditBalance');
  cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
  cy.intercept('GET', `/users/${user1.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.then(() => useOptimisticCreditBalanceStore.getState().setBalance(OPTIMISTIC_BALANCE));
  cy.get('[name="open-billing-modal"]').click();
  cy.wait('@getCreditBalance');
};

describe('BillingCreditsSection — solde optimiste et réconciliation', () => {
  beforeEach(() => {
    useDialog.getState().close();
    useOptimisticCreditBalanceStore.getState().clear();
  });

  afterEach(() => useOptimisticCreditBalanceStore.getState().clear());

  it('affiche le solde optimiste cohérent et le conserve tant que l’API reste périmée', () => {
    openBilling(STALE_API_BALANCE);

    cy.get('.billing-donut-value').should('have.text', '310');
    cy.contains('.billing-credit-line', 'Crédits inclus').should('contain', '190');
    cy.contains('.billing-credit-line', 'Crédits achetés').should('contain', '120');
    cy.contains('≈ 31 analyses').should('be.visible');

    cy.wait(5500);
    cy.get('.billing-donut-value').should('have.text', '310');
    cy.wrap(null).should(() => expect(useOptimisticCreditBalanceStore.getState().balance, 'le cache optimiste est conservé').to.not.be.undefined);
  });

  it('bascule sur l’API et vide le cache dès que le solde retourné correspond', () => {
    openBilling(UPDATED_API_BALANCE);

    cy.wrap(null, { timeout: 8000 }).should(
      () => expect(useOptimisticCreditBalanceStore.getState().balance, 'le cache est vidé après correspondance').to.be.undefined
    );

    cy.get('.billing-donut-value').should('have.text', '310');
    cy.contains('.billing-credit-line', 'Crédits inclus').should('contain', '190');
    cy.contains('.billing-credit-line', 'Crédits achetés').should('contain', '120');
  });
});
