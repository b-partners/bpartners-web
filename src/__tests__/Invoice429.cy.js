import { mount } from '@cypress/react';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList, page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });
  });

  it('should retry on 429', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-draft-invoice']").click();

    const newRef = 'A new ref';
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      req.reply({ statusCode: 429 });
    }).as('crupdateWithNewRef429');
    cy.get('form input[name=ref]').clear().type(newRef);

    // select customer
    cy.get('[data-testid="autocomplete-backend-for-customer"] input').type('lastName-0');
    cy.contains('lastName-0 firstName-0').click();

    //select product
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('description');
    cy.contains('description 0').click();

    cy.wait('@crupdateWithNewRef429'); // suppose we are extremely unlucky and first creation (no metadata.submitted) results in 429!
    cy.wait('@crupdateWithNewRef429'); // ... we are so unlucky we actually got 429 twice
    cy.wait('@crupdateWithNewRef429'); // ... and even a third time!
    cy.wait('@crupdateWithNewRef429', { timeout: 4_000 /*if exp backoff, from 1, with factor 2*/ + 5_000 }); // ... and even a fourth time!

    // then...
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewRef');
    cy.wait('@crupdateWithNewRef', { timeout: 8_000 + 5000 }); // ... then submission is eventually retried and succeeds
  });
});
