import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  });

  it('should send support', () => {
    cy.mount(<App />);

    cy.get('[name="support"]').click();

    cy.contains('contact@bpartners.app');
    cy.contains('Pour contacter le support, veuillez envoyer un courriel à contact@bpartners.app ou nous appeler directement au:');
    cy.contains('01 84 80 31 69');
  });
});
