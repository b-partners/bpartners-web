import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import LoginSuccessPage from '../security/LoginSuccessPage';

import { token1, whoami1, user1 } from './mocks/responses/security-api';
import * as Redirect from '../utils/redirect';
import App from 'src/App';

import authProvider from '../providers/auth-provider';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('MainPage redirects to authUrl on login button clicked', () => {
    mount(<App />);
    cy.intercept('POST', '/authInitiation', req => {
      expect(req.body.phone).to.deep.eq('dummy on purpose');
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
    mount(<App />);

    cy.get("[name='logout']").click();
  });
});
