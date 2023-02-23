import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { newProduct2, products } from './mocks/responses/product-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';

describe(specTitle('Products'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');
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
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
    cy.intercept('POST', `/accounts/mock-account-id1/products`, products).as('postProducts');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="products"]').click();
    cy.contains('description1');
    cy.contains('12.00 €');

    cy.contains('description2');
    cy.contains('24.00 €');

    cy.contains('description3');
    cy.contains('33.00 €');
  });

  it('should validate empty input', () => {
    mount(<App />);
    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description1');

    cy.get('[data-testId="create-button"]').click();

    cy.get('#description').type('test description').blur();

    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.contains('Ce champ est requis');
  });

  it('should create well-defined product', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description1');

    cy.get('[data-testId="create-button"]').click();

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

  it('Should edit a product', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description1');

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-description').click();
    cy.contains('Édition de produit');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, newProduct2).as('getModifiedProducts');

    cy.get('#description').clear().type('test description');
    cy.get('#unitPrice').clear().type(1);
    cy.get('#vatPercent').clear().type(1);

    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.wait('@getModifiedProducts');

    cy.contains('test description');
  });

  it('VAT references should not displayed', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, req => {
      // make isSubjectToVat = false
      const accountHolder = { ...accountHolders1[0] };
      accountHolder.companyInfo.isSubjectToVat = false;

      req.reply({
        body: [{ ...accountHolder }],
      });
    }).as('getAccountHolder2');

    mount(<App />);
    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder2');
    cy.wait('@getProducts');

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');

    cy.get('[data-testId="create-button"]').click();

    cy.contains(/TVA/gi).should('not.exist');
    cy.contains(/TTC/gi).should('not.exist');
  });

  it('Should exit of the edit or create node on click on the close button', () => {
    mount(<App />);

    cy.get('[name="products"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');
    cy.wait('@getProducts');

    cy.contains('description1');

    cy.get('[data-testId="create-button"]').click();

    cy.contains('Création de produit');
    cy.get("[data-testid='closeIcon']").click();
    cy.contains('Création de produit').should('not.exist');
    cy.contains('Page : 1');
  });
});
