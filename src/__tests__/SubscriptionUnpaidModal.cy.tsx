import { SubscriptionUnpaidModal } from '@/common/components';
import { formatDate, Redirect } from '@/common/utils';
import { authProvider } from '@/providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { user1 } from './mocks/responses/security-api';
import { unpaidSubscriptionInvoiceNoMeta, unpaidSubscriptionInvoiceNoUrl, unpaidSubscriptionInvoices } from './mocks/responses/subscription-invoice-api';

const SUBSCRIPTION_INVOICES_URL = `/users/${user1.id}/subscriptionInvoices*`;
const ITEM = '.unpaid-table tbody tr';
const PAY_BUTTON = '.unpaid-item-pay';

const mountModal = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SubscriptionUnpaidModal />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SubscriptionUnpaidModal', () => {
  beforeEach(() => {
    cy.cognitoLogin();
  });

  it('requests only the unpaid invoices and lists each one with its label, amount and pay button', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoices).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices').its('request.query.paymentStatuses').should('eq', 'UNPAID');

    cy.contains('Paiement en échec').should('be.visible');
    ['Description', 'Échéance', 'Montant'].forEach(header => cy.contains('.unpaid-table th', header).should('be.visible'));
    cy.get(ITEM).should('have.length', 2);
    cy.get(ITEM).eq(0).should('contain', 'Facture pour la période de 01/08/2026 au 31/08/2026').and('contain', '58,80 €');
    cy.get(ITEM).eq(1).should('contain', 'Abonnement Essentiel — Février 2026').and('contain', '49,90 €');
    cy.get(PAY_BUTTON).should('have.length', 2).each($button => cy.wrap($button).should('contain', 'Régler'));
  });

  it('shows the payment deadline (toPayAt) in the due column, not the creation date', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoices).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');

    const { toPayAt, createdAt } = unpaidSubscriptionInvoices[0].invoice!;
    cy.get(ITEM).eq(0).find('.unpaid-cell-due').should('have.text', formatDate(new Date(toPayAt!)));
    cy.get(ITEM).eq(0).find('.unpaid-cell-due').should('not.contain', formatDate(new Date(createdAt!)));
  });

  it('falls back to a dash in the due column when the invoice has no deadline', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoiceNoMeta).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');

    cy.get(ITEM).eq(0).find('.unpaid-cell-due').should('have.text', '—');
  });

  it('refreshes on demand and reloads to unblock the account once every invoice is paid', () => {
    let call = 0;
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, req => {
      call += 1;
      req.reply(call === 1 ? unpaidSubscriptionInvoices : []);
    }).as('getUnpaidInvoices');
    cy.stub(Redirect, 'reload').as('reload');

    mountModal();
    cy.wait('@getUnpaidInvoices');
    cy.get(ITEM).should('have.length', 2);

    cy.contains('button', "J'ai payé — Actualiser").click();
    cy.wait('@getUnpaidInvoices');

    cy.get(ITEM).should('not.exist');
    cy.get('@reload').should('have.been.called');
  });

  it('opens the Stripe payment url in a new tab when clicking Régler', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoices).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');
    cy.window().then(win => cy.stub(win, 'open').as('windowOpen'));

    cy.get(PAY_BUTTON).first().click();
    cy.get('@windowOpen').should('have.been.calledOnceWith', 'https://stripe.dummy.app/pay/invoice-1', '_blank', 'noopener,noreferrer');
  });

  it('falls back to a default label when the invoice carries no title or ref', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoiceNoMeta).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');

    cy.get(ITEM).should('have.length', 1).and('contain', "Facture d'abonnement");
  });

  it('drops unpaid invoices that have no payment url', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, unpaidSubscriptionInvoiceNoUrl).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');

    cy.get(ITEM).should('not.exist');
    cy.contains('contact@birdia.fr').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('be.visible');
  });

  it('keeps the support contact and logout when there is no unpaid invoice', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, []).as('getUnpaidInvoices');

    mountModal();
    cy.wait('@getUnpaidInvoices');

    cy.get(ITEM).should('not.exist');
    cy.contains('contact@birdia.fr').should('be.visible');
    cy.contains('button', 'Se déconnecter').should('be.visible');
  });

  it('logs the user out when clicking Se déconnecter', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, []).as('getUnpaidInvoices');
    const logout = cy.stub(authProvider, 'logout').resolves();
    cy.stub(Redirect, 'toURL');

    mountModal();
    cy.wait('@getUnpaidInvoices');
    cy.contains('button', 'Se déconnecter').click();

    cy.wrap(null).then(() => expect(logout).to.have.been.called);
  });
});
