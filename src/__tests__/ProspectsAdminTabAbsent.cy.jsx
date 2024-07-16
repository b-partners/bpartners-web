import App from '@/App';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { prospects } from './mocks/responses/prospects-api';
import { user2, whoami2 } from './mocks/responses/security-api';

describe(specTitle('administration tab not present for non admin users in prospects page'), () => {
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
    cy.mount(<App />);
    cy.get('[name="prospects"]').click();

    cy.wait('@getUser2');
    cy.wait('@getAccount1');
    cy.wait('@whoami');

    cy.get('#closeWarning').click({ force: true });
    cy.get('[data-cy="administration-tab"]').should('not.exist');
  });
});
