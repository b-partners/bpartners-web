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

const STRIPE_REDIRECTION_URL = 'https://checkout.stripe.com/c/pay/cs_test_123';
const CUSTOM_REDIRECTION_URL = 'https://dashboard.bpartners.app/subscribe/confirm';

const mountInvalidSubscription = () => {
  cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

  cy.stub(Redirect, 'toURL').as('toURL');

  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
  cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
  cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

  cy.mount(<App />);

  cy.contains("Choisissez l'offre qui vous convient");
  cy.wait('@getSubscriptionPlans');
};

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
  it('Subscription flow: plan choice then consent then Stripe pre-redirect', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.get('@initSubscription').should('have.been.calledOnceWith', chosenPlan.id);

    cy.contains('Confirmation de votre abonnement');
    cy.contains('12 mois');
    cy.contains('conditions générales d’utilisation');

    cy.get('@toURL').should('not.have.been.called');

    cy.contains('button', 'Accepter').click();

    cy.contains('Confirmez votre choix');
    cy.contains('button', 'Confirmer').click();

    cy.wait('@saveCommitment').then(({ request }) => {
      expect(request.body[0]).to.include({
        subscriptionPlanIdentifier: chosenPlan.id,
        duration: 'TWELVE_MONTHS',
        automaticRenewalStatus: 'DISABLED',
      });
      expect(request.body[0].commitmentStart).to.be.a('string');
      expect(request.body[0].approvalDatetime).to.be.a('string');
    });

    cy.contains('Vous allez être redirigé vers Stripe pour souscrire à l’abonnement');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', STRIPE_REDIRECTION_URL);
  });
  it('Subscription flow: auto-renewal checkbox is sent as ENABLED when checked', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: CUSTOM_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.contains('Confirmation de votre abonnement');
    cy.contains('Renouveler automatiquement mon abonnement').click();
    cy.contains('button', 'Accepter').click();
    cy.contains('button', 'Confirmer').click();

    cy.wait('@saveCommitment').then(({ request }) => {
      expect(request.body[0].automaticRenewalStatus).to.equal('ENABLED');
    });
  });
  it('Subscription flow: non-Stripe url shows registration animation before redirect', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: CUSTOM_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.contains('Confirmation de votre abonnement');
    cy.contains('button', 'Accepter').click();
    cy.contains('button', 'Confirmer').click();

    cy.contains('Votre abonnement est en cours d’enregistrement');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', CUSTOM_REDIRECTION_URL);
  });
  it('Subscription flow: consent back returns to plan choice', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: CUSTOM_REDIRECTION_URL });

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.contains('Confirmation de votre abonnement');
    cy.contains('Retour').click();

    cy.contains("Choisissez l'offre qui vous convient");
    cy.get('@toURL').should('not.have.been.called');
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
