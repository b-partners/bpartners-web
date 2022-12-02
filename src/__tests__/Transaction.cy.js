import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { transactions1, transactionsSummary } from './mocks/responses/paying-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=10', transactions1).as('getTransactions1');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=5', transactions1).as('getTransactions1');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=2&pageSize=5', transactions1).as('getTransactions1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=${new Date().getFullYear()}`, transactionsSummary).as('getTransactionsSummary');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('BP22002');
    cy.contains('-0.05 €');
    cy.contains('+5.00 €');
    cy.contains('TVA 20%');
    cy.contains('18/08/2022 05:34:20');
  });

  it('Should test pagination', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();

    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('displaying the graphic summary', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.contains('Résumé graphique');
    cy.get('#date').type('2022-11');
    cy.contains('Dépense');
    cy.contains('Recette');
    cy.contains('Trésorerie');
    cy.get('#date').type('2022-11');
    cy.contains('30');
    cy.contains('20');
    cy.contains('40');
    cy.get('#date').type('2022-01');
    cy.contains('12');
    cy.contains('10');
    cy.contains('40');
  });

  it('are filterable', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('#categorized').check();
    cy.should('not.contain.text', 'TVA 20%');
  });

  it('can have document', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.contains('TVA 20%');
    cy.get('[id=document-button-transaction1]').click();
    cy.contains('BP22001').as('transaction1').should('exist');

    cy.get('[id=document-button-transaction2]').click();
    cy.contains('BP22002');
  });
});
