import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { products1 } from './mocks/responses/product-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';

describe(specTitle('Products'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts1');
    cy.contains('description1');
    cy.contains('description2');
    cy.contains('description3');
  });

  it('should validate empty input', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts1');
    cy.get('.MuiToolbar-root > a.MuiButtonBase-root').click();
    cy.get('#description').type('test description');
    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.contains('Ce champ est requis');
  });
});
