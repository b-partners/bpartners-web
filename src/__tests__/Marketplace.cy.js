import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import authProvider from 'src/providers/auth-provider';
import * as Redirect from '../common/utils/redirect';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { prospectsMock } from './mocks/responses/prospects-api';
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
    cy.intercept('GET', `/accountHolders/mock-accountHolder-id1/prospects`, prospectsMock).as('prospectList');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('should show prospect list', () => {
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();
    cy.contains('À contacter');
    cy.contains('Contacté');
    cy.contains('Converti');

    cy.get('[data-testid="À contacter_prospect_list"]').contains('john doe');
    cy.get('[data-testid="Contacté_prospect_list"]').contains('Alyssa Hain');
    cy.get('[data-testid="Converti_prospect_list"]').contains('jane doe');
  });

  it('should show empty list', () => {
    cy.intercept('GET', `/accountHolders/mock-accountHolder-id1/prospects`, []).as('prospectList');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="marketplaces"]').click();

    cy.contains('Aucun enregistrement à afficher');
  });
});
