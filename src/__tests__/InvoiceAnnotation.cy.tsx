import { InvoiceStatus } from '@bpartners/typescript-client';

import App from '@/App';
import { accountHolders1, accounts1, areaPictures, createInvoices, customers1, invoiceAnnotations, products, whoami1 } from './mocks/responses';

xdescribe('Invoice Annotation', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products**`, products).as('getProducts');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=dummy&fileType=INVOICE`, { fixture: 'testInvoice.pdf' }).as('getInvoicePdfFile');

    const invoice = createInvoices(1, InvoiceStatus['DRAFT'])[0];
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, [{ ...invoice, idAreaPicture: 'areaPicture-mock-id', status: InvoiceStatus['DRAFT'] }]).as(
      'getDraftInvoice'
    );
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/*`, areaPictures).as('getAreaPictures');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/*/annotations`, invoiceAnnotations).as('getAreaPicturesAnnotation');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=dummy&fileType=AREA_PICTURE`, { fixture: 'test-annotator-image.jpeg' }).as(
      'getAreaPictureFileImage'
    );
  });

  it('should show annotation on edit an invoice', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.contains('invoice-ref-0').click();

    cy.wait('@getAreaPictures');
    cy.wait('@getAreaPicturesAnnotation');

    cy.contains('x : 0');
    cy.contains('y : 0');

    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();

    cy.get('.css-1vol7lq-MuiPaper-root-MuiCard-root > :nth-child(1) > .MuiCardHeader-action').click();
    cy.get('[aria-label="Justificatif"]').click();

    cy.contains('Polygone A');
    cy.contains('Polygone B');
    cy.contains('Surface: 10 m²');
    cy.contains("Source de l'image: vendee, 20cm, 2023");
    cy.contains('invoice-title-0');
    cy.contains('invoice-ref-0');
    cy.contains('Justificatif');
    cy.contains('x : 0');
    cy.contains('y : 0');

    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
  });
});
