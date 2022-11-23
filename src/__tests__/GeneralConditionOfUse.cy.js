import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { products1 } from './mocks/responses/product-api';
import { accounts1, accountHolders1, legalFiles1 } from './mocks/responses/account-api';
import * as Reload from '../utils/reload';

describe(specTitle('General Condition of Use'), () => {
  beforeEach(() => {
    //note(login-user1)
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/legalFiles/*`, []).as('approveLegalFile');
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
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
    cy.stub(Reload, 'reload').as('reload');
  });

  describe('there are unapproved cgu', () => {
    beforeEach(() => {
      cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, legalFiles1).as('getLegalFiles1');

      cy.readFile('src/assets/legal-file.pdf', 'binary').then(data => {
        cy.intercept('https://clri-ltc.ca/files/2018/09/TEMP-PDF-Document.pdf', data.toString()).as('getLegalFilePdf');
      });
    });

    it('is displayed when CGU is not accepted yet', () => {
      mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');
      cy.wait('@getLegalFilePdf');

      cy.contains('Votre approbation est requise');
      cy.contains('legal file version 1');
      cy.contains('legal file version 2');
      cy.should('not.contain.text', 'legal file version 3');
    });

    it('is approving legal file on next button', () => {
      mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');
      cy.wait('@getLegalFilePdf');

      cy.get('[name="lf-next-button"]').click();
      cy.wait('@approveLegalFile');

      cy.get('[name="lf-next-button"]').click();
      cy.wait('@approveLegalFile');

      cy.get('@reload').should('have.been.calledOnce');
    });

    it('is displaying pdf with pagination', () => {
      mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');
      cy.wait('@getLegalFilePdf');

      cy.contains('1 - 41');

      cy.get('[data-item="pdf-prev-0"]').should('be.disabled');
      cy.get('[data-item="pdf-next-0"]').click();

      cy.contains('2 - 41');

      cy.get('[data-item="pdf-prev-0"]').should('not.be.disabled').click();

      cy.contains('1 - 41');
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

      cy.get('body').should('not.contain.text', 'Votre approbation est requise');
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
