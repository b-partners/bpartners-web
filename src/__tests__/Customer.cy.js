import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get(':nth-child(2) > .MuiListItem-root').click();
    cy.wait('@getCustomers');

    cy.contains('2589 Nelm Street');
    cy.contains('Name 1');
    cy.contains('Email 3');
    cy.contains('22 22 22');
  });

  it('should validate input', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get(':nth-child(2) > .MuiListItem-root').click();
    cy.wait('@getCustomers');

    cy.get('[data-testid="AddIcon"]').click();

    cy.get('#name').type('valid');

    cy.get('[data-testid="SaveIcon"]').click();

    cy.contains('Ce champ est requis');
  })
});
