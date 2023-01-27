import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { transactions, transactionsSummary, transactionsSummary1 } from './mocks/responses/paying-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import transactionCategory1 from './mocks/responses/transaction-category-api';

const date = new Date().toISOString().slice(0, 10);

describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    cy.viewport(1326, 514);
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=10', transactions).as('getTransactions');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=5', transactions).as('getTransactions');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=2&pageSize=5', transactions).as('getTransactions');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=${new Date().getFullYear()}`, transactionsSummary).as('getTransactionsSummary');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=2022`, transactionsSummary1).as('getEmptyTransactionSummary');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=2021`, transactionsSummary1).as('getEmptyTransactionSummary');
    cy.intercept('GET', `/accounts/mock-account-id1/transactionCategories?transactionType=INCOME&from=${date}&to=${date}`, transactionCategory1).as(
      'getTransactionCategory'
    );
  });

  it('can be categorized', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');
    cy.get(':nth-child(1) > :nth-child(3) > .MuiTypography-root > .MuiBox-root > [data-testid="EditIcon"]').click();
    cy.wait('@getTransactionCategory');
    cy.get('.MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.contains('Autres dépenses').click();
    cy.get('[name="comment"]').type('Test');
    cy.get('[name="vat"]').type(10);
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').click();
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('- 0.05 €');
    cy.contains('+ 5.00 €');
    cy.contains('TVA 20%');
    cy.contains('18/08/2022 05:34:20');
  });

  it('should test pagination', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();

    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('display graphic summary', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    const today = new Date();
    cy.wait('@getTransactionsSummary');
    cy.get('[name="datePicker"]').should('have.value', today.getFullYear());
    cy.get('[name="datePicker"]').clear().type(2023);

    cy.contains('Vue mensuelle');
    cy.contains('Vue annuelle');
    cy.contains('Sélectionnez une année');

    cy.contains('Dépense 2023');
    cy.contains('Recette 2023');
    cy.contains('Trésorerie 2023');

    cy.contains('2100.00 €');
    cy.contains('1000.00 €');
    cy.contains('1100.00 €');

    cy.get('[name="datePicker"]').clear().type(2022);
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('#annualSummarySwitch').click();
    cy.contains('Sélectionnez un mois');

    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('[name="datePicker"]').clear().type('janvier 2023');

    cy.contains('120.00 €');
    cy.contains('0.00 €');

    cy.contains('Dépense');
    cy.contains('Recette');
    cy.contains('Trésorerie');

    cy.contains('Dernière modification');

    cy.get('[name="datePicker"]').clear().type('avril 2023');

    cy.contains('130.00 €');
    cy.contains('10.00 €');
    cy.contains('330.00 €');

    cy.get('[name="datePicker"]').clear().type('décembre 2023');

    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('[name="datePicker"]').clear().type('avril 2022');
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);
  });

  it('display graphic of revenue targets', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    const today = new Date();
    cy.wait('@getTransactionsSummary');
    cy.get('[name="datePicker"]').should('have.value', today.getFullYear());
    cy.get('[name="datePicker"]').clear().type(2023);

    cy.contains('Objectif annuel (10.00 % atteint)');
    cy.contains('Recette de cette année : 12000.00 €');
    cy.contains('120000.00 €');

    cy.get('[name="datePicker"]').clear().type(2022);
    cy.contains(`Vous n'avez pas défini d'objectif pour cette année. Pour définir votre objectif annuel, veuillez aller dans l'onglet mon compte.`);

    cy.get('[name="datePicker"]').clear().type(2021);
    cy.contains('Objectif annuel (100 % atteint. +8.33 %)');
    cy.contains('Recette de cette année : 130000.00 €');
  });

  it('display current balance all the time', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    cy.wait('@getTransactionsSummary');
    cy.contains('Solde du jour : 220.00 €');

    cy.get('#annualSummarySwitch').click();

    cy.get('[name="datePicker"]').clear().type('janvier 2023');
    cy.contains('Solde du jour : 220.00 €');
    cy.contains('Trésorerie');
    cy.get('[name="datePicker"]').clear().type('décembre 2023');
    cy.contains('Solde du jour : 220.00 €');
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);
  });

  it('display statuses correctly', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.contains('En attente');
    cy.contains('Acceptée');
    cy.contains('Rejetée');
    cy.contains('En traitement');
  });

  it('are filterable', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('#categorized').check();
    cy.should('not.contain.text', 'TVA 20%');
  });

  it('Should show the appropriate status', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('#status').click();

    cy.contains('En réception').should('not.exist');
  });

  it.skip(/*TODO*/ 'can have document', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('[id=document-button-transaction2]').click();
  });
});
