import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1 } from './mocks/responses/security-api';
import { transactions1 } from './mocks/responses/paying-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    cy.intercept('GET', '/accounts/mock-account-id1/transactions', transactions1).as('getTransactions1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[href="/transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('BP22002');
    cy.contains('-0.05 €');
    cy.contains('+5.00 €');
    cy.contains('TVA 20%');
    cy.contains('18/08/2022 05:34:20');
  });

  it('are filterable', () => {
    mount(<App />);
    cy.get('[href="/transactions"]').click();
    cy.wait('@getTransactions1');

    cy.get('#categorized').click();
    cy.contains('TVA 20%').not();
  });

  it('can have document', () => {
    mount(<App />);
    cy.get('[href="/transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains('TVA 20%');
    cy.get('[id=document-button-transaction1]').click();
    cy.contains('transaction1').should('exist');

    cy.get('[id=document-button-transaction1]').click();
    cy.contains('transaction1').should('not.exist');
  });
});
