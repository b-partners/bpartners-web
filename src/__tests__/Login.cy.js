import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import LoginSuccessPage from '../security/LoginSuccessPage';

import * as Redirect from '../common/utils/redirect';
import App from 'src/App';

describe(specTitle('Login'), () => {
  beforeEach(() => {
    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('SuccessPage redirects to / on valid code', () => {
    mount(<LoginSuccessPage />);
    cy.contains('Vous êtes authentifiés !');
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('MainPage redirects to onboarding url', () => {
    mount(<App />);
    cy.intercept('POST', '/onboardingInitiation', { redirectionUrl: 'https://authUrl.com' }).as('onboardingInitiation');
    cy.get('#register').contains(`Pas de compte ? C'est par ici`);
    cy.get('#register').click();
    cy.wait('@onboardingInitiation');
    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('Test Login form', () => {
    mount(<App />);
    cy.get("[name='username']").type('dummy{enter}');
    cy.contains('Ce champ est requis');
    cy.get("[name='password']").type('dummy');
    cy.get("[name='username']").clear();
    cy.contains('Ce champ est requis');
    cy.get("[name='username']").type('dummy{enter}');
  });
});
