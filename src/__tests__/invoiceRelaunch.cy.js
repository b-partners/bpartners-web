import { mount } from '@cypress/react';
import { InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '../App';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { createInvoices, getInvoices } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice Relaunch'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');

    cy.intercept('POST', `/accounts/${accounts1[0].id}/invoices/**/relaunch`, {});
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/customers**`, customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, status, page } = req.query;
      req.reply(getInvoices(page - 1, pageSize, InvoiceStatus[status]));
    });
  });

  it('should display modal to relaunch a quotation', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get('[data-testid="relaunch-invoice-PROPOSAL-1-id"]').click();

    cy.contains('Relance manuelle du devis ref: invoice-ref-1');

    cy.get('[data-test-item="subject-field"]').type('objet-example');
    cy.get('.public-DraftEditor-content').type('message here');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.contains('Le devis ref: invoice-ref-1');
  });

  it('should display modal to relaunch an invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.get('[data-testid="relaunch-invoice-CONFIRMED-1-id"]').click();

    cy.contains('Relance manuelle de la facture ref: invoice-ref-1');

    cy.get('[data-test-item="subject-field"]').type('exemple');
    cy.get('.public-DraftEditor-content').type('message');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.contains('La facture ref: invoice-ref-1');
  });

  it('should allow user to relaunch an invoice and attach some files and relaunch an invoice', () => {
    mount(<App />);

    // open an invoiceRelaunch modal
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.get('[data-testid="relaunch-invoice-CONFIRMED-1-id"]').click();

    // fill basic props
    const subject = "exemple d'objet";
    cy.get('[data-test-item="subject-field"]').type(subject);

    const message = 'exemple de corps';
    cy.get('.public-DraftEditor-content').type(message);

    // has no attachment initially
    cy.contains('Aucun attachement');

    // attach some files
    const _path = 'cypress/fixtures';
    const _files = [_path.concat('/attachment-mock-1.jpg'), _path.concat('/attachment-mock-2.json')];

    cy.get('#attachment-input').invoke('show').selectFile(_files).invoke('hide');

    cy.get('[data-cy-item=num-of-docs]').contains(_files.length); // num of docs
    cy.contains('attachment-mock-1');
    cy.contains('attachment-mock-2');

    // remove the `attachment-mock-2`
    cy.get('[title="attachment-mock-2"] > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click();

    cy.get('[data-cy-item=num-of-docs]').contains(_files.length - 1); // num of docs
    cy.contains('attachment-mock-1');
    cy.should('not.contain.text', 'attachment-mock-2');

    // remove files
    cy.get('[title="attachment-mock-1"] > .MuiListItemSecondaryAction-root > .MuiButtonBase-root').click();
    cy.contains('Aucun attachement');

    // re-select files to relaunch the invoice
    cy.get('#attachment-input').invoke('show').selectFile(_files).invoke('hide');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', req => {
      expect(req.body.subject).to.deep.eq(subject);
      // message become html
      expect(req.body.message).to.deep.eq(`<p>${message}</p>`);

      const attachments = req.body.attachments.map(attachment => attachment.name);
      expect(attachments).to.deep.eq(['attachment-mock-1', 'attachment-mock-2']);

      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    });
  });
});
