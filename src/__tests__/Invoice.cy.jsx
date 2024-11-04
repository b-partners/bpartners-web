import { InvoiceStatus, PaymentMethod } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { areaPictures } from './mocks/responses/area-pictures';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices, invoicesSummary, invoicesToChangeStatus } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { invoiceRelaunch1 } from './mocks/responses';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/*/accounts`, accounts1).as('getAccount1');

    cy.intercept('GET', `accounts/${accounts1[0].id}/invoices/*/relaunches*`, []).as('getAccountInvoiceRelanches');
    cy.intercept('GET', `/users/*/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/*/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/*/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/*/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/*/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          `${statusList}`.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
    cy.intercept('GET', '/accounts/mock-account-id1/invoicesSummary', invoicesSummary).as('getInvoicesSummary');

    cy.mount(<App />);
    cy.wait('@getUser1');
  });

  it('Can be paid', () => {
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.status).to.eq(InvoiceStatus.PAID);
      expect(req.body.paymentMethod).to.eq(PaymentMethod.CHEQUE);
      req.reply(req.body);
    }).as('pay');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=15&status=PAID`).as('refetch');
    cy.intercept('POST', `/users/mock-user-id1/accountHolders/mock-accountHolder-id1/feedback`, req => {
      const actualFeedbackAsked = req.body || {};
      expect(actualFeedbackAsked.subject).contains(' -  donnez nous votre avis');
      expect(actualFeedbackAsked.message).contains('<p>');
      expect(actualFeedbackAsked.message).contains('<br>');
      expect(actualFeedbackAsked.message).contains('Nous espérons que vous allez bien.');
      req.reply({});
    }).as('AskFeedback');

    cy.getByName('invoice').click();
    cy.getByTestId('invoice-tabs-facture').click();
    cy.contains('invoice-ref-3');

    cy.getByTestId('invoice-conversion-PAID-invoice-ref-0-1').click();
    cy.getByTestId('invoice-payment-method-select').click();
    cy.contains('Chèque').click();

    cy.getByTestId('invoice-conversion-PAID-invoice-ref-0').click();
    cy.contains("Envoyer un demande d'avis à firstName-0 lastName-0.");
  });

  it('Should automatically change tabs when converting to a quote or invoice', () => {
    cy.getByName('invoice').click();
    cy.getByAriaLabel('Convertir en devis').first().click();

    cy.contains('À confirmer');
    cy.contains('Brouillon transformé en devis !');

    cy.getByAriaLabel('Transformer en facture').first().click();
    cy.contains('À payer');
    cy.contains('Devis confirmé');
  });

  it('Check if date label are corrects', () => {
    cy.getByName('invoice').click();
    cy.get('tbody tr').first().click();

    cy.contains("Date d'émission");
    cy.contains('Date limite de validité');
  });

  it('Should show an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    cy.getByName('invoice').click();
    cy.getByAriaLabel('Justificatif').first().click();

    cy.contains('invoice-title-0');
    cy.contains('Justificatif');
    cy.getByTestId('DownloadForOfflineIcon').click();
  });

  it('Should send the request even if there is not comment', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    cy.getByName('invoice').click();
    cy.get('tbody tr').first().click();
    const simpleComment = 'This is a simple comment';
    cy.get('form textarea[name=comment]').type(simpleComment);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.comment).to.be.eq(simpleComment);
      req.reply({
        body: req.body,
        updatedAt: new Date(),
        comment: simpleComment,
      });
    });
    cy.get('form textarea[name=comment]').clear();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      assert.isNull(req.body.comment);
      req.reply({
        body: req.body,
        updatedAt: new Date(),
      });
    });
  });

  it('Should able to refresh the preview', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    }).as('emitInvoice');

    cy.getByName('invoice').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');

    cy.get('tbody tr', { timeout: 3000 }).first().click();
    cy.get('#form-refresh-preview').click();
    cy.wait('@emitInvoice');
  });

  it('Should show payment regulation comment', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, invoicesToChangeStatus);
    cy.getByName('invoice').click();
    cy.get('tbody tr').first().click();
    cy.getByTestId('invoice-Acompte-accordion').click();

    cy.contains('Test dummy comment');
  });

  it('should show invoices summary', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, invoicesToChangeStatus);
    cy.getByName('invoice').click();
    // cy.wait('@getInvoicesSummary', { timeout: 20_000 });
    cy.contains('Devis');
    cy.contains('Factures payées');
    cy.contains('Factures en attente');
    // cy.contains('5500,00');
    // cy.contains('3250,00');
    // cy.contains('100,00');
  });

  it('should show annotation on preview', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document).as('getPdf');
    });

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        ).map(invoice => ({ ...invoice, idAreaPicture: areaPictures.id }))
      );
    });
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/${areaPictures.id}`, areaPictures).as('getAreaByPictureId');
    cy.intercept('GET', `/accounts/*/areaPictures/*/annotations`, []).as('getAreaPictureAnnotation');

    cy.getByName('invoice').click();
    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.getByAriaLabel('Justificatif').first().click();

    cy.contains('Justificatif');
  });
});
