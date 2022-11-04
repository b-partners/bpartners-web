import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { products1 } from './mocks/responses/product-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices } from './mocks/responses/invoices-api';
import simplePdf from '../operations/transactions/testInvoice.pdf';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.viewport(1326, 514);
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, [{}]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10`, createInvoices(10)).as('getInvoices1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5`, createInvoices(5)).as('getInvoices1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5`, createInvoices(5)).as('getInvoices1');
    cy.intercept(
      'GET',
      `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`,
      'https://education.github.com/git-cheat-sheet-education.pdf'
    ).as('getInvoices1');
  });

  it('Should show the list of invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();
    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('Should show success message', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="envoyer"]').click();
    cy.contains('Facture bien envoyer');
  });

  it('Should edit one invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="modifier"]').click();
    cy.get('form input[name=title]').type('1');
    cy.get('form input[name=ref]').type('-2');
    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=toPayAt]').invoke('removeAttr').type('2022-10-05');
    cy.get('.css-13o7eu2 > .MuiButtonBase-root').click();
  });
});
