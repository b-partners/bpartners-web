import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import { user2, whoami2 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { prospects } from './mocks/responses/prospects-api';

describe(specTitle('evaluation prospects'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', '/whoami', whoami2).as('whoami');
    cy.intercept('GET', `/users/**`, user2).as('getUser2');

    cy.intercept('GET', `/users/${whoami2.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
    cy.intercept('GET', `/users/${whoami2.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');
  });
  it('should not display evaluation prospects section', () => {
    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('#closeWarning').click();
    cy.get('[data-cy="configuration-tab"]').click();

    cy.contains('Évaluation des prospects').should('not.exist');
  });
});
