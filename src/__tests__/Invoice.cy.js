import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { createInvoices } from './mocks/responses/invoices-api';
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

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', {});

    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
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

  it('should show the money in major unit', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('120.00 €');
    cy.contains('20.00 €');
  });

  it('should show the list of invoice', () => {
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

  it('should test pagination', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();

    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('should show success message', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Envoyer et transformer en devis"]').click();
    cy.contains('Devis bien envoyé'); //TODO: you should not make this test if you didn't test beforehand that /relaunch is hit!

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Transformer en facture"]').click();
    cy.contains('Devis confirmé');
  });

  it('should create an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();

    const newTitle = 'A new title';
    cy.get('form input[name=title]').type(newTitle);
    const withNewTitle = { ...createInvoices(1)[0], title: newTitle, updatedAt: new Date() };
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, withNewTitle).as('crupdateWithNewTitle');
    cy.wait('@crupdateWithNewTitle');

    const newRef = 'A new ref';
    cy.get('form input[name=ref]').clear().type(newRef);
    const withNewRef = { ...withNewTitle, ref: newRef, updatedAt: new Date() };
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      req.reply({ body: withNewRef });
    }).as('crupdateWithNewRef');
    cy.wait('@crupdateWithNewRef');

    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=toPayAt]').invoke('removeAttr').type('2022-10-05');
    cy.get('#invoice-client-selection-id').click();
    cy.get('[data-value="customer2"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('.MuiInputBase-root > #product-selection-id').click();

    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();
    cy.contains('12.00 € (TTC)');
    cy.contains('TVA : 2.00 €');
    cy.contains('10.00 € (HT)');

    cy.get(':nth-child(2) > .MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type('5');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      const payloadProducts = req.body.products;
      expect(payloadProducts.length).to.deep.eq(3);

      const product1ToUpdate = payloadProducts[1];
      const product1Updated = {
        ...product1ToUpdate,
        quantity: 15,
        totalPriceWithVat: 15 * product1ToUpdate.unitPrice * (1 + product1ToUpdate.vatPercent / 100),
      };
      const productsUpdated = [payloadProducts[0], product1Updated, payloadProducts[2]];
      const invoiceUpdated = {
        ...req.body,
        products: productsUpdated,
        totalPriceWithVat: productsUpdated.map(p => p.totalPriceWithVat).reduce((a, b) => a + b),
        // note(fixed-far-future):
        // Set a FIXED new date far in the future to guarantee note(invoiceCreate-fixpoint)
        updatedAt: new Date('2999-12-26T21:12:53.116Z'),
      };
      req.reply({ body: invoiceUpdated });
    }).as('crupdateWithNewInvoice');

    cy.wait('@crupdateWithNewInvoice');
    cy.contains('438.00 €');
  });

  it('should edit an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains('Modification');
    cy.get('form #form-save-id').click();
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({
        body: { ...req.body },
        // note(fixed-far-future)
        updatedAt: new Date('2999-12-26T21:12:53.116Z'),
      });
    });

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.contains('Taille : 5');
  });

  it('should show an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Justificatif"] > .MuiSvgIcon-root').click();

    cy.contains('invoice-title-0');
    cy.contains('Justificatif');
  });
});
