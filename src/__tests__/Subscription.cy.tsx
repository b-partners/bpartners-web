import App from '@/App';
import { userSubscriptionProvider } from '@/providers';
import { User } from '@bpartners/typescript-client';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { user1, whoami1 } from './mocks/responses/security-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const invalidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'EMPTY' } };
const unpaidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'UNPAID' } };
const freeTrialSubscriptionUser: User = { ...user1, subscription: { end: new Date('01/07/2026'), start: new Date('01/01/2026'), status: 'FREE_TRIAL' } };

const chosenPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;
const expectedPlanOrder = ["À l'usage", 'Essentiel', 'Pro', 'Expert'];

const APP_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3000';
const expectedSubscriptionBillingPayload = {
  failureUrl: new URL(`${APP_BASE_URL}?stripeStatus=error`).href,
  successUrl: new URL(`${APP_BASE_URL}/account/${unpaidSubscriptionUser.id}?stripePaymentStatus=done`).href,
};

describe('Test user subscription', () => {
  it('Free Trial', () => {
    cy.cognitoLogin({ whoami: { user: freeTrialSubscriptionUser }, user: freeTrialSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.mount(<App />);

    cy.contains("Choisissez l'offre qui vous convient");
    cy.wait('@getSubscriptionPlans');
    cy.contains('Le plus choisi');
    cy.contains(`Choisir ${chosenPlan.name}`);
    cy.contains('588 € HT / an');

    cy.contains('Ancien plan').should('not.exist');
    cy.get('.plan-name').should('have.length', expectedPlanOrder.length);
    cy.get('.plan-name').each(($el, index) => {
      expect($el.text()).to.equal(expectedPlanOrder[index]);
    });

    cy.get('.MuiDialogContent-root').then($el => {
      expect($el[0].scrollHeight, 'no vertical scroll in dialog content').to.be.at.most($el[0].clientHeight + 2);
    });
  });
  it('Invalid subscription', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.mount(<App />);

    cy.contains("Choisissez l'offre qui vous convient");
    cy.wait('@getSubscriptionPlans');

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: 'http://dummy-url.com' });

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.get('@initSubscription').should('have.been.calledOnceWith', chosenPlan.id);
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
