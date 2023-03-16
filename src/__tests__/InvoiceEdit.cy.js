import { mount } from '@cypress/react';
import { InvoicePaymentTypeEnum } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, restInvoiceRegulation } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
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

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products?unique=true`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('GET', `**/invoices**`, req => {
      const { pageSize, status } = req.query;
      req.reply(createInvoices(pageSize, status));
    });
  });

  it('should edit an invoice', () => {
    const newTitle = 'updated-invoice-title-0';
    const newRef = 'updated-invoice-ref-0';
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains('Modification');

    cy.get('[name="title"]').clear().type(newTitle);
    cy.get('[name="ref"]').clear().type(newRef);

    const globalDiscount_percentValue = 100;
    cy.get('[data-testid="global-discount-switch"] > .PrivateSwitchBase-input').click();
    cy.get('form input[name="globalDiscount.percentValue"]').clear().type(globalDiscount_percentValue);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      const newInvoice = req.body;
      expect(newInvoice.paymentType).to.be.equal(InvoicePaymentTypeEnum.IN_INSTALMENT);

      newInvoice.paymentRegulations = restInvoiceRegulation;

      req.reply({
        body: { ...newInvoice },
        updatedAt: new Date(),
      });
    }).as('crupdateInvoicePaymentRegulation');

    cy.get('[data-testid="payment-regulation-switch"] > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="invoice-Paiement-accordion"]').click();
    cy.get('[data-testid="EditIcon"]').click();
    cy.get('input[name="maturityDate"]').invoke('removeAttr').type('2023-03-15');
    cy.get('#form-regulation-save-id').click();
    cy.contains('2023-03-15');

    cy.get('#form-create-regulation-id').click();
    cy.contains('Pourcentage');
    cy.contains('Date limite de paiement');
    cy.contains('Commentaire');

    cy.get('input[name="maturityDate"]').should('have.value', '2023-04-15');
    cy.get('#form-regulation-save-id').click();
    cy.wait('@crupdateInvoicePaymentRegulation');
    const paymentComment = 'This is a long comment for testing comment view';
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      const newInvoice = req.body;
      expect(req.body.globalDiscount.percentValue).to.deep.eq(parseInt(globalDiscount_percentValue) * 100);
      expect(newInvoice.paymentType).to.be.equal(InvoicePaymentTypeEnum.IN_INSTALMENT);

      newInvoice.paymentRegulations = restInvoiceRegulation;

      req.reply({
        body: { ...newInvoice },
        updatedAt: new Date(),
      });
    }).as('paymentRegulation1');

    cy.get(':nth-child(2) > .MuiPaper-root > .MuiCardActions-root > .MuiBox-root > .MuiButtonBase-root > [data-testid="EditIcon"] > path').click();
    cy.get('[name=percent]').clear().type(20);
    cy.get('[data-testid=payment-regulation-comment-id]').type(paymentComment);
    cy.get('#form-regulation-save-id').click();
    cy.contains('This is a long comment ...');
    cy.get(':nth-child(2) > .MuiPaper-root > .MuiCardActions-root > .MuiBox-root > :nth-child(1) > [data-testid="ExpandMoreIcon"]').click();

    cy.wait('@paymentRegulation1');
    cy.contains('Commentaire : ');
    cy.contains('This is a long comment for testing comment view');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      const newInvoice = req.body;
      expect(req.body.globalDiscount.percentValue).to.deep.eq(parseInt(globalDiscount_percentValue) * 100);

      newInvoice.paymentRegulations = restInvoiceRegulation;

      req.reply({
        body: { ...newInvoice },
        updatedAt: new Date(),
      });
    }).as('paymentRegulation2');

    cy.get('#form-create-regulation-id').click();
    cy.get('[name=percent]').clear().type(20);
    cy.get('[data-testid=payment-regulation-comment-id]').type(paymentComment);
    cy.get('#form-regulation-save-id').click();

    cy.wait('@paymentRegulation2');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      // check if there is 1 month between all dates
      const newInvoice = req.body;
      const expectedDate = ['2023-03-15', '2023-04-15', '2023-05-15', '2023-06-15'];
      const paymentRegulationsDates = [...req.body.paymentRegulations]
        .map(e => e.maturityDate)
        .sort((date1, date2) => new Date(date1).getTime() - new Date(date2).getTime());
      expect(paymentRegulationsDates).to.deep.eq(expectedDate);

      req.reply({
        body: { ...newInvoice },
        updatedAt: new Date(),
      });
    }).as('paymentRegulation3');

    cy.get('#form-save-id');
    cy.wait('@paymentRegulation3');
  });
});
