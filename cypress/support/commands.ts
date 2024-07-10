import { authProvider, awsAuth } from '../../src/providers';
import { images1 } from '../../src/__tests__/mocks/responses/file-api';
import { user1, whoami1 } from '../../src/__tests__/mocks/responses/security-api';

const sessionStub = {
  tokens: {
    idToken: { toString: () => 'dummy', payload: { exp: new Date().getTime() / 1000 + 1000 } },
    accessToken: { toString: () => 'dummy' },
  },
};

const cognitoResponse = {
  nextStep: {
    signInStep: '',
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
  cy.stub(awsAuth, 'fetchAuthSession').returns(Promise.resolve(sessionStub));
  cy.stub(awsAuth, 'signIn').returns(Promise.resolve(cognitoResponse));
  cy.stub(authProvider, 'checkAuth').returns(Promise.resolve());
  cy.then(async () => await authProvider.login(loginParams));
});

Cypress.Commands.add('realCognitoLogin', () => {
  const loginParams = {
    username: process.env.REACT_APP_IT_USERNAME,
    password: process.env.REACT_APP_IT_PASSWORD,
  };
  cy.then(async () => await authProvider.login(loginParams));
});

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
      cognitoLogin(): void;
      realCognitoLogin(): void;
    }
  }
}
