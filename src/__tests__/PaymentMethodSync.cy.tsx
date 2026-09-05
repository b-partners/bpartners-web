import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { MAX_PAYMENT_METHOD_SYNC_ATTEMPTS } from '@/operations/account/components/billing';
import { User } from '@bpartners/typescript-client';
import { accountHolders1, accounts1, businessActivities, creditBalance, creditPacks, visaPaymentMethods } from './mocks/responses';
import { user1 } from './mocks/responses/security-api';
import { ongoingSubscriptionCommitments } from './mocks/responses/subscription-commitments-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

Cypress.on('uncaught:exception', () => false);

const proPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;

const activeUser: User = {
  ...user1,
  subscription: { status: 'ACTIVE', start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-04-01T00:00:00Z'), plan: proPlan, billingInterval: 'MONTHLY' },
};

const COMPLETED_PURCHASE = { id: 'purchase-9', type: 'PACK', credits: 500, status: 'COMPLETED', creditTransactionId: 'transaction-9' };

let paymentMethodCalls = 0;

const openBilling = (cardAvailableAfterCalls: number) => {
  cy.cognitoLogin({ whoami: { user: activeUser }, user: activeUser });

  cy.intercept('GET', `/users/${user1.id}/accounts`, accounts1).as('getAccount1');
  cy.intercept('GET', `/users/${user1.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', `**/users/${user1.id}/subscriptionCommitments*`, ongoingSubscriptionCommitments).as('getCommitments');
  cy.intercept('GET', `/users/${user1.id}/creditBalance`, creditBalance).as('getCreditBalance');
  cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
  cy.intercept('GET', `/users/${user1.id}/creditPurchases/purchase-9`, COMPLETED_PURCHASE).as('getCreditPurchase');
  cy.intercept('GET', `/users/${user1.id}/paymentMethods*`, req => {
    paymentMethodCalls += 1;
    req.reply(paymentMethodCalls > cardAvailableAfterCalls ? visaPaymentMethods : []);
  }).as('getPaymentMethods');

  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.get('[name="open-billing-modal"]').click();
  cy.wait('@getCreditBalance');
  cy.wait('@getPaymentMethods');
};

const returnFromStripe = () =>
  cy.window().then(win => {
    win.history.pushState({}, '', `${win.location.pathname}?creditPurchaseStatus=done&creditPurchaseId=purchase-9`);
    win.dispatchEvent(new win.PopStateEvent('popstate'));
  });

describe('Payment method sync after a credit purchase', () => {
  beforeEach(() => {
    paymentMethodCalls = 0;
    useDialog.getState().close();
  });

  it('polls the payment method until the card used on Stripe is attached', () => {
    openBilling(3);
    cy.contains('Aucun moyen de paiement').should('be.visible');

    returnFromStripe();

    cy.get('#billing-payment-method-sync').should('be.visible').and('contain', 'Enregistrement de votre moyen de paiement…');
    cy.contains(`Tentative 1 sur ${MAX_PAYMENT_METHOD_SYNC_ATTEMPTS}`).should('be.visible');

    cy.wait('@getCreditPurchase');
    cy.contains('Paiement effectué, 500 crédits ont été ajoutés à votre solde.').should('be.visible');
    cy.location('search').should('eq', '');
    cy.get('#billing-payment-method-sync').should('be.visible');

    cy.contains('Visa •••• 4242', { timeout: 15000 }).should('be.visible');
    cy.contains('Carte enregistrée automatiquement après votre achat de crédits.').should('be.visible');
    cy.get('#billing-payment-method-sync').should('not.exist');
    cy.wrap(null).should(() => expect(paymentMethodCalls, 'three polls on top of the initial read').to.eq(4));
  });

  it('does not poll when a card is already attached', () => {
    openBilling(0);
    cy.contains('Visa •••• 4242').should('be.visible');

    returnFromStripe();
    cy.wait('@getCreditPurchase');

    cy.get('#billing-payment-method-sync').should('not.exist');
    cy.contains('Expire le 04/2028').should('be.visible');
    cy.wait(4000);
    cy.get('#billing-payment-method-sync').should('not.exist');
    cy.wrap(null).should(() => expect(paymentMethodCalls, 'the initial read is the only one').to.eq(1));
  });

  it('gives up after the maximum number of attempts and offers to add the card manually', () => {
    openBilling(Infinity);

    returnFromStripe();
    cy.get('#billing-payment-method-sync').should('be.visible');

    Cypress._.times(MAX_PAYMENT_METHOD_SYNC_ATTEMPTS - 1, attempt => {
      cy.contains(`Tentative ${attempt + 1} sur ${MAX_PAYMENT_METHOD_SYNC_ATTEMPTS}`, { timeout: 10000 }).should('exist');
    });

    cy.contains('Nous n’avons pas pu récupérer votre carte automatiquement, ajoutez-la manuellement.', { timeout: 20000 }).should('be.visible');
    cy.get('#billing-payment-method-sync').should('not.exist');
    cy.get('[name="billing-update-payment-method"]').should('be.visible').and('contain', 'Ajouter une carte');
    cy.wrap(null).should(() => expect(paymentMethodCalls, 'the poll never exceeds the allowed attempts').to.eq(MAX_PAYMENT_METHOD_SYNC_ATTEMPTS + 1));
  });
});
