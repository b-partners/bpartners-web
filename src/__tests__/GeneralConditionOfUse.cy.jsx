import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { Reload } from '../common/utils';
import { accountHolders1, accounts1, legalFiles1 } from './mocks/responses/account-api';
import { products } from './mocks/responses/product-api';
import { user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('General Condition of Use'), () => {
  beforeEach(() => {
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getAccount1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/legalFiles/*`, []).as('approveLegalFile');

    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/**`, products).as('getAllProducts');
    cy.stub(Reload, 'force').as('reload');
  });

  describe('There are unapproved cgu', () => {
    beforeEach(() => {
      cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, legalFiles1).as('getLegalFiles1');
      cy.readFile('src/assets/legal-file.pdf', 'binary').then(data => {
        cy.intercept('https://clri-ltc.ca/files/2018/09/TEMP-PDF-Document.pdf', data.toString()).as('getLegalFilePdf');
      });
    });

    it('is displayed when CGU is not accepted yet', () => {
      cy.mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');
      cy.wait('@getLegalFilePdf');

      cy.contains('Votre approbation est requise');
      cy.should('not.contain.text', 'legal file version 3');
      cy.should('not.contain.text', 'legal file version 2');
    });

    it('is approving legal file on next button', () => {
      cy.mount(<App />);
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
      cy.mount(<App />);
      gotoProduct();

      cy.wait('@getLegalFiles1');
      cy.wait('@getLegalFilePdf');

      cy.contains('1 / 41');

      cy.get('[data-test-item="pdf-prev"]').should('be.disabled');
      cy.get('[data-test-item="pdf-next"]').click();

      cy.contains('2 / 41');

      cy.get('[data-test-item="pdf-prev"]').should('not.be.disabled').click();

      cy.contains('1 / 41');
    });
  });

  describe('There is not any unapproved cgu', () => {
    beforeEach(() => {
      cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('getLegalFiles');
    });

    it('should not display cgu dialog', () => {
      cy.mount(<App />);

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
  cy.wait('@getAllProducts');
}
