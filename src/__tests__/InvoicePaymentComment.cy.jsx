import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices, invoicesSummary, invoicesToChangeStatus } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';

describe(specTitle('InvoiceInformation'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/*/accounts`, accounts1).as('getAccount1');

    cy.intercept('GET', `accounts/${accounts1[0].id}/invoices/*/relaunches*`, []).as('getAccountInvoiceRelanches');
    cy.intercept('GET', `/users/*/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/*/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/*/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/*/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/*/invoices/*`, createInvoices(1, InvoiceStatus.PROPOSAL)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          `${statusList}`.split(',').map(status => InvoiceStatus[status])
        ));
    });

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
    cy.intercept('GET', '/accounts/mock-account-id1/invoicesSummary', invoicesSummary).as('getInvoicesSummary');

    cy.mount(<App />);
    cy.wait('@getUser1');
  });

  it('Should show payment regulation comment', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, invoicesToChangeStatus);
    cy.getByName('invoice').click();
    cy.get('tbody tr').first().click();
    cy.getByTestId('invoice-Acompte-accordion').click();

    cy.contains('Test dummy comment');
  });
});
