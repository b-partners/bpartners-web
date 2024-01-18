import { mount } from '@cypress/react';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList, page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
  });

  it('should archive invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get('[data-testid="archive-invoices-button"]').should('not.exist');

    cy.get('.MuiTableBody-root > :nth-child(1) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();
    cy.get(':nth-child(2) > .MuiTableCell-paddingCheckbox > .MuiButtonBase-root > .PrivateSwitchBase-input').click();

    cy.get('[data-testid="archive-invoices-button"]').should('exist');

    cy.get('[data-testid="archive-invoices-button"]').click();

    cy.contains('Les factures suivants vont être archivés :');
    cy.contains('invoice-title-0');
    cy.contains('invoice-title-1');

    cy.get('[data-testid="submit-archive-invoices"]').click();
  });
});
