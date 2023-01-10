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

describe(specTitle('Invoice Relaunch'), () => {
  beforeEach(() => {
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

    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', {});
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer10Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer5Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PAID`, createInvoices(1, 'PAID')).as('getPaidsPer10Page1');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
  });

  it('should display modal to relaunch a quotation', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

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
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

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
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

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
