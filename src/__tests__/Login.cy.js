import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import LoginPage from '../security/LoginPage';
import LoginSuccessPage from '../security/LoginSuccessPage';

import { phone1, token1, whoami1 } from './mocks/responses/security-api';
import * as Redirect from '../utils/redirect';
import App from 'src/App';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('MainPage redirects to authUrl on phone submission', () => {
    mount(<LoginPage />);
    cy.get('#phone').type(phone1);

    //TODO: ask backend to fix token.whoami
    cy.intercept('POST', '/authInitiation', { redirectionUrl: 'https://authUrl.com' }).as('createAuthInitiation');
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
    cy.contains('Se connecter');
    cy.contains('Bienvenue !');
  });
});
