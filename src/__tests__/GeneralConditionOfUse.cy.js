import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { products1 } from './mocks/responses/product-api';
import { accounts1, accountHolders1, legalFiles1 } from './mocks/responses/account-api';

describe(specTitle('General Condition of Use'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/legalFiles/*`, []).as('approveLegalFile');
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
  });

  describe('there are unapproved cgu', () => {
    beforeEach(() => {
      cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, legalFiles1).as('getLegalFiles1');
    });

    it('is displayed when CGU is not accepted yet', () => {
      mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');

      cy.contains("Conditions générales d'utilisation");
      cy.contains('legal file version 1');
      cy.contains('legal file version 2');
      cy.should('not.contain.text', 'legal file version 3');
    });

    it('is approving legal file on next button', () => {
      mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');

      cy.get('[name="lf-next-button"]').click();
      cy.wait('@approveLegalFile');

      cy.get('[name="lf-next-button"]').click();
      cy.wait('@approveLegalFile');
    });
  });

  describe('There is not any unapproved cgu', () => {
    beforeEach(() => {
      cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('getLegalFiles');
    });

    it('should not display cgu dialog', () => {
      mount(<App />);

      gotoProduct();

      cy.wait('@getLegalFiles');

      cy.get('body').should('not.contain.text', "Conditions générales d'utilisation");
    });
  });
});

function gotoProduct() {
  cy.get('[name="products"]').click({ force: true });
  cy.wait('@whoami');
  cy.wait('@getAccount1');
  cy.wait('@getAccountHolder1');
  cy.wait('@getProducts1');
}
