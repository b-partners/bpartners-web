import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { marketplaces1 } from './mocks/responses/marketplace-api.ts';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('only show long description when asked', () => {
    mount(<App />);
    cy.intercept('GET', '/accounts/mock-account-id1/marketplaces**', marketplaces1).as('getMarketplaces');
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();

    cy.wait('@getMarketplaces');

    const mp1 = '[data-cy-item="mp-0"]';
    const mp2 = '[data-cy-item="mp-1"]';

    cy.get(mp1).should('not.contain.text', 'mp-0');
    cy.get(mp2).should('not.contain.text', 'mp-1');

    cy.get(mp1).click();
    cy.get(mp1).should('contain.text', 'mp-0');

    cy.get(mp2).click();
    cy.get(mp2).should('contain.text', 'mp-1');

    cy.get(mp1).should('not.contain.text', 'mp-0');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.intercept('GET', '/accounts/mock-account-id1/marketplaces**', marketplaces1).as('getMarketplaces');
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();
    cy.wait('@getMarketplaces');

    cy.get('[data-testid="link-websiteUrl 1"]').should('have.attr', 'href', 'websiteUrl 1');
    cy.contains('Name 1');
    cy.contains('Description 3');
  });

  it('should show info when list is empty', () => {
    mount(<App />);
    cy.intercept('GET', '/accounts/mock-account-id1/marketplaces**', []).as('getMarketplaces');
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();
    cy.wait('@getMarketplaces');

    cy.contains('Pas encore de Marketplace.');
  });
});
