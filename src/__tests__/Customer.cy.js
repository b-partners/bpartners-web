import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import * as Redirect from '../common/utils/redirect';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1, customers2, customers3 } from './mocks/responses/customer-api';
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

    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=1&pageSize=15', customers1).as('getCustomers1');
    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=2&pageSize=15', customers1).as('getCustomers1');
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
    cy.wait('@getCustomers1');

    cy.contains('2589 Nelm Street');
    cy.contains('Name 1');
    cy.contains('FirstName 1');
    cy.contains('Email 3');
    cy.contains('22 22 22');
  });

  it('Should create customer', () => {
    cy.intercept('POST', '/accounts/mock-account-id1/customers', req => {
      const newCustomer = {
        address: 'Wall Street 2',
        comment: 'comment',
        email: 'test@gmail.com',
        firstName: 'FirstName 11',
        lastName: 'LastName 11',
        phone: '55 55 55',
      };

      expect(req.body[0]).to.deep.eq(newCustomer);
      req.reply([customers2[3]]);
    }).as('modifyCustomers');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers1');

    cy.contains('Email');

    cy.get('[data-testId="create-button"]').click();

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.get('#email').clear().type('test@gmail.com{enter}');
    cy.contains('Ce champ est requis');

    cy.get('#lastName').type('LastName 11');
    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=1&pageSize=15', customers2).as('getCustomers2');
    cy.get('#firstName').type('FirstName 11');
    cy.get('#address').type('Wall Street 2');
    cy.get('#comment').type('comment');
    cy.get('#phone').type('55 55 55{enter}');

    cy.wait('@modifyCustomers');

    cy.contains('Bonjour First Name 1 !');

    cy.contains('Wall Street 2');
    cy.contains('LastName 11');
    cy.contains('FirstName 11');
    cy.contains('Email 1');
    cy.contains('55 55 55');
  });

  it('Should exit of the edit on click on the close button', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers1');
    cy.contains('Email');
    cy.get('.MuiTableBody-root > :nth-child(1)').click();
    cy.contains('Édition de client');
    cy.get("[data-testid='closeIcon']").click();

    cy.contains('Édition de client').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should exit of the create on click on the close button', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers1');
    cy.contains('Email');
    cy.get('[data-testId="create-button"]').click();
    cy.contains('Création de client');
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de client').should('not.exist');
    cy.contains('Page : 1');
  });

  it('Should test pagination', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers1');
    cy.contains('Email');
    cy.contains('Page : 1');

    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('Page : 2');
    cy.contains('Taille : 3');
  });

  it('Should edit a customer', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="customers"]').click();
    cy.wait('@getCustomers1');
    cy.contains('Email');
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-firstName').click();
    cy.contains('Édition de client');

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.intercept('PUT', '/accounts/mock-account-id1/customers', req => {
      const updatedCustomer = {
        address: 'Wall Street 2',
        comment: '',
        email: 'test@gmail.com',
        firstName: 'FirstName 11',
        id: 'customer1',
        lastName: 'LastName 11',
        phone: '55 55 55',
      };
      expect(req.body[0]).to.deep.eq(updatedCustomer);
      req.reply([customers2[3]]);
    }).as('updateCustomers');

    cy.get('#email').clear().type('test@gmail.com');

    cy.get('#lastName').clear().type('LastName 11');
    cy.intercept('GET', '/accounts/mock-account-id1/customers?page=1&pageSize=15', customers3).as('getCustomers3');
    cy.get('#firstName').clear().type('FirstName 11');
    cy.get('#address').clear().type('Wall Street 2');
    cy.get('#comment').contains('comment customer 1');
    cy.get('#comment').clear();
    cy.get('#phone').clear().type('55 55 55{enter}');

    cy.wait('@updateCustomers');

    cy.contains('Bonjour First Name 1 !');

    cy.contains('Wall Street 2');
    cy.contains('LastName 11');
    cy.contains('FirstName 11');
    cy.contains('Email 1');
    cy.contains('55 55 55');
  });
});
