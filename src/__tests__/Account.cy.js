import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, user1, token1 } from './mocks/responses/security-api';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1);
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
  });

  it('is displayed on login', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1'); //TODO: ask backend to fix GET /users/id
    mount(<App />);
    cy.wait('@getUser1');

    cy.contains('Ma société');
    cy.contains('Mon identité');
    cy.contains('First Name 1');
    cy.contains('Mon abonnement');
  });
});
