import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1 } from './mocks/responses/security-api';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
  });

  it('is displayed on login', () => {
    mount(<App />);
    cy.wait('@whoami'); //TODO: ask backend to fix GET /users/id
    cy.get('[href="/account"]').click();

    cy.contains('Ma société');
    cy.contains('Mon identité');
    cy.contains('First Name 1');
    cy.contains('Mon abonnement');
  });
});
