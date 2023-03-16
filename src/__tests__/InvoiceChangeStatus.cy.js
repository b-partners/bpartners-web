import { mount } from '@cypress/react';
import { InvoicePaymentTypeEnum, InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices, invoicesToChangeStatus, restInvoiceRegulation } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.viewport(1326, 514);
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy',
          },
        })
    );
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products?unique=true`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
  });

  it('Should change invoice status', () => {
    mount(<App />);
    const invoices = getInvoices(0, 1, InvoiceStatus.DRAFT);
    invoices[0].paymentRegulations = null;
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      req.reply(invoices);
    });

    cy.get('[name="invoice"]').click();

    cy.get('.MuiTableBody-root > .MuiTableRow-root > .column-ref').click();

    // check is payment regulations values are in Minor unity on edit invoice
    // use paymentRegulation
    cy.get('[data-testid="payment-regulation-switch"] > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="invoice-Paiement-accordion"]').click();

    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, req => {
      const crupdateInvoice = { ...req.body };
      expect(crupdateInvoice.paymentRegulations[0].percent).to.be.eq(3000);
      expect(crupdateInvoice.paymentRegulations[1].percent).to.be.eq(7000);
      invoices[0] = req.body;
      req.reply(req.body);
    }).as('crupdate2');

    cy.contains('30');
    cy.contains('70');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      req.reply(invoicesToChangeStatus);
    }).as('getInvoice2');

    cy.get('#form-save-id').click();
    cy.wait('@crupdate2');

    // check is payment regulations values are in Minor unity on change invoice status
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, req => {
      const crupdateInvoice = { ...req.body };
      expect(crupdateInvoice.status).to.be.eq(InvoiceStatus.PROPOSAL);
      expect(crupdateInvoice.paymentRegulations[0].percent).to.be.eq(3000);
      expect(crupdateInvoice.paymentRegulations[1].percent).to.be.eq(7000);
      req.reply(req.body);
    }).as('crupdate3');

    cy.get('[aria-label="Convertir en devis"]').click();
    cy.wait('@crupdate3');
  });
});