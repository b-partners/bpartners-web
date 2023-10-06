import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { whoami1, token1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1);

    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunchConf`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunchConf`, invoiceRelaunch2).as('getInvoiceRelaunch2');
  });

  it('should send configuration', () => {
    cy.mount(<App />);

    cy.get('[name="configurations"]').click();

    cy.get('[name="draftRelaunch"]').should('have.value', 10);
    cy.get('[name="unpaidRelaunch"]').should('have.value', 20);

    cy.get('[name="draftRelaunch"]').type(1);
    cy.get('[name="unpaidRelaunch"]').type(1);

    cy.get('[data-testid="submit-frequency-relaunch"]').click();

    cy.contains('Changements enregistrer');
  });
});
