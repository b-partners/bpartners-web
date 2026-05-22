import App from '@/App';
import { User } from '@bpartners/typescript-client';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { user1, whoami1 } from './mocks/responses/security-api';

const invalidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'EMPTY' } };
const unpaidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'UNPAID' } };
const freeTrialSubscriptionUser: User = { ...user1, subscription: { end: new Date('01/07/2026'), start: new Date('01/01/2026'), status: 'FREE_TRIAL' } };

const expectedSubscriptionInitializationPayload = {
  redirectionStatusUrls: {
    failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
    successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripeStatus=done',
  },
  subscriptionType: 'ESSENTIAL',
};
const expectedSubscriptionBillingPayload = {
  failureUrl: 'https://dashboard.preprod.bpartners.app/?stripeStatus=error',
  successUrl: 'https://dashboard.preprod.bpartners.app/account/mock-user-id1?stripePaymentStatus=done',
};

describe('Test user subscription', () => {
  it('Free Trial', () => {
    cy.cognitoLogin({ whoami: { user: freeTrialSubscriptionUser }, user: freeTrialSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.mount(<App />);

    cy.contains('Effectuez votre abonnement en toute sérénité !');
    cy.contains("Activez votre abonnement aujourd'hui pour 49€ HT, votre carte ne sera débitée qu'à compter du 05/02/2026.");
    cy.contains("Début de la période d'essai : 01/01/2026");
    cy.contains("Fin de la période d'essai : 07/01/2026");
    cy.contains('Si vous avez la moindre question, n’hésitez à nous appeler au 06.68.62.48.36 ou par mail à contact@birdia.fr');
  });
  it('Invalid subscription', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains('Effectuez votre abonnement en toute sérénité !');
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

    cy.dataCy('subscription-billing-btn').click();
  });
});
