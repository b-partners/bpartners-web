import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { products } from './mocks/responses/product-api';
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
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
    cy.intercept('POST', `/accounts/mock-account-id1/products`, products).as('postProducts');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.wait('@getProducts');
    cy.contains('description1');
    cy.contains('10.00 €');

    cy.contains('description2');
    cy.contains('20.00 €');

    cy.contains('description3');
    cy.contains('30.00 €');
    cy.contains('10 %');
    cy.contains('33.00 €');
  });

  it('should validate empty input', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');
    cy.get('.MuiToolbar-root > a.MuiButtonBase-root').click();
    cy.get('#description').type('test description');
    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.contains('Ce champ est requis');
  });

  it('should create well-defined product', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');
    cy.get('.MuiToolbar-root > a.MuiButtonBase-root').click();

    cy.get('#description').type('new description');
    cy.get('#unitPrice').type(1.03);
    cy.get('#vatPercent').type(5);

    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      expect(req.body).to.deep.eq([
        {
          unitPrice: 103,
          vatPercent: 500,
          description: 'new description',
          quantity: 1,
        },
      ]);
    }).as('postNewProduct');
    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.wait('@postNewProduct');
  });
});
