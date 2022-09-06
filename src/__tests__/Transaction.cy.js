import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1 } from './mocks/responses/security-api';
import { transactions1 } from './mocks/responses/paying-api';

describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    cy.intercept('GET', '/accounts/mock-user-id1/transactions', transactions1).as('getTransactions1');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[href="/transactions"]').click();
    cy.wait('@getTransactions1');

    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('BP22002');
    //cy.contains('€ -5'); //TODO: this is incorrect, should be € -0.05 //TODO(random-fail-ci): display MAY be locale dependent
    //cy.contains('€ +500'); //TODO: this is incorrect, should be € +5.00 //TODO(random-fail-ci)
    cy.contains('TVA 20%');
    //cy.contains('18/08/2022'); //TODO: time missing //TODO(random-fail-ci)
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

    cy.contains('TVA 20%').click();
    cy.contains('Justificatif').should('exist');
    cy.contains('Transaction : transaction1');

    cy.contains('TVA 20%').click();
    cy.contains('Justificatif').should('not.exist');
  });
});
