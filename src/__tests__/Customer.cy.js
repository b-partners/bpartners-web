import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import * as Redirect from '../utils/redirect';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy',
          },
        })
    );

    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('POST', '/accounts/mock-account-id1/customers', [customers1[0]]).as('createCustomers');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('Should display customer list', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');

    cy.contains('2589 Nelm Street');
    cy.contains('Name 1');
    cy.contains('Email 3');
    cy.contains('22 22 22');
  });

  it('Should create customer', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');

    cy.contains('Email');

    cy.get('[data-testid="AddIcon"]').click();

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.get('#email').clear().type('test@gmail.com{enter}');
    cy.contains('Ce champ est requis');

    cy.get('#name').type('valid');
    cy.get('#address').type('some address');
    cy.get('#phone').type('55 55 55{enter}');

    cy.wait('@createCustomers');

    cy.contains('Bonjour First Name 1 !');
  });

  it('Should exit of the edit on click on the close button', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');
    cy.contains('Email');
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-name').click();
    cy.contains('Édition de client');
    cy.get("[data-testid='closeIcon']").click();

    cy.contains('Édition de client').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should exit of the create on click on the close button', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers');
    cy.contains('Email');
    cy.get('[data-testid="AddIcon"]').click();
    cy.contains('Création de client');
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de client').should('not.exist');
    cy.contains('Page : 1');
  });
});
