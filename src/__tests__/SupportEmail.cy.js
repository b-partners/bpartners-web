import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { whoami1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

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
