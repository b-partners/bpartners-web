import { User, Whoami } from '@bpartners/typescript-client';
import { images1 } from '../../src/__tests__/mocks/responses/file-api';
import { user1, whoami1 } from '../../src/__tests__/mocks/responses/security-api';
import { authProvider, awsAuth, userAccountsApi } from '../../src/providers';

const SESSION_STUB = {
  tokens: {
    idToken: { toString: () => 'dummy', payload: { exp: new Date().getTime() / 1000 + 1000 } },
    accessToken: { toString: () => 'dummy' },
  },
};

const COGNITO_RESPONSE = {
  nextStep: {
    signInStep: '',
  },
};

const LOGIN_PARAMS = { username: 'dummy', password: 'dummy' };

export interface MockCognitoLoginOptions {
  whoami?: Whoami;
  user?: User;
}
const mockCognitoLogin = (options?: MockCognitoLoginOptions) => {
  /*
      just replace all amplify functions to mock login
      we never call cognito
    */
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
  cy.intercept('GET', '/whoami', options?.whoami || whoami1).as('whoami');
  cy.intercept('GET', `/users/${(options?.whoami || whoami1).user.id}`, options?.user || user1).as('getUser1');
  cy.intercept('GET', `/accounts/**/files/**/raw**`, images1).as('fetchLogo');
  cy.intercept('GET', `users/**/legalFiles`, []).as('getLegalFile');
  cy.stub(awsAuth, 'fetchAuthSession').returns(Promise.resolve(SESSION_STUB));
  cy.stub(awsAuth, 'signIn').returns(Promise.resolve(COGNITO_RESPONSE));
  cy.stub(authProvider, 'checkAuth').returns(Promise.resolve());
  cy.then(async () => await authProvider.login(LOGIN_PARAMS));
};

const waitAuthRequestNeeded = () => {
  cy.wait('@whoami');
  cy.wait('@getUser1');
  cy.wait('@getLegalFile');
};

const realCognitoLogin = () => {
  const REAL_COGNITO_REAL_PARAMS = {
    username: process.env.REACT_APP_IT_USERNAME,
    password: process.env.REACT_APP_IT_PASSWORD,
  };
  cy.session([REAL_COGNITO_REAL_PARAMS], () => {
    cy.then(async () => await authProvider.login(REAL_COGNITO_REAL_PARAMS));
  });
};

const dataCy = <Subject = any>(value: string, additionalCommand = '') => cy.get<Subject>(`[data-cy="${value}"]${additionalCommand}`);
const name = <Subject = any>(value: string, additionalCommand = '') => cy.get<Subject>(`[name="${value}"]${additionalCommand}`);
const getByAttribute = <Subject = any>(attribute: string, value: string) => cy.get<Subject>(`[${attribute}='${value}']`);
const getByTestId = <Subject = any>(id: string) => getByAttribute<Subject>('data-testid', id);
const getByAriaLabel = <Subject = any>(value: string) => getByAttribute<Subject>('aria-label', value);
const getByName = <Subject = any>(value: string) => getByAttribute<Subject>('name', value);
const getByDataCy = <Subject = any>(value: string) => getByAttribute<Subject>('data-cy', value);

const removeApiDummyUser = async () => {
  try {
    await userAccountsApi().deleteUser();
  } catch (error) {
    console.log(error);
  }
};

const e2eLogin = () => {
  cy.clearAllLocalStorage();
  cy.visit(process.env.REACT_APP_PROD_URL);
  cy.intercept('GET', `/captcha/token**`, { body: true }).as('validateCaptcha');
  cy.name('username').type(process.env.REACT_APP_IT_USERNAME);
  cy.name('password').type(process.env.REACT_APP_IT_PASSWORD + '{enter}');
};

Cypress.Commands.add('name', name);
Cypress.Commands.add('dataCy', dataCy);
Cypress.Commands.add('e2eLogin', e2eLogin);
Cypress.Commands.add('getByAttribute', getByAttribute);
Cypress.Commands.add('getByAriaLabel', getByAriaLabel);
Cypress.Commands.add('getByName', getByName);
Cypress.Commands.add('getByTestId', getByTestId);
Cypress.Commands.add('getByDataCy', getByDataCy);
Cypress.Commands.add('cognitoLogin', mockCognitoLogin);
Cypress.Commands.add('realCognitoLogin', realCognitoLogin);
Cypress.Commands.add('removeApiDummyUser', removeApiDummyUser);
Cypress.Commands.add('waitAuthRequestNeeded', waitAuthRequestNeeded);
