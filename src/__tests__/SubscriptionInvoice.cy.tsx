import App from '@/App';
import {
  accountHolders1,
  accounts1,
  businessActivities,
  creditBalance,
  subscriptionInvoiceMultiple,
  subscriptionInvoiceSingle,
  subscriptionInvoiceWithoutFile,
  whoami1,
} from './mocks/responses';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

const FROZEN_DATE = '2026-03-15T10:00:00Z';

const OPEN_BUTTON = '[name="open-billing-modal"]';
const YEAR_SELECT = '[name="billing-invoice-year"]';
const MONTH_CARD = '.billing-invoice-month';
const YEAR_OPTION = '[role="listbox"] .MuiMenuItem-root';
const SUBSCRIPTION_INVOICES_URL = `/users/${whoami1.user.id}/subscriptionInvoices*`;

const download = (yearMonth: string) => `[name="download-subscription-invoice-${yearMonth}"]`;
const unavailable = (yearMonth: string) => `[name="unavailable-subscription-invoice-${yearMonth}"]`;

const openModal = () => {
  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.get(OPEN_BUTTON).click();
};

const spyOnDownloads = () =>
  cy.window().then((win: any) => {
    win.__downloads = [];
    cy.stub(win.HTMLAnchorElement.prototype, 'click').callsFake(function (this: HTMLAnchorElement) {
      win.__downloads.push({ href: this.href, target: this.target, rel: this.rel, download: this.download });
    });
  });

const expectDownloads = (assertion: (downloads: any[]) => void) => cy.window().then((win: any) => assertion(win.__downloads));

describe('Subscription invoices', () => {
  beforeEach(() => {
    cy.clock(new Date(FROZEN_DATE).getTime(), ['Date']);
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/creditBalance`, creditBalance).as('getCreditBalance');
  });

  it('lists the twelve months and the years down to 2023', () => {
    openModal();

    cy.contains('Mes factures').should('be.visible');
    cy.get(YEAR_SELECT).scrollIntoView();
    cy.contains('Période de :').should('be.visible');

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    cy.get(MONTH_CARD).should('have.length', 12);
    months.forEach((month, index) => cy.get(MONTH_CARD).eq(index).should('contain', month));

    cy.get(YEAR_SELECT).parent().click();
    cy.get(YEAR_OPTION).should('have.length', 4);
    ['2026', '2025', '2024', '2023'].forEach((year, index) => cy.get(YEAR_OPTION).eq(index).should('have.text', year));
  });

  it('offers the months up to the current one and blocks the coming ones', () => {
    openModal();

    ['2026-01', '2026-02', '2026-03'].forEach(yearMonth =>
      cy.get(download(yearMonth)).scrollIntoView().should('be.visible').and('contain', 'Télécharger').and('be.enabled')
    );
    ['2026-04', '2026-12'].forEach(yearMonth =>
      cy.get(unavailable(yearMonth)).scrollIntoView().should('be.visible').and('contain', 'Indisponible').and('be.disabled')
    );

    cy.get(`${MONTH_CARD}.is-available`).should('have.length', 3);
    cy.get(`${MONTH_CARD}.is-unavailable`).should('have.length', 9);
  });

  it('offers every month of a past year', () => {
    openModal();

    cy.get(YEAR_SELECT).parent().click();
    cy.contains(YEAR_OPTION, '2025').click();

    cy.get(`${MONTH_CARD}.is-available`).should('have.length', 12);
    cy.get(`${MONTH_CARD}.is-unavailable`).should('not.exist');
    cy.get(download('2025-12')).should('be.enabled');
  });

  it('requests the clicked month and opens the returned file in a new tab', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, subscriptionInvoiceSingle).as('getSubscriptionInvoices');

    openModal();
    spyOnDownloads();
    cy.get(download('2026-03')).click();

    cy.wait('@getSubscriptionInvoices').its('request.query.yearMonth').should('eq', '2026-03');

    cy.contains('Le téléchargement de votre facture a démarré.').should('be.visible');
    expectDownloads(downloads => {
      expect(downloads).to.have.length(1);
      expect(downloads[0].href).to.eq('https://s3.dummy.app/facture-abonnement-mars.pdf');
      expect(downloads[0].target).to.eq('_blank');
      expect(downloads[0].rel).to.eq('noopener noreferrer');
      expect(downloads[0].download).to.eq('facture-abonnement-2026-03.pdf');
    });
  });

  it('opens one tab per file when the month holds several invoices', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, subscriptionInvoiceMultiple).as('getSubscriptionInvoices');

    openModal();
    spyOnDownloads();
    cy.get(download('2026-02')).click();

    cy.wait('@getSubscriptionInvoices');

    expectDownloads(downloads => {
      expect(downloads.map((item: any) => item.href)).to.deep.eq([
        'https://s3.dummy.app/facture-abonnement-1.pdf',
        'https://s3.dummy.app/facture-abonnement-2.pdf',
      ]);
      expect(downloads.map((item: any) => item.download)).to.deep.eq(['facture-abonnement-2026-02-1.pdf', 'facture-abonnement-2026-02-2.pdf']);
      expect(downloads.every((item: any) => item.target === '_blank')).to.eq(true);
    });
  });

  it('warns when the month holds no invoice', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, []).as('getSubscriptionInvoices');

    openModal();
    spyOnDownloads();
    cy.get(download('2026-01')).click();

    cy.wait('@getSubscriptionInvoices');

    cy.contains('Aucune facture disponible pour Janvier 2026.').should('be.visible');
    expectDownloads(downloads => expect(downloads).to.have.length(0));
  });

  it('warns when the returned invoice carries no file', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, subscriptionInvoiceWithoutFile).as('getSubscriptionInvoices');

    openModal();
    spyOnDownloads();
    cy.get(download('2026-02')).click();

    cy.wait('@getSubscriptionInvoices');

    cy.contains('Aucune facture disponible pour Février 2026.').should('be.visible');
    expectDownloads(downloads => expect(downloads).to.have.length(0));
  });

  it('notifies when the request fails and keeps the month clickable', () => {
    cy.intercept('GET', SUBSCRIPTION_INVOICES_URL, { statusCode: 500, body: {} }).as('getSubscriptionInvoices');

    openModal();
    cy.get(download('2026-03')).click();

    cy.wait('@getSubscriptionInvoices');

    cy.get('.MuiSnackbar-root').should('be.visible');
    cy.get(download('2026-03')).should('be.enabled');
  });

  it('closes the modal', () => {
    openModal();

    cy.contains('Mes factures').should('be.visible');
    cy.get('[name="billing-close"]').click();
    cy.contains('Mes factures').should('not.exist');
  });
});
