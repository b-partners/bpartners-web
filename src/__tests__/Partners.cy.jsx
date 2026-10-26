import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { Redirect } from '@/common/utils';
import { partners } from '@/operations/partners/partners';
import { account1, accountHolders1, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    const newAccount = [{ ...account1, bic: 'bic1234', iban: 'iban1234' }];

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccount).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
  });

  it('Test partners', () => {
    cy.stub(Redirect, 'toURL');

    cy.mount(<App />);
    cy.get('[name="partners"]').click();

    cy.contains("Besoin d'une assurance adaptée");
    cy.contains("Découvrez l'assurance");
    cy.contains('À votre activité professionnelle ?');

    // the cards open their partner in a new tab: clicking them would take the runner off to bred.fr
    partners.forEach(({ buttonLabel, redirectionLink }) => {
      cy.contains('a', buttonLabel).should('have.attr', 'href', redirectionLink).and('have.attr', 'target', '_blank');
    });
  });
});
