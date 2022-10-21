import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import * as Redirect from '../utils/redirect';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { marketplaces1 } from './mocks/responses/marketplace-api.ts';
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

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('are displayed', () => {
    mount(<App />);
    cy.intercept('GET', '/accounts/mock-account-id1/marketplaces', marketplaces1).as('getMarketplaces');
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();
    cy.wait('@getMarketplaces');

    cy.contains('websiteUrl 1');
    cy.contains('Name 1');
    cy.contains('Description 3');
  });

  it('should show info when list is empty', () => {
    mount(<App />);
    cy.intercept('GET', '/accounts/mock-account-id1/marketplaces', []).as('getMarketplaces');
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();
    cy.wait('@getMarketplaces');

    cy.contains('Aucun enregistrement à afficher');
  });
});
