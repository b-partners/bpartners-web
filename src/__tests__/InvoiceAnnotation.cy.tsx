import { InvoiceStatus } from '@bpartners/typescript-client';

import App from '@/App';
import { accountHolders1, accounts1, areaPictures, createInvoices, customers1, getInvoices, invoiceAnnotations, products, whoami1 } from './mocks/responses';

describe('Invoice Annotation', () => {
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

  it.skip('should show annotation on edit an invoice', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.contains('invoice-ref-0').click();

    cy.wait('@getAreaPictures');
    cy.wait('@getAreaPicturesAnnotation');

    cy.contains('x : 0');
    cy.contains('y : 0');

    cy.get('[data-cy="annotator-top-bar"] > :nth-child(2)').click();
    cy.get('[data-cy="annotator-top-bar"] > :nth-child(2)').click();

    cy.get('[data-cy="annotator-top-bar"] > :nth-child(4)').click();
    cy.get('[data-cy="annotator-top-bar"] > :nth-child(3)').click();
  });

  it('should show annotation on preview', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document).as('getPdf');
    });

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page = 1 } = req.query;
      req.reply(
        getInvoices(
          +page - 1,
          +pageSize,
          (statusList as string).split(',').map(status => InvoiceStatus[status as keyof typeof InvoiceStatus])
        ).map(invoice => ({ ...invoice, idAreaPicture: areaPictures.id }))
      );
    });
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/${areaPictures.id}`, areaPictures).as('getAreaByPictureId');
    cy.intercept('GET', `/accounts/*/areaPictures/*/annotations`, []).as('getAreaPictureAnnotation');

    cy.get('[name="invoice"]').click();
    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getUser1');
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Justificatif"]').click();

    cy.contains('Justificatif');
  });
});
