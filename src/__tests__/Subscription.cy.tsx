import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { formatEuros } from '@/operations/account/components/billing/utils';
import { getPlanFeatureLines } from '@/operations/account/components/plan-features';
import { profileProvider, userSubscriptionProvider } from '@/providers';
import { User } from '@bpartners/typescript-client';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { creditBalance, creditPacks, emptyCreditBalance } from './mocks/responses/credits-api';
import { visaPaymentMethods } from './mocks/responses/payment-method-api';
import { user1, whoami1 } from './mocks/responses/security-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const invalidSubscriptionUser: User = { ...user1, subscription: { end: null, start: null, status: 'EMPTY' } };
const freeTrialSubscriptionUser: User = { ...user1, subscription: { end: new Date('01/07/2026'), start: new Date('01/01/2026'), status: 'FREE_TRIAL' } };

const chosenPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;
const usageBasedPlan = subscriptionPlans.find(({ id }) => id === 'plan-usage')!;
const trialPlan = subscriptionPlans.find(({ id }) => id === 'plan-essential')!;

const trialOnEssentialUser: User = {
  ...user1,
  subscription: {
    end: new Date('01/07/2026'),
    start: new Date('01/01/2026'),
    status: 'FREE_TRIAL',
    plan: { id: trialPlan.id, name: trialPlan.name },
  },
};

const eligibleForEssentialTrial = [{ subscriptionPlanIdentifier: trialPlan.id, eligible: true, reason: 'ELIGIBLE' }];
const expectedPlanOrder = ["À l'usage", 'Essentiel', 'Pro', 'Expert'];

const STRIPE_REDIRECTION_URL = 'https://checkout.stripe.com/c/pay/cs_test_123';
const CUSTOM_REDIRECTION_URL = 'https://dashboard.bpartners.app/subscribe/confirm';

const cancelledSubscriptionUser: User = { ...user1, subscription: { end: dayjs().add(29, 'day').toDate(), start: new Date(), status: 'CANCELLED' } };

const formatMonth = (monthsFromNow: number) => dayjs().add(monthsFromNow, 'month').locale('fr').format('MMMM YYYY');

const goToConsentStep = () => {
  cy.get('[data-cy=billing-interval-monthly]').click();
  cy.contains(`Choisir ${chosenPlan.name}`).click();
  cy.contains('Confirmation de votre abonnement');
};

const mountInvalidSubscription = () => {
  cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

  cy.stub(Redirect, 'toURL').as('toURL');

  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
  cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
  cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
  cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

  cy.mount(<App />);

  cy.contains("Choisissez l'offre qui vous correspond le mieux.");
  cy.wait('@getSubscriptionPlans');
};

describe('Test user subscription', () => {
  beforeEach(() => {
    useDialog.getState().close();
    cy.intercept('GET', '**/subscriptionTrialEligibility*', []).as('getTrialEligibility');
  });

  it('Free Trial', () => {
    cy.cognitoLogin({ whoami: { user: freeTrialSubscriptionUser }, user: freeTrialSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');
    cy.mount(<App />);

    cy.contains("Choisissez l'offre qui vous correspond le mieux.");
    cy.wait('@getSubscriptionPlans');
    cy.contains('Le plus choisi');
    cy.contains(`Choisir ${chosenPlan.name}`);
    cy.contains('529 € HT / an');

    cy.contains('Ancien plan').should('not.exist');
    cy.contains('Renouvelez votre abonnement').should('not.exist');
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
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);

    cy.contains("Choisissez l'offre qui vous correspond le mieux.");
    cy.wait('@getSubscriptionPlans');

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: 'http://dummy-url.com' });

    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.get('@initSubscription').should('have.been.calledOnceWith', chosenPlan.id);
  });
  it('Subscription flow: plan choice then consent then Stripe pre-redirect', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.get('[data-cy=billing-interval-monthly]').click();
    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.get('@initSubscription').should('have.been.calledOnceWith', chosenPlan.id);

    cy.contains('Confirmation de votre abonnement');
    cy.contains('12 mois');
    cy.contains('conditions générales d’utilisation').should('have.attr', 'href', 'https://www.birdia.fr/conditions-generales-d-utilisation');

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
  it('Subscription flow: commitment period is expressed in months', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });

    goToConsentStep();

    cy.get('.consent-date-value').should('have.length', 2);
    cy.get('.consent-date-value').first().should('have.text', formatMonth(0));
    cy.get('.consent-date-value').last().should('have.text', formatMonth(11));
  });
  it('Subscription flow: confirmation step summarises the chosen plan', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });

    goToConsentStep();
    cy.contains('button', 'Accepter').click();
    cy.contains('Confirmez votre choix');

    cy.get('.consent-recap-plan-name').should('have.text', chosenPlan.name).and('have.css', 'text-transform', 'uppercase');
    cy.get('.consent-recap-plan-amount').should('have.text', formatEuros(chosenPlan.priceInCentsWithoutVat));
    cy.get('.consent-recap-plan-vat').should('contain', formatEuros(chosenPlan.priceInCentsWithVat)).and('contain', 'TTC / mois');
    cy.get('.consent-recap-feature').should('have.length', getPlanFeatureLines(chosenPlan).length);
    cy.get('.consent-recap-row').first().should('contain', formatMonth(0)).and('contain', formatMonth(11));
    cy.get('.consent-recap-row').last().should('contain', 'Désactivé');
  });
  it('Subscription flow: dialog keeps the same size from consent to redirection', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    goToConsentStep();

    cy.get('.MuiDialog-paper').then($consent => {
      const width = $consent.outerWidth();
      const height = $consent.outerHeight();

      cy.contains('button', 'Accepter').click();
      cy.contains('Confirmez votre choix');
      cy.get('.MuiDialog-paper').should($confirmation => {
        expect($confirmation.outerWidth(), 'confirmation dialog width').to.equal(width);
        expect($confirmation.outerHeight(), 'confirmation dialog height').to.equal(height);
      });

      cy.contains('button', 'Confirmer').click();
      cy.contains('Vous allez être redirigé vers Stripe pour souscrire à l’abonnement');
      cy.get('.MuiDialog-paper').should($redirection => {
        expect($redirection.outerWidth(), 'redirection dialog width').to.equal(width);
        expect($redirection.outerHeight(), 'redirection dialog height').to.equal(height);
      });
    });
  });
  it('Subscription modal: the renewal notice only shows for a cancelled subscription', () => {
    cy.cognitoLogin({ whoami: { user: cancelledSubscriptionUser }, user: cancelledSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);

    cy.contains("Choisissez l'offre qui vous correspond le mieux.");
    cy.contains('Renouvelez votre abonnement pour reprendre votre activité sur la plateforme.');
  });
  it('Subscription flow: yearly plan skips consent and redirects directly', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.get('[data-cy=billing-interval-yearly]').click();
    cy.contains('Prix HT · payé en une fois');
    cy.contains(`Choisir ${chosenPlan.name}`).click();

    cy.get('@initSubscription').should('have.been.calledOnceWith', chosenPlan.id, 'YEARLY');
    cy.contains('Confirmation de votre abonnement').should('not.exist');
    cy.get('@saveCommitment.all').should('have.length', 0);

    cy.contains('Vous allez être redirigé vers Stripe pour souscrire à l’abonnement');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', STRIPE_REDIRECTION_URL);
  });
  it('Subscription flow: usage-based plan opens the credit purchase section', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').as('initSubscription').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, creditBalance).as('getCreditBalance');
    cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

    cy.get('[data-cy=billing-interval-yearly]').click();
    cy.contains('button', 'Acheter une analyse').click();

    cy.contains('Facturation').should('be.visible');
    cy.contains("Crédits d'analyses").should('be.visible');
    cy.wait('@getCreditPacks');
    cy.get('.billing-pack').should('have.length', 4);

    cy.get('@initSubscription').should('not.have.been.calledWith', usageBasedPlan.id);
    cy.get('@saveCommitment.all').should('have.length', 0);
    cy.contains('Vous allez être redirigé vers Stripe').should('not.exist');
    cy.contains("Choisissez l'offre qui vous correspond le mieux.").should('not.exist');
  });
  it('Subscription flow: hides the invoices section while the subscription is EMPTY', () => {
    mountInvalidSubscription();

    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, creditBalance).as('getCreditBalance');
    cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

    cy.get('[data-cy=billing-interval-yearly]').click();
    cy.contains('button', 'Acheter une analyse').click();

    cy.contains('Facturation').should('be.visible');
    cy.contains("Crédits d'analyses").should('be.visible');
    cy.contains('Mes factures').should('not.exist');
  });
  it('shows closeable plans and bootstraps account data for an EMPTY subscription without credits but with a registered card', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

    cy.mount(<App />);

    cy.wait('@getPaymentMethods');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.contains("Choisissez l'offre qui vous correspond le mieux.").should('be.visible');
    cy.contains('button', 'Accéder à la plateforme').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('not.exist');
  });
  it('grants platform access without plans for an EMPTY subscription that still has spendable credits', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, creditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);

    cy.wait('@getCreditBalance');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.contains("Choisissez l'offre qui vous correspond le mieux.").should('not.exist');
    cy.contains('button', 'Se déconnecter').should('not.exist');
  });
  it('Subscription flow: auto-renewal checkbox is sent as ENABLED when checked', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'init').resolves({ redirectionUrl: CUSTOM_REDIRECTION_URL });
    cy.intercept('POST', '**/subscriptionCommitments', req => req.reply({ statusCode: 200, body: req.body })).as('saveCommitment');

    cy.get('[data-cy=billing-interval-monthly]').click();
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

    cy.get('[data-cy=billing-interval-monthly]').click();
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

    cy.get('[data-cy=billing-interval-monthly]').click();
    cy.contains(`Choisir ${chosenPlan.name}`).click();
    cy.contains('Confirmation de votre abonnement');
    cy.get('.MuiDialogActions-root').contains('button', 'Retour').click();

    cy.contains("Choisissez l'offre qui vous correspond le mieux.");
    cy.get('@toURL').should('not.have.been.called');
  });
  it('Subscription flow: adds a card instead of forcing logout on a mandatory choice', () => {
    mountInvalidSubscription();

    cy.stub(userSubscriptionProvider, 'replacePaymentMethod').as('replacePaymentMethod').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });

    cy.contains('button', 'Ajouter une carte').click();
    cy.get('@replacePaymentMethod').should('have.been.calledOnce');

    cy.contains('Vous allez être redirigé vers Stripe');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', STRIPE_REDIRECTION_URL);
  });
  it('Trial: an eligible plan swaps its subscribe button for the free-trial CTA', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', eligibleForEssentialTrial).as('getTrialEligibility');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);
    cy.wait('@getTrialEligibility');

    cy.contains('button', `Essayer ${trialPlan.trialPeriodDays} jours gratuitement`).should('be.visible');
    cy.contains('button', `Choisir ${trialPlan.name}`).should('not.exist');
    cy.contains('button', `Choisir ${chosenPlan.name}`).should('be.visible');
  });
  it('Trial without a card: the intermediate step requires adding a card before the trial starts', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');
    cy.stub(userSubscriptionProvider, 'startTrial').as('startTrial');
    cy.stub(userSubscriptionProvider, 'initiateTrialPaymentMethod').as('initiateTrialPaymentMethod').resolves({ redirectionUrl: STRIPE_REDIRECTION_URL });

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', eligibleForEssentialTrial).as('getTrialEligibility');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);
    cy.wait('@getTrialEligibility');

    cy.get(`[data-cy=start-trial-${trialPlan.id}]`).click();

    cy.contains('Démarrez votre essai gratuit');
    cy.contains('Aucun débit ne sera effectué pendant toute la durée de votre essai.');
    cy.contains('si vous décidez de continuer');
    cy.contains(`Bénéficiez de ${trialPlan.trialAnalysisGranted} analyses offertes`);
    cy.get('@startTrial').should('not.have.been.called');

    cy.contains('button', 'Ajouter ma carte').click();

    cy.get('@initiateTrialPaymentMethod').should('have.been.calledOnce');
    cy.get('@startTrial').should('not.have.been.called');
    cy.then(() => expect(window.localStorage.getItem('bp_pending_trial_plan')).to.equal(trialPlan.id));

    cy.contains('Vous allez être redirigé vers Stripe pour enregistrer votre carte');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', STRIPE_REDIRECTION_URL);
  });
  it('Trial with a card: the intermediate step starts the trial and redirects to the account trial view', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');
    cy.stub(userSubscriptionProvider, 'startTrial').as('startTrial').resolves({ subscriptionPlanIdentifier: trialPlan.id });
    cy.stub(profileProvider, 'getOne').as('getOne').resolves(trialOnEssentialUser);

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', eligibleForEssentialTrial).as('getTrialEligibility');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

    cy.mount(<App />);
    cy.wait('@getTrialEligibility');

    cy.get(`[data-cy=start-trial-${trialPlan.id}]`).click();

    cy.contains('Démarrez votre essai gratuit');
    cy.contains('si vous décidez de continuer');
    cy.contains('button', 'Démarrer mon essai gratuit').click();

    cy.get('@startTrial').should('have.been.calledOnceWith', trialPlan.id);
    cy.contains('Confirmation de votre abonnement').should('not.exist');
    cy.contains('Vous allez être redirigé vers Stripe').should('not.exist');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWithMatch', `/account/${whoami1.user.id}?trialStarted=done`);
  });
  it('Trial resume: a pending trial auto-starts once the card is registered on the next load', () => {
    cy.cognitoLogin({ whoami: { user: invalidSubscriptionUser }, user: invalidSubscriptionUser });

    cy.stub(Redirect, 'toURL').as('toURL');
    cy.stub(userSubscriptionProvider, 'startTrial').as('startTrial').resolves({ subscriptionPlanIdentifier: trialPlan.id });

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', []).as('getTrialEligibility');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');

    cy.then(() => window.localStorage.setItem('bp_pending_trial_plan', trialPlan.id));

    cy.mount(<App />);

    cy.get('@startTrial').should('have.been.calledOnceWith', trialPlan.id);
    cy.then(() => expect(window.localStorage.getItem('bp_pending_trial_plan')).to.be.null);
  });
  it('Trial: an active trial marks the plan with a badge alongside "Le plus choisi" and still allows subscribing', () => {
    cy.cognitoLogin({ whoami: { user: trialOnEssentialUser }, user: trialOnEssentialUser });

    cy.stub(Redirect, 'toURL').as('toURL');

    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', '**/subscriptionTrialEligibility*', []).as('getTrialEligibility');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0] }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, emptyCreditBalance).as('getCreditBalance');
    cy.intercept('GET', `/users/${whoami1.user.id}/paymentMethods*`, []).as('getPaymentMethods');

    cy.mount(<App />);
    cy.wait('@getSubscriptionPlans');

    cy.get('.plan-card--trial').within(() => {
      cy.get('.plan-badge--trial').should('contain', 'Essai en cours');
      cy.contains('.plan-badge', 'Le plus choisi').should('exist');
      cy.contains('button', `Choisir ${trialPlan.name}`).should('be.visible');
    });
  });
});
