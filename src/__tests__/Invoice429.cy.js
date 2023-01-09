import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
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

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer10Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer5Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
  });

  it('should retry on 429', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();
    cy.wait('@getDraftsPer10Page1');
    cy.wait('@getDraftsPer5Page1');

    const newRef = 'A new ref';
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      req.reply({ statusCode: 429 });
    }).as('crupdateWithNewRef429');
    cy.get('form input[name=ref]').clear().type(newRef);
    cy.wait('@crupdateWithNewRef429'); // suppose we are extremely unlucky and first creation (no metadata.submitted) results in 429!

    // then...
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewRef');
    cy.wait('@crupdateWithNewRef'); // ... then submission is eventually retried and succeeds
  });

  it('should discard outdated 429 retry', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();
    cy.wait('@getDraftsPer10Page1');
    cy.wait('@getDraftsPer5Page1');

    const newRef = 'A new ref';
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({ statusCode: 429 });
    }).as('crupdateWithNewRef429');
    cy.get('form input[name=ref]').clear().type(newRef);
    cy.wait('@crupdateWithNewRef429'); // a first update is sent but resulted in 429, then...

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({
        body: { ...req.body, updatedAt: new Date() },
        // ... then it is retried but http call takes an eternity to finish
        delay: 10_000,
      });
    }).as('crupdateWithNewRef');

    const evenNewerRef = 'Even newer ref';
    cy.get('form input[name=ref]').clear().type(evenNewerRef);
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({ ...req.body, ref: evenNewerRef, updatedAt: new Date() });
    }).as('crupdateWithEvenNewerRef');
    cy.wait('@crupdateWithEvenNewerRef'); // a second update is sent and succeeds

    cy.wait('@crupdateWithNewRef'); // retried first update finally finished but is now outdated
    cy.get('form input[name=ref]').should('have.value', evenNewerRef); // ... hence discarded in favor of second update
  });
});
