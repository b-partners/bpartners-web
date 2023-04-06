import { Auth } from 'aws-amplify';
import authProvider from '../../src/providers/auth-provider';
import { whoami1, user1 } from '../../src/__tests__/mocks/responses/security-api';
import { images1 } from '../../src/__tests__/mocks/responses/file-api';

const sessionStub = {
  getIdToken: () => ({ getJwtToken: () => 'dummy' }),
  getAccessToken: () => ({ getJwtToken: () => 'dummy' }),
  getRefreshToken: () => ({ getToken: () => 'dummy' }),
};

const cognitoResponse = {
  signInUserSession: {
    idToken: {
      jwtToken: 'dummy',
    },
    refreshToken: {
      token: 'dummy',
    },
    accessToken: {
      jwtToken: 'dummy',
    },
  },
};

const loginParams = { username: 'dummy', password: 'dummy' };

Cypress.Commands.add('cognitoLogin', () => {
  /*
      just replace all amplify functions to mock login
      we never call cognito
    */

  cy.intercept('GET', '/whoami', whoami1).as('whoami');
  cy.intercept('GET', `/users/**`, user1).as('getUser1');
  cy.intercept('GET', `/accounts/**/files/**/raw**`, images1).as('fetchLogo');
  cy.intercept('GET', `users/**/legalFiles`, []).as('getLegalFile');
  cy.stub(Auth, 'currentSession').returns(Promise.resolve(sessionStub));
  cy.stub(Auth, 'signIn').returns(Promise.resolve(cognitoResponse));
  cy.then(async () => await authProvider.login(loginParams));
});
