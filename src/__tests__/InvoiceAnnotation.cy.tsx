import { InvoiceStatus } from '@bpartners/typescript-client';

import App from '../App';
import { accountHolders1, accounts1, areaPictures, createInvoices, customers1, invoiceAnnotations, products, whoami1 } from './mocks/responses';

describe('Invoice Annotation', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1, InvoiceStatus['PROPOSAL'])[0]).as('crupdate1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=dummy&fileType=INVOICE`, { fixture: 'testInvoice.pdf' });

    const invoice = createInvoices(1, InvoiceStatus['DRAFT'])[0];
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, [{ ...invoice, idAreaPicture: 'areaPicture-mock-id', status: InvoiceStatus['DRAFT'] }]);
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/*`, areaPictures);
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/*/annotations`, invoiceAnnotations);
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=dummy&fileType=AREA_PICTURE`, { fixture: 'test-annotator-image.jpeg' });
  });

  it.skip('should show annotation on edit an invoice', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.contains('invoice-ref-0').click();

    cy.contains('x : 0');
    cy.contains('y : 0');

    cy.get('[data-cy="annotator-top-bar"] > :nth-child(2)').click();
    cy.get('[data-cy="annotator-top-bar"] > :nth-child(2)').click();

    cy.get('[data-cy="annotator-top-bar"] > :nth-child(4)').click();
    cy.get('[data-cy="annotator-top-bar"] > :nth-child(3)').click();
  });
});
