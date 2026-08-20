import App from '@/App';
import { useDialog } from '@/common/store/dialog';
import { isSubscriptionCancellationEnabled } from '@/operations/account/components/billing';
import { BillingInterval, User, UserSubscriptionCommitment } from '@bpartners/typescript-client';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1, businessActivities, creditBalance, creditPacks, emptyCreditBalance, visaPaymentMethods } from './mocks/responses';
import { user1 } from './mocks/responses/security-api';
import { ongoingSubscriptionCommitments } from './mocks/responses/subscription-commitments-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const STRIPE_REDIRECTION_URL = 'https://checkout.stripe.com/c/pay/cs_test_123';
const PAYMENT_METHOD_URL = 'https://checkout.stripe.com/c/pay/cs_test_setup_123';

const APP_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3000';

const CREDIT_PURCHASES_URL = `/users/${user1.id}/creditPurchases/*`;

const proPlan = subscriptionPlans.find(({ id }) => id === 'plan-pro')!;
const usageBasedPlan = subscriptionPlans.find(({ id }) => id === 'plan-usage')!;

const cancelledUser: User = { ...user1, subscription: { status: 'CANCELLED', start: new Date('2026-01-01T00:00:00Z'), end: new Date('2026-04-01T00:00:00Z') } };

const withPlan = (plan: (typeof subscriptionPlans)[number], billingInterval?: BillingInterval): User => ({
  ...user1,
  subscription: {
    status: 'ACTIVE',
    start: new Date('2026-01-01T00:00:00Z'),
    end: new Date('2026-04-01T00:00:00Z'),
    plan,
    billingInterval,
  },
});

interface OpenBillingOptions {
  user?: User;
  commitments?: UserSubscriptionCommitment[];
  balance?: object;
  packs?: object;
  paymentMethods?: object;
}

const openBilling = ({
  user = withPlan(proPlan, 'MONTHLY'),
  commitments = ongoingSubscriptionCommitments,
  balance = creditBalance,
  packs = creditPacks,
  paymentMethods = visaPaymentMethods,
}: OpenBillingOptions = {}) => {
  cy.cognitoLogin({ whoami: { user }, user });
  cy.stub(Redirect, 'toURL').as('toURL');

  cy.intercept('GET', `/users/${user1.id}/accounts`, accounts1).as('getAccount1');
  cy.intercept('GET', `/users/${user1.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
  cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
  cy.intercept('GET', `**/users/${user1.id}/subscriptionCommitments*`, commitments).as('getCommitments');
  cy.intercept('GET', `/users/${user1.id}/creditBalance`, balance).as('getCreditBalance');
  cy.intercept('GET', '**/creditPacks*', packs).as('getCreditPacks');
  cy.intercept('GET', `/users/${user1.id}/paymentMethods*`, paymentMethods).as('getPaymentMethods');

  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.get('[name="open-billing-modal"]').click();
  cy.wait('@getCreditBalance');
};

const trackStripeReturn = (status: string, purchaseId = 'purchase-9') =>
  cy.window().then(win => {
    win.history.pushState({}, '', `${win.location.pathname}?creditPurchaseStatus=${status}&creditPurchaseId=${purchaseId}`);
    win.dispatchEvent(new win.PopStateEvent('popstate'));
  });

const openPacks = () => {
  cy.get('[name="billing-toggle-credit-packs"]').click();
  cy.wait('@getCreditPacks');
};

describe('Billing modal', () => {
  beforeEach(() => {
    useDialog.getState().close();
  });

  it('gathers the subscription, the payment method, the credits and the invoices on a single page', () => {
    openBilling();

    cy.contains('Facturation').should('be.visible');
    cy.contains('Mon abonnement').should('be.visible');
    cy.contains('Pro').should('be.visible');
    cy.get('.billing-plan-meta')
      .should('contain', 'Montant')
      .and('contain', 'Paiement')
      .and('contain', 'MENSUEL')
      .and('contain', 'Prélevé chaque début de mois')
      .and('contain', 'Engagement')
      .and('contain', '12 mois')
      .and('contain', 'Renouvellement')
      .and('contain', '01/04/2026')
      .and('contain', 'Sans reconduction automatique');

    cy.contains('Moyen de paiement').should('be.visible');
    cy.contains('Visa •••• 4242').should('be.visible');
    cy.contains('Expire le 04/2028').should('be.visible');

    cy.contains("Crédits d'analyses").should('be.visible');
    cy.get('.billing-donut-value').should('have.text', '320');
    cy.get('.billing-donut-label').should('have.text', 'Crédits disponibles');
    cy.contains('.billing-credit-line', 'Crédits inclus').should('contain', '200');
    cy.contains('.billing-credit-line', 'Crédits achetés').should('contain', '120');
    cy.get('.billing-credit-line-value').then($values => {
      const [granted, purchased] = $values.toArray().map(element => element.getBoundingClientRect());
      const details = Cypress.$('.billing-credits-details')[0].getBoundingClientRect();
      expect(Math.round(granted.right), 'les valeurs sont alignées entre elles').to.eq(Math.round(purchased.right));
      expect(granted.right, 'les valeurs restent près des libellés, pas au bord de la carte').to.be.lessThan(details.right - 200);
    });
    cy.contains('≈ 32 analyses').should('be.visible');
    cy.contains('Vos crédits inclus sont renouvelés le 01/04/2026').should('be.visible');
    cy.contains('120 crédits expirent le 01/09/2026').should('be.visible');

    cy.get('.billing-invoice-month').should('have.length', 12);
  });

  it('details the granted and the purchased credits on hover', () => {
    openBilling();

    cy.get('.billing-donut-slice--granted').trigger('mouseover', { force: true });
    cy.get('.billing-donut-value').should('have.text', '200');
    cy.get('.billing-donut-label').should('have.text', 'Crédits inclus');

    cy.get('.billing-donut-slice--purchased').trigger('mouseover', { force: true });
    cy.get('.billing-donut-value').should('have.text', '120');
    cy.get('.billing-donut-label').should('have.text', 'Crédits achetés');

    cy.get('.billing-donut-slice--purchased').trigger('mouseout', { force: true });
    cy.get('.billing-donut-value').should('have.text', '320');
    cy.get('.billing-donut-label').should('have.text', 'Crédits disponibles');
  });

  it('shows an empty wallet without any chart', () => {
    openBilling({ balance: emptyCreditBalance });

    cy.get('.billing-donut-empty').should('exist');
    cy.get('.billing-donut-slice--granted').should('not.exist');
    cy.get('.billing-donut-value').should('have.text', '0');
    cy.contains('Vos crédits inclus sont renouvelés à chaque période de facturation.').should('be.visible');
    cy.contains('crédits expirent le').should('not.exist');
  });

  it('warns when the balance cannot be loaded', () => {
    openBilling({ balance: { statusCode: 500, body: {} } });

    cy.contains('Impossible de charger votre solde de crédits pour le moment.').should('be.visible');
    cy.get('.billing-donut').should('not.exist');
  });

  it('warns when the credit packs cannot be loaded', () => {
    openBilling({ packs: { statusCode: 500, body: {} } });
    openPacks();

    cy.contains('Impossible de charger les offres de crédits pour le moment.').should('be.visible');
    cy.get('.billing-pack').should('not.exist');
  });

  it('hides the packs again when the offers are toggled off', () => {
    openBilling();
    openPacks();
    cy.get('.billing-pack').should('have.length', 4);

    cy.get('[name="billing-toggle-credit-packs"]').should('contain', 'Masquer les offres').click();
    cy.get('.billing-pack').should('not.exist');
  });

  it('hides the upgrade action on an active subscription', () => {
    openBilling();

    cy.contains('Mon abonnement').should('be.visible');
    cy.get('[name="billing-upgrade-subscription"]').should('not.exist');
    cy.contains('Faire évoluer mon offre').should('not.exist');
  });

  it('describes a subscription billed per analysis', () => {
    openBilling({ user: withPlan(usageBasedPlan, 'MONTHLY') });

    cy.contains("À l'usage").should('be.visible');
    cy.get('.billing-plan-meta').should('contain', 'Paiement').and('contain', 'Facturé à chaque analyse').and('not.contain', 'Engagement');
  });

  it('shows a yearly payment without any commitment block', () => {
    openBilling({ user: withPlan(proPlan, 'YEARLY'), commitments: [] });

    cy.get('.billing-plan-meta').should('contain', 'ANNUEL').and('contain', 'Payé en une fois pour l’année').and('not.contain', 'Engagement');
    cy.get('.billing-plan-price')
      .invoke('text')
      .should('match', /^1\s069\s€$/);
    cy.get('.billing-price-discount')
      .invoke('text')
      .should('match', /^au lieu de 1\s188\s€ \/ an$/);
    cy.get('.billing-discount-badge').should('have.text', '-10 %');
    cy.get('.billing-plan-meta').should('contain', 'HT / an · soit 89 € HT / mois');
  });

  it('keeps the periodicity neutral as long as no subscription has been paid', () => {
    openBilling({ user: withPlan(proPlan), commitments: [] });

    cy.get('.billing-plan-meta').should('contain', 'Périodicité définie au premier paiement').and('not.contain', 'Engagement');
    cy.get('.billing-price-discount').should('not.exist');
    cy.get('.billing-discount-badge').should('not.exist');
    cy.get('.billing-plan-meta').should('contain', 'HT / mois');
    cy.get('.billing-plan-meta').should('not.contain', 'MENSUEL').and('not.contain', 'ANNUEL');
  });

  (isSubscriptionCancellationEnabled() ? describe : describe.skip)('Résiliation', () => {
    it('cancels the subscription once the resiliation is confirmed', () => {
      cy.intercept('POST', `/users/${user1.id}/subscriptionCancel`, { ...cancelledUser }).as('cancelSubscription');

      openBilling();

      cy.get('[name="billing-cancel-subscription"]')
        .scrollIntoView()
        .should('be.visible')
        .and('contain', 'Résilier mon abonnement')
        .and('have.css', 'color', 'rgb(211, 47, 47)');
      cy.contains('Accès conservé jusqu’au 01/04/2026').should('be.visible');
      cy.get('[name="billing-cancel-subscription"]').click();

      cy.contains('Résilier votre abonnement ?').should('be.visible');
      cy.contains('.confirm-row', 'Renouvellement').should('contain', 'Arrêté');
      cy.contains('.confirm-row', 'Accès conservé jusqu’au').should('contain', '01/04/2026');
      cy.get('[name="confirm-subscription-cancel"]').click();

      cy.wait('@cancelSubscription');
      cy.contains('Votre abonnement ne sera pas renouvelé.').should('be.visible');
      cy.contains('Résilier votre abonnement ?').should('not.exist');
    });

    it('keeps the subscription when the resiliation is declined', () => {
      cy.intercept('POST', `/users/${user1.id}/subscriptionCancel`, { statusCode: 500, body: {} }).as('cancelSubscription');

      openBilling();
      cy.get('[name="billing-cancel-subscription"]').click();
      cy.get('[name="keep-subscription"]').click();

      cy.contains('Résilier votre abonnement ?').should('not.exist');
      cy.get('@cancelSubscription.all').should('have.length', 0);
    });

    it('notifies when the resiliation fails', () => {
      cy.intercept('POST', `/users/${user1.id}/subscriptionCancel`, { statusCode: 500, body: { message: 'La résiliation a échoué.' } }).as(
        'cancelSubscription'
      );

      openBilling();
      cy.get('[name="billing-cancel-subscription"]').click();
      cy.get('[name="confirm-subscription-cancel"]').click();

      cy.wait('@cancelSubscription');
      cy.contains('La résiliation a échoué.').should('be.visible');
    });

    it('hides the resiliation without an active subscription', () => {
      openBilling({ user: cancelledUser });

      cy.contains('Aucun abonnement actif').should('be.visible');
      cy.get('[name="billing-cancel-subscription"]').should('not.exist');
      cy.contains('Résilier mon abonnement').should('not.exist');
      cy.get('[name="billing-choose-subscription"]').should('be.visible');
    });
  });

  it('shows that no card is registered yet', () => {
    openBilling({ paymentMethods: [] });

    cy.contains('Aucun moyen de paiement').should('be.visible');
    cy.contains('Enregistrez une carte pour souscrire et acheter des crédits.').should('be.visible');
    cy.get('[name="billing-update-payment-method"]').should('be.visible').and('contain', 'Ajouter une carte');
  });

  it('warns when the payment method cannot be read', () => {
    openBilling({ paymentMethods: { statusCode: 500, body: {} } });

    cy.contains('Moyen de paiement indisponible').should('be.visible');
    cy.get('[name="billing-update-payment-method"]').should('contain', 'Ajouter une carte');
  });

  it('replaces the registered card through Stripe', () => {
    cy.intercept('PUT', `/users/${user1.id}/paymentMethods*`, { redirectionUrl: PAYMENT_METHOD_URL }).as('paymentMethodReplacement');

    openBilling();
    cy.get('[name="billing-update-payment-method"]').should('contain', 'Remplacer la carte').click();

    cy.wait('@paymentMethodReplacement').then(({ request }) => {
      expect(request.body.successUrl).to.contain(`${APP_BASE_URL}/account/${user1.id}?stripePaymentStatus=done`);
    });
    cy.contains('Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement').should('be.visible');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', PAYMENT_METHOD_URL);
  });

  it('lists the purchasable packs without the deprecated ones', () => {
    openBilling();
    openPacks();

    cy.get('.billing-pack').should('have.length', 4);
    cy.get('.billing-packs')
      .should('have.css', 'grid-template-columns')
      .then(columns => expect(String(columns).split(' ')).to.have.length(4));
    cy.contains('.billing-pack', '100 crédits').should('contain', '60 €');
    cy.contains('.billing-pack', '500 crédits').should('contain', '240 €').and('contain', 'Le plus choisi');
    cy.get('[name="buy-credit-pack-PACK_1000"]').closest('.billing-pack').should('contain', '420 €').and('contain', 'crédits');
    cy.get('[name="buy-credit-pack-PACK_CUSTOM"]').closest('.billing-pack').find('.billing-pack-price').should('have.text', '0,72 €');
    cy.contains('Pack obsolète qui ne doit pas être affiché').should('not.exist');
  });

  it('asks for a confirmation and does nothing when it is declined', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, { statusCode: 500, body: {} }).as('submitPurchase');

    openBilling();
    openPacks();
    cy.get('[name="buy-credit-pack-PACK_100"]').click();

    cy.contains('Confirmer votre achat de crédits').should('be.visible');
    cy.contains('.confirm-row', 'Crédits achetés').should('contain', '100');
    cy.contains('.confirm-row', 'Montant à payer').should('contain', '60 €');

    cy.get('[name="cancel-credit-purchase"]').click();
    cy.contains('Confirmer votre achat de crédits').should('not.exist');
    cy.get('@submitPurchase.all').should('have.length', 0);
  });

  it('debits the registered card when the purchase needs no redirection', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, {
      id: 'purchase-1',
      type: 'PACK',
      credits: 500,
      status: 'COMPLETED',
      amountInCentsWithVat: 24000,
      creditTransactionId: 'transaction-1',
      invoiceId: 'invoice-1',
    }).as('submitPurchase');

    openBilling();
    openPacks();
    cy.get('[name="buy-credit-pack-PACK_500"]').click();
    cy.get('[name="confirm-credit-purchase"]').click();

    cy.wait('@submitPurchase').then(({ request }) => {
      expect(request.url).to.match(/creditPurchases\/[0-9a-f-]{36}$/);
      expect(request.body).to.deep.include({ type: 'PACK', creditPackIdentifier: 'pack-500', quantity: 1 });
      expect(request.body.redirectionStatusUrls.successUrl).to.contain(`${APP_BASE_URL}/account/${user1.id}?creditPurchaseStatus=done&creditPurchaseId=`);
    });

    cy.contains('Paiement effectué, 500 crédits ont été ajoutés à votre solde.').should('be.visible');
    cy.contains('Votre facture vous sera envoyée par mail.').should('be.visible');
    cy.get('@getCreditBalance.all').should('have.length', 2);
    cy.get('@toURL').should('not.have.been.called');
  });

  it('redirects to Stripe when the purchase carries a redirection', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, {
      id: 'purchase-2',
      type: 'PACK',
      credits: 100,
      status: 'PENDING',
      amountInCentsWithVat: 6000,
      redirection: { redirectionUrl: STRIPE_REDIRECTION_URL },
    }).as('submitPurchase');

    openBilling();
    openPacks();
    cy.get('[name="buy-credit-pack-PACK_100"]').click();
    cy.get('[name="confirm-credit-purchase"]').click();

    cy.wait('@submitPurchase');
    cy.contains('Vous allez être redirigé vers Stripe pour finaliser votre achat de crédits').should('be.visible');
    cy.get('@toURL', { timeout: 8000 }).should('have.been.calledWith', STRIPE_REDIRECTION_URL);
  });

  it('buys a freely chosen amount of credits', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, {
      id: 'purchase-3',
      type: 'CUSTOM',
      credits: 120,
      status: 'COMPLETED',
      amountInCentsWithVat: 8640,
    }).as('submitPurchase');

    openBilling();
    openPacks();

    cy.get('[name="credit-pack-custom-credits-PACK_CUSTOM"]').clear().type('120');
    cy.contains('.billing-pack', 'Montant libre').should('contain', '86,4 €');
    cy.get('[name="buy-credit-pack-PACK_CUSTOM"]').click();

    cy.contains('.confirm-row', 'Crédits achetés').should('contain', '120');
    cy.get('[name="confirm-credit-purchase"]').click();

    cy.wait('@submitPurchase').then(({ request }) => {
      expect(request.body).to.deep.include({ type: 'CUSTOM', credits: 120 });
      expect(request.body.creditPackIdentifier).to.eq(undefined);
    });

    cy.contains('Paiement effectué, 120 crédits ont été ajoutés à votre solde.').should('be.visible');
  });

  it('keeps the purchase pending when the payment is not confirmed yet', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, { id: 'purchase-4', type: 'PACK', credits: 100, status: 'PENDING' }).as('submitPurchase');

    openBilling();
    openPacks();
    cy.get('[name="buy-credit-pack-PACK_100"]').click();
    cy.get('[name="confirm-credit-purchase"]').click();

    cy.wait('@submitPurchase');
    cy.contains('Votre achat est en cours de traitement').should('be.visible');
    cy.get('@toURL').should('not.have.been.called');
  });

  it('warns when the payment method page carries no redirection', () => {
    cy.intercept('PUT', `/users/${user1.id}/paymentMethods*`, {}).as('paymentMethodReplacement');

    openBilling();
    cy.get('[name="billing-update-payment-method"]').click();

    cy.wait('@paymentMethodReplacement');
    cy.contains('Impossible d’ouvrir la page de saisie de votre moyen de paiement pour le moment.').should('be.visible');
    cy.get('@toURL').should('not.have.been.called');
  });

  it('notifies when the payment method insertion fails', () => {
    cy.intercept('PUT', `/users/${user1.id}/paymentMethods*`, { statusCode: 500, body: {} }).as('paymentMethodReplacement');

    openBilling();
    cy.get('[name="billing-update-payment-method"]').click();

    cy.wait('@paymentMethodReplacement');
    cy.get('.MuiSnackbar-root').should('be.visible');
    cy.get('[name="billing-update-payment-method"]').should('be.enabled');
  });

  it('credits the wallet when the Stripe payment is confirmed', () => {
    cy.intercept('GET', `/users/${user1.id}/creditPurchases/purchase-9`, {
      id: 'purchase-9',
      type: 'PACK',
      credits: 500,
      status: 'COMPLETED',
      creditTransactionId: 'transaction-9',
    }).as('getCreditPurchase');

    openBilling();
    trackStripeReturn('done');

    cy.wait('@getCreditPurchase');
    cy.contains('Paiement effectué, 500 crédits ont été ajoutés à votre solde.').should('be.visible');
    cy.get('@getCreditBalance.all').should('have.length', 2);
    cy.location('search').should('eq', '');
  });

  it('warns when the Stripe payment was abandoned', () => {
    cy.intercept('GET', `/users/${user1.id}/creditPurchases/purchase-9`, { id: 'purchase-9', status: 'EXPIRED' }).as('getCreditPurchase');

    openBilling();
    trackStripeReturn('error');

    cy.contains('Votre paiement n’a pas été finalisé, aucun crédit n’a été ajouté.').should('be.visible');
    cy.get('@getCreditPurchase.all').should('have.length', 0);
    cy.location('search').should('eq', '');
  });

  it('warns when the tracked purchase ends up failed', () => {
    cy.intercept('GET', `/users/${user1.id}/creditPurchases/purchase-8`, { id: 'purchase-8', status: 'FAILED' }).as('getCreditPurchase');

    openBilling();
    trackStripeReturn('done', 'purchase-8');

    cy.wait('@getCreditPurchase');
    cy.contains('Votre achat de crédits n’a pas abouti, aucun crédit n’a été ajouté.').should('be.visible');
    cy.location('search').should('eq', '');
  });

  it('notifies when the purchase is rejected', () => {
    cy.intercept('PUT', CREDIT_PURCHASES_URL, { statusCode: 400, body: { message: 'Le montant demandé dépasse la limite autorisée.' } }).as('submitPurchase');

    openBilling();
    openPacks();
    cy.get('[name="buy-credit-pack-PACK_100"]').click();
    cy.get('[name="confirm-credit-purchase"]').click();

    cy.wait('@submitPurchase');
    cy.contains('Le montant demandé dépasse la limite autorisée.').should('be.visible');
  });
});
