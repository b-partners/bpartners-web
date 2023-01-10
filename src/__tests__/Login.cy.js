import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import LoginSuccessPage from '../security/LoginSuccessPage';

import { token1, whoami1, user1 } from './mocks/responses/security-api';
import * as Redirect from '../common/utils/redirect';
import App from 'src/App';

import authProvider from '../providers/auth-provider';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { transactions, transactionsSummary, transactionsSummary1 } from './mocks/responses/paying-api';
import transactionCategory1 from './mocks/responses/transaction-category-api';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('MainPage redirects to authUrl on login button clicked', () => {
    mount(<App />);
    cy.intercept('POST', '/authInitiation', req => {
      expect(req.body.phone).to.deep.eq('numéro renseigné');
      req.reply({ redirectionUrl: 'https://authUrl.com' });
    }).as('createAuthInitiation');
    cy.get('#login').click();
    cy.wait('@createAuthInitiation');
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('SuccessPage redirects to / on valid code', () => {
    cy.intercept('POST', '/token', token1).as('createToken');
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    mount(<LoginSuccessPage />);
    cy.wait('@createToken');
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('should redirect to LoginPage when not connected', () => {
    mount(<App />);
    cy.contains('Bienvenue !');
    cy.contains('Se connecter');
  });

  it('MainPage redirects to onboarding url', () => {
    mount(<App />);
    cy.intercept('POST', '/onboardingInitiation', { redirectionUrl: 'https://authUrl.com' }).as('onboardingInitiation');
    cy.get('#register').contains(`Pas de compte ? C'est par ici`);
    cy.get('#register').click();
    cy.wait('@onboardingInitiation');
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('Should log out', () => {
    cy.intercept('POST', '/token', token1).as('token');
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
    const date = new Date().toISOString().slice(0, 10);
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=10', transactions).as('getTransactions');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=5', transactions).as('getTransactions');
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=2&pageSize=5', transactions).as('getTransactions');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=${new Date().getFullYear()}`, transactionsSummary).as('getTransactionsSummary');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=2022`, transactionsSummary1).as('getEmptyTransactionSummary');
    cy.intercept('GET', `/accounts/mock-account-id1/transactionCategories?transactionType=INCOME&from=${date}&to=${date}`, transactionCategory1).as(
      'getTransactionCategory'
    );

    mount(<App />);

    cy.wait('@token');
    cy.wait('@whoami');
    cy.wait('@getUser1');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.get('[name="logout"]').click();

    cy.intercept('GET', '/whoami', { statusCode: 403 });
  });
});
