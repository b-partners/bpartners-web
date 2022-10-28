import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { transactionCategories1, transactions1 } from './mocks/responses/paying-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    const currentDate = new Date().toISOString().split('T')[0];
    cy.intercept('GET', '/accounts/mock-account-id1/transactions', transactions1).as('getTransactions1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionCategories?unique=true&from=${currentDate}&to=${currentDate}`, transactionCategories1).as(
      'getTransactionCategories1'
    );
  });

  it('are displayed', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains('Résumé Graphique');
    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('BP22002');
    cy.contains('-0.05 €');
    cy.contains('+5.00 €');
    cy.contains('TVA 20%');
    cy.contains('18/08/2022 05:34:20');
  });

  it('displaying the graphic summary', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains('Résumé Graphique');
    cy.contains('Recette tva 20%');
    cy.contains('Recette tva 10%');
    cy.contains('Recette personnalisé tva 1%');
    cy.contains('Recette personnalisé tva 1,5%');
    cy.wait('@getTransactionCategories1');
  });

  it('are filterable', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="transactions"]').click();
    cy.wait('@getTransactions1');

    cy.get('#categorized').click();
    cy.contains('TVA 20%').not();
  });

  it('can have document', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains('TVA 20%');
    cy.get('[id=document-button-transaction1]').click();
    cy.contains('BP22001').as('transaction1').should('exist');

    cy.get('[id=document-button-transaction2]').click();
    cy.get('.MuiTypography-h6').should('have.text', 'BP22002');
  });
});
