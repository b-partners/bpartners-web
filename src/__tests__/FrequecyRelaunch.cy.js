import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
  });

  it('should send configuration', () => {
    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[title="Configuration"] > .MuiIconButton-label > .MuiSvgIcon-root').click();
    cy.get('.MuiAccordionSummary-content > .MuiTypography-root').click();
    cy.wait('@getInvoiceRelaunch1');

    cy.get('.MuiBox-root-3 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').should('have.value', 10);
    cy.get('.MuiBox-root-4 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').should('have.value', 20);

    cy.get('.MuiBox-root-3 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type(1);
    cy.get('.MuiBox-root-4 > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type(1);

    cy.get('.MuiButton-label').click();
    cy.wait('@getInvoiceRelaunch2');

    cy.contains('Changements enregistrer');
  });
});
