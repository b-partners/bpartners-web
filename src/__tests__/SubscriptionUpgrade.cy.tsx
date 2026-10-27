import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { formatEuros } from '@/operations/account/components/billing/utils';
import { getCached, profileProvider } from '@/providers';
import { BillingInterval, SubscriptionUpgrade, User } from '@bpartners/typescript-client';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1, businessActivities, creditBalance, creditPacks, visaPaymentMethods } from './mocks/responses';
import { user1 } from './mocks/responses/security-api';
import { ongoingSubscriptionCommitments } from './mocks/responses/subscription-commitments-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const PAYMENT_URL = 'https://checkout.stripe.com/c/pay/cs_test_upgrade';

const APP_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3000';

const UPGRADE_URL = `**/users/${user1.id}/subscriptionUpgrade`;
const UPGRADE_LIST_URL = `**/users/${user1.id}/subscriptionUpgrade*`;

const proPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;
const expertPlan = subscriptionPlans.find(({ id }) => id === 'plan-expert')!;

const withPlan = (plan: (typeof subscriptionPlans)[number], billingInterval: BillingInterval): User => ({
  ...user1,
  subscription: { status: 'ACTIVE', start: new Date('2026-01-01T00:00:00Z'), end: new Date('2027-01-01T00:00:00Z'), plan, billingInterval },
});

const quote: SubscriptionUpgrade = {
  id: 'upgrade-1',
  fromSubscriptionPlanIdentifier: proPlan.id,
  toSubscriptionPlanIdentifier: expertPlan.id,
  fromBillingInterval: 'MONTHLY',
  toBillingInterval: 'MONTHLY',
  upgradeDatetime: new Date(),
  status: 'PENDING',
  prorationAmountInCentsWithVat: 11000,
  newChargeInCentsWithVat: 15000,
  creditedInCentsWithVat: 4000,
  quoteExpirationDatetime: dayjs().endOf('day').toDate(),
  currentSubscriptionCredit: {
    paidPeriodStart: '2026-10-01',
    paidPeriodEnd: '2026-10-31',
    paidAmountInCentsWithVat: 8000,
    consumedAmountInCentsWithVat: 4000,
    remainingPeriodStart: '2026-10-16',
    remainingPeriodEnd: '2026-10-31',
    remainingAmountInCentsWithVat: 4000,
  },
  lines: [
    {
      kind: 'NEW_CHARGE',
      subscriptionPlanIdentifier: expertPlan.id,
      billingInterval: 'MONTHLY',
      periodStart: '2026-10-16',
      periodEnd: '2026-10-31',
      days: 16,
      referencePeriodDays: 31,
      referencePriceInCentsWithVat: 29000,
      amountInCentsWithVat: 15000,
    },
    {
      kind: 'CREDIT',
      subscriptionPlanIdentifier: proPlan.id,
      billingInterval: 'MONTHLY',
      periodStart: '2026-10-16',
      periodEnd: '2026-10-31',
      days: 16,
      referencePeriodDays: 31,
      referencePriceInCentsWithVat: 8000,
      amountInCentsWithVat: 4000,
    },
  ],
};

const awaitingPayment: SubscriptionUpgrade = {
  ...quote,
  status: 'AWAITING_PAYMENT',
  quoteExpirationDatetime: null,
  paymentUrl: PAYMENT_URL,
  paymentExpirationDatetime: dayjs().add(1, 'day').toDate(),
};

const formatMonth = (monthsFromNow: number) => dayjs().add(monthsFromNow, 'month').locale('fr').format('MMMM YYYY');

interface OpenUpgradeOptions {
  user?: User;
  inProgress?: SubscriptionUpgrade[];
}

const openUpgradeModal = ({ user = withPlan(proPlan, 'MONTHLY'), inProgress = [] }: OpenUpgradeOptions = {}) => {
  let inProgressUpgrades = inProgress;

  cy.cognitoLogin({ whoami: { user }, user });
  cy.stub(Redirect, 'toURL').as('toURL');
  cy.stub(profileProvider, 'getOne').as('getProfile').resolves(user);

  cy.intercept('GET', `/users/${user1.id}/accounts`, accounts1).as('getAccount1');
  cy.intercept('GET', `/users/${user1.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', '**/subscriptionTrialEligibility*', []).as('getTrialEligibility');
  cy.intercept('GET', `**/users/${user1.id}/subscriptionCommitments*`, ongoingSubscriptionCommitments).as('getCommitments');
  cy.intercept('GET', `/users/${user1.id}/creditBalance`, creditBalance).as('getCreditBalance');
  cy.intercept('GET', '**/creditPacks*', creditPacks).as('getCreditPacks');
  cy.intercept('GET', `/users/${user1.id}/paymentMethods*`, visaPaymentMethods).as('getPaymentMethods');
  cy.intercept('GET', UPGRADE_LIST_URL, req => req.reply(inProgressUpgrades.filter(({ status }) => status === req.query.status))).as('getUpgrades');
  cy.intercept('PUT', `**/users/${user1.id}/subscriptionUpgrades/${quote.id}`, req => {
    const isAbandon = req.body.status === 'ABANDONED';
    if (isAbandon) inProgressUpgrades = [];
    req.reply({ ...quote, status: isAbandon ? 'ABANDONED' : 'PAID', quoteExpirationDatetime: null });
  }).as('updateUpgrade');

  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.get('[name="open-billing-modal"]').click();
  cy.get('[name="billing-upgrade-subscription"]').should('not.be.disabled').click();
};

const expectCachedPlan = (planId?: string) => cy.wrap(null).should(() => expect(getCached.whoami()?.user?.subscription?.plan?.id).to.eq(planId));

const refreshProfileWith = (plan: (typeof subscriptionPlans)[number]) => cy.get('@getProfile').invoke('resolves', withPlan(plan, 'MONTHLY'));

const upgradeButton = (planId: string) => cy.get(`[data-cy="upgrade-${planId}"]`);

const selectExpertMonthly = () => {
  cy.intercept('POST', UPGRADE_URL, quote).as('startUpgrade');
  cy.get('[data-cy=billing-interval-monthly]').click();
  upgradeButton(expertPlan.id!).click();
  cy.wait('@startUpgrade');
};

const replyToConfirmation = (body: SubscriptionUpgrade) =>
  cy.intercept('PUT', `**/users/${user1.id}/subscriptionUpgrades/${quote.id}`, { body }).as('confirmUpgrade');

describe('Subscription upgrade', () => {
  beforeEach(() => {
    useDialog.getState().close();
  });

  describe('plan eligibility', () => {
    it('only enables the plans reachable from a monthly subscription', () => {
      openUpgradeModal({ user: withPlan(proPlan, 'MONTHLY') });

      upgradeButton('plan-essential').should('be.disabled').and('contain', 'Non disponible');
      upgradeButton('plan-expert').should('not.be.disabled').and('contain', 'Passer à Expert');
      upgradeButton('plan-pro').should('not.be.disabled').and('contain', 'Passer en annuel');

      cy.get('[data-cy=billing-interval-monthly]').click();
      upgradeButton('plan-pro').should('be.disabled').and('contain', 'Offre actuelle');
      upgradeButton('plan-expert').should('not.be.disabled');
      upgradeButton('plan-essential').should('be.disabled');
    });

    it('never allows going from a yearly to a monthly billing interval', () => {
      openUpgradeModal({ user: withPlan(proPlan, 'YEARLY') });

      cy.get('[data-cy=billing-interval-monthly]').should('be.disabled');
      upgradeButton('plan-pro').should('be.disabled').and('contain', 'Offre actuelle');
      upgradeButton('plan-essential').should('be.disabled').and('contain', 'Non disponible');
      upgradeButton('plan-expert').should('not.be.disabled').and('contain', 'Passer à Expert');
    });

    it('does not subject the usage-based plan to the upgrade rules', () => {
      openUpgradeModal();

      cy.contains('button', 'Acheter une analyse').should('not.be.disabled');
      cy.get('[data-cy="upgrade-plan-usage"]').should('not.exist');
    });
  });

  describe('quote review', () => {
    it('sends the chosen plan and billing interval when the session is started', () => {
      openUpgradeModal();
      cy.intercept('POST', UPGRADE_URL, quote).as('startUpgrade');

      cy.get('[data-cy=billing-interval-monthly]').click();
      upgradeButton(expertPlan.id!).click();

      cy.wait('@startUpgrade').its('request.body').should('deep.equal', { subscriptionPlanIdentifier: expertPlan.id, billingInterval: 'MONTHLY' });
    });

    it('shows both plans, the proration lines and the amount to pay before anything is charged', () => {
      openUpgradeModal();
      selectExpertMonthly();

      cy.contains('Rien n’est débité à ce stade');
      cy.contains('Récapitulatif valable jusqu’au');
      cy.get('[data-cy=subscription-upgrade-summary]').within(() => {
        cy.contains('Offre actuelle');
        cy.contains('Nouvelle offre');
        cy.contains('.summary-plan-name', 'Pro');
        cy.contains('.summary-plan-name', 'Expert');
        cy.contains('Vous ne payez pas le prix complet de la nouvelle offre');
        cy.get('[data-cy=subscription-upgrade-calculation]')
          .should('contain', 'Prorata de Expert jusqu’au 31/10/2026')
          .and('contain', 'jusqu’à la fin du mois en cours')
          .and('contain', formatEuros(15000))
          .and('contain', 'Réduction : reste de l’offre Pro déjà payée')
          .and('contain', `− ${formatEuros(4000)}`);
        cy.contains('Montant à régler maintenant');
        cy.get('.summary-amount-value').should('contain', formatEuros(11000)).and('contain', 'TTC');
        cy.contains(`Ensuite, ${formatEuros(expertPlan.priceInCentsWithVat)} TTC par mois`);
        cy.contains(`Engagement renouvelé pour 12 mois, mois complets : ${formatMonth(0)} à ${formatMonth(11)}.`);
      });
    });

    it('abandons the session and goes back to the plans', () => {
      openUpgradeModal();
      selectExpertMonthly();

      cy.contains('button', 'Abandonner').click();

      cy.wait('@updateUpgrade').its('request.body').should('deep.equal', { status: 'ABANDONED' });
      cy.get('.plan-name').should('have.length.greaterThan', 0);
      cy.contains('Récapitulatif de votre changement d’offre').should('not.exist');
    });

    it('shows the API message when the session cannot be started', () => {
      openUpgradeModal();
      cy.intercept('POST', UPGRADE_URL, { statusCode: 409, body: { type: '409 CONFLICT', message: 'Un changement d’offre est déjà en cours.' } }).as(
        'startUpgrade'
      );

      cy.get('[data-cy=billing-interval-monthly]').click();
      upgradeButton(expertPlan.id!).click();

      cy.wait('@startUpgrade');
      cy.contains('Un changement d’offre est déjà en cours.');
      cy.contains('Récapitulatif de votre changement d’offre').should('not.exist');
    });
  });

  describe('confirmation', () => {
    it('confirms the session and shows a success message once PAID', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation({ ...quote, status: 'PAID', quoteExpirationDatetime: null });
      refreshProfileWith(expertPlan);

      cy.contains('button', 'Finaliser').click();

      cy.wait('@confirmUpgrade').its('request.body').should('deep.equal', { status: 'CONFIRMED' });
      expectCachedPlan(expertPlan.id);
      cy.contains('Votre abonnement a été mis à niveau');
      cy.get('[data-cy=subscription-upgrade-PAID]').should('be.visible');
      cy.get('@toURL').should('not.have.been.called');

      cy.contains('button', 'Terminer').click();
      cy.get('@toURL').should('have.been.calledWith', `${APP_BASE_URL}/account/${user1.id}`);
    });

    it('shows a success message mentioning the credit note and the invoice once INVOICED', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation({ ...quote, status: 'INVOICED', quoteExpirationDatetime: null });
      refreshProfileWith(expertPlan);

      cy.contains('button', 'Finaliser').click();

      cy.wait('@confirmUpgrade').its('request.body').should('deep.equal', { status: 'CONFIRMED' });
      expectCachedPlan(expertPlan.id);
      cy.contains('Votre abonnement a été mis à niveau');
      cy.contains('Votre avoir et votre nouvelle facture ont été émis.');
      cy.get('[data-cy=subscription-upgrade-INVOICED]').should('be.visible');
      cy.get('@toURL').should('not.have.been.called');

      cy.contains('button', 'Terminer').click();
      cy.get('@toURL').should('have.been.calledWith', `${APP_BASE_URL}/account/${user1.id}`);
    });

    it('tells the customer the previous subscription is untouched when the upgrade is EXPIRED, and offers to choose again', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation({ ...quote, status: 'EXPIRED', quoteExpirationDatetime: null });
      refreshProfileWith(expertPlan);

      cy.contains('button', 'Finaliser').click();

      cy.wait('@confirmUpgrade');
      cy.contains('Le paiement n’a pas été effectué à temps');
      cy.contains('votre abonnement précédent reste inchangé');
      cy.get('[data-cy=subscription-upgrade-EXPIRED]').should('be.visible');
      cy.contains('button', 'Terminer').should('not.exist');
      cy.contains('button', 'Abandonner').should('not.exist');
      expectCachedPlan(proPlan.id);
      cy.get('@toURL').should('not.have.been.called');

      cy.contains('button', 'Choisir une offre').click();
      cy.get('.plan-name').should('have.length.greaterThan', 0);
      cy.contains('Le paiement n’a pas été effectué à temps').should('not.exist');
    });

    it('redirects to the payment page with the Stripe animation when the payment is not PAID', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation(awaitingPayment);

      cy.contains('button', 'Finaliser').click();

      cy.contains('Vous allez être redirigé vers Stripe pour finaliser le paiement de votre changement d’offre');
      cy.contains('Paiement sécurisé par Stripe');
      cy.get('.redirect-progress').should('be.visible');
      cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', PAYMENT_URL);
    });

    it('stays on the quote with a warning when the charge fails and the session is still PENDING', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation(quote);

      cy.contains('button', 'Finaliser').click();

      cy.wait('@confirmUpgrade');
      cy.contains('Le prélèvement n’a pas abouti');
      cy.contains('button', 'Finaliser').should('not.be.disabled');
      cy.get('@toURL').should('not.have.been.called');
    });

    it('shows the API message when the confirmation is refused', () => {
      openUpgradeModal();
      selectExpertMonthly();
      cy.intercept('PUT', `**/users/${user1.id}/subscriptionUpgrades/${quote.id}`, {
        statusCode: 409,
        body: { type: '409 CONFLICT', message: 'Le devis a expiré.' },
      }).as('confirmUpgrade');

      cy.contains('button', 'Finaliser').click();

      cy.wait('@confirmUpgrade');
      cy.contains('Le devis a expiré.');
      cy.contains('Récapitulatif de votre changement d’offre');
    });

    it('describes an upgrade still being processed without offering to abandon it', () => {
      openUpgradeModal();
      selectExpertMonthly();
      replyToConfirmation({ ...quote, status: 'PROCESSING', quoteExpirationDatetime: null });

      cy.contains('button', 'Finaliser').click();

      cy.contains('Votre changement d’offre est en cours de traitement');
      cy.contains('button', 'Terminer');
      cy.contains('button', 'Abandonner').should('not.exist');
    });
  });

  describe('resuming an upgrade in progress', () => {
    it('only looks for the upgrades that block a new one', () => {
      openUpgradeModal();

      cy.get('@getUpgrades.all').then(calls => {
        const statuses = (calls as unknown as { request: { query: { status: string } } }[]).map(({ request }) => request.query.status);
        expect(Array.from(new Set(statuses))).to.have.members(['PROCESSING', 'AWAITING_PAYMENT']);
      });
    });

    it('opens directly on the payment to finalise, with the summary and the three actions', () => {
      openUpgradeModal({ inProgress: [awaitingPayment] });

      cy.contains('Une validation de votre paiement est nécessaire');
      cy.contains('À payer avant le');
      cy.get('[data-cy=subscription-upgrade-summary]').should('contain', 'Prorata de Expert').and('contain', 'Montant à régler maintenant');
      cy.contains('button', 'Plus tard');
      cy.contains('button', 'Abandonner');
      cy.contains('button', 'Finaliser le paiement');
      cy.get('.plan-name').should('not.exist');
    });

    it('redirects to the payment page with the Stripe animation', () => {
      openUpgradeModal({ inProgress: [awaitingPayment] });

      cy.contains('button', 'Finaliser le paiement').click();

      cy.contains('Vous allez être redirigé vers Stripe pour finaliser le paiement de votre changement d’offre');
      cy.get('.redirect-progress').should('be.visible');
      cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', PAYMENT_URL);
    });

    it('lets the customer abandon a payment awaiting without a payment url', () => {
      openUpgradeModal({ inProgress: [{ ...awaitingPayment, paymentUrl: null }] });

      cy.contains('Une validation de votre paiement est nécessaire');
      cy.contains('button', 'Finaliser le paiement').should('not.exist');
      cy.contains('button', 'Abandonner').click();

      cy.wait('@updateUpgrade').its('request.body').should('deep.equal', { status: 'ABANDONED' });
      cy.get('.plan-name').should('have.length.greaterThan', 0);
    });

    it('abandons the pending payment and goes back to the plans', () => {
      openUpgradeModal({ inProgress: [awaitingPayment] });

      cy.contains('button', 'Abandonner').click();

      cy.wait('@updateUpgrade').its('request.body').should('deep.equal', { status: 'ABANDONED' });
      cy.get('.plan-name').should('have.length.greaterThan', 0);
      cy.contains('Une validation de votre paiement est nécessaire').should('not.exist');
    });

    it('shows the processing message without any abandon action', () => {
      openUpgradeModal({ inProgress: [{ ...awaitingPayment, status: 'PROCESSING', paymentUrl: null, paymentExpirationDatetime: null }] });

      cy.contains('Votre changement d’offre est en cours de traitement');
      cy.contains('button', 'Terminer');
      cy.contains('button', 'Abandonner').should('not.exist');
    });
  });
});
