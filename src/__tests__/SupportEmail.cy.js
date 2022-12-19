import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
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
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
  });

  it('should send support', () => {
    mount(<App />);

    cy.get('[name="support"]').click();

    cy.contains("Contactez-nous à l'adresse email");
    cy.contains('Pour utiliser votre client email, cliquez ici.');
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').click();
  });

  it('should open client mail', () => {
    mount(<App />);

    cy.get('[name="support"]').click();

    cy.contains("Contactez-nous à l'adresse email");
    cy.contains('Pour utiliser votre client email, cliquez ici.');
    cy.get('.MuiDialogContent-root > a').click();
  });
});
