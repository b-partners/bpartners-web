import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { createInvoices } from './mocks/responses/invoices-api';
import { products1 } from './mocks/responses/product-api';
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

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', {});

    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
  });

  it('should display modal to relaunch an invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

    cy.contains('Relance manuelle de la facture ref: invoice-ref-1');

    cy.get('[data-test-item="object-field"]').type('objet-example');
    cy.get('.public-DraftEditor-content').type('message here');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.contains('La facture ref: invoice-ref-1');
  });

  it('Should show the list of invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.contains('BROUILLON');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();

    cy.contains('EN ATTENTE');

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();

    cy.contains('CONFIRMÉ');
  });

  it('Should test pagination', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();

    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('Should show success message', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(9) > .MuiTypography-root > .MuiBox-root > [aria-label="Envoyer et transformer en devis"]').click();
    cy.contains('Devis bien envoyé');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get(':nth-child(1) > :nth-child(9) > .MuiTypography-root > .MuiBox-root > [aria-label="Transformer en facture"]').click();
    cy.contains('Devis confirmé');
  });

  it('Should create an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();

    cy.get('form input[name=title]').type('1');
    cy.get('form input[name=ref]').type('-2');
    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=toPayAt]').invoke('removeAttr').type('2022-10-05');
    cy.get('#invoice-client-selection-id').click();
    cy.get('[data-value="customer2"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('.MuiInputBase-root > #product-selection-id').click();
    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();

    cy.contains('400€');
    cy.contains('2400.00€');

    cy.get('[data-cy-item="quantity-input"]').type('5');

    cy.contains('5000€');
    cy.contains('30000.00€');
  });

  it('Should edit an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains('Modification');

    cy.get('form input[name=title]').type('1');
    cy.get('form input[name=ref]').type('-2');
    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=toPayAt]').invoke('removeAttr').type('2022-10-05');

    cy.get('form #form-save-id').click();

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.contains('Taille : 5');
  });

  it('Should show an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(9) > .MuiTypography-root > .MuiBox-root > [aria-label="Justificatif"] > .MuiSvgIcon-root').click();

    cy.contains('invoice-title-0');
    cy.contains('Justificatif');
  });
});
