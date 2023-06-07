import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1, account2, account1 } from './mocks/responses/account-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';

const newUser = { ...user1, activeAccount: { ...account2, active: true } };
const newAccounts = [
  { ...account2, active: true },
  { ...account1, active: false },
];
describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1);

    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunchConf`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunchConf`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('POST', `/users/mock-user-id1/accounts/mock-account-id2/active`, newUser).as('setAccount');
  });

  it('should send configuration', () => {
    mount(<App />);

    // cy.get('[name="configurations"]').click();
    // cy.get('[data-testid="ArrowDropDownIcon"]').click();
    // cy.contains('Numer-account-2').click();
    // cy.get('[data-testid="submit-change-account"]').click();
    // cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccounts);
  });
});
