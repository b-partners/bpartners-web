import App from '@/App';
import { User } from '@bpartners/typescript-client';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { user1, whoami1 } from './mocks/responses/security-api';

const invalidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'EMPTY' } };
const unpaidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'UNPAID' } };
const noMethodPaymentSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'PAYMENT_METHOD_REQUIRED' } };
const freeTrialSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'FREE_TRIAL' } };
const expectedSubscriptionInitializationPayload = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
    successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
  },
  subscriptionType: 'ESSENTIAL',
};
const expectedSubscriptionBillingPayload = {
  failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
  successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
};

describe('Test user subscription', () => {
  it('Free Trial', () => {
    cy.cognitoLogin({ whoami: { user: freeTrialSubscriptionUser }, user: freeTrialSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.mount(<App />);

    cy.contains('Débloquez immédiatement votre accès en :');
    cy.contains('👉 renseignant un moyen de paiement (aucun prélèvement pendant l’essai)');
    cy.contains('👉 réservant une démo avec un expert BIRDIA pour obtenir votre code d’accès personnalisé');
  });
  it('Invalid subscription', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains('Finalisez votre inscription en toute sérénité !');
    cy.contains(
      'Vous n’avez pas encore d’abonnement actif. Pour continuer à utiliser l’application BIRDIA, veuillez enregistrer votre carte bancaire via notre partenaire sécurisé Stripe.'
    );
    cy.contains('Si vous avez la moindre question, N’hésitez à nous appeler au 06.68.62.48.36 ou par mail à contact@birdia.fr');

    cy.intercept(`/users/${invalidSubscriptionUser.id}/subscriptionInitiation`, ({ body, reply }) => {
      expect(body).deep.equal(expectedSubscriptionInitializationPayload);
      reply({ statusCode: 200 });
    }).as('initializeSubscription');

    cy.dataCy('subscribe-btn').click();
  });
  it('Unpaid subscription', () => {
    cy.cognitoLogin({ whoami: { user: unpaidSubscriptionUser }, user: unpaidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains('Il vous reste des factures impayées.');
    cy.contains('Pour continuer à utiliser l’application, veuillez régulariser votre situation.');

    cy.intercept(`/users/${unpaidSubscriptionUser.id}/billingPortal`, ({ body, reply }) => {
      expect(body).deep.equal(expectedSubscriptionBillingPayload);
      reply({ statusCode: 200 });
    }).as('initializeSubscription');

    cy.dataCy('subscribe-btn').click();
  });
  it('Payment method not specified', () => {
    cy.cognitoLogin({ whoami: { user: noMethodPaymentSubscriptionUser }, user: noMethodPaymentSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains("Période d'essai expirée");
    cy.contains("Votre période d'essai est terminée. Aucun moyen de paiement n'est associé à votre compte.");

    cy.intercept(`/users/${noMethodPaymentSubscriptionUser.id}/billingPortal`, ({ body, reply }) => {
      expect(body).deep.equal(expectedSubscriptionBillingPayload);
      reply({ statusCode: 200 });
    }).as('initializeSubscription');

    cy.dataCy('subscribe-btn').click();
  });
});
