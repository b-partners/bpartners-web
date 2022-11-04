import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';

describe(specTitle('Error handling'), () => {
  beforeEach(() => {
    cy.viewport(1360, 760);
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
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
  });

  it('Should stay logged after catching an error', () => {
    mount(<App />);

    cy.get('[name="account"]').click();

    cy.contains('101');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');

    cy.contains('Mon identité');
    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click(); // MON ABONNEMENT
    cy.contains('Mon abonnement');
    cy.contains(`L'ambitieux`);
    cy.contains(`0€ de coût fixe par mois`);

    cy.get('[name="products"]').click();

    cy.contains("Une erreur s'est produite");

    cy.get('[name="customers"]').click();

    cy.contains("Une erreur s'est produite");

    cy.get('[name="account"]').click();

    cy.contains('101');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');

    cy.contains('Mon identité');
    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click(); // MON ABONNEMENT
    cy.contains('Mon abonnement');
    cy.contains(`L'ambitieux`);
    cy.contains(`0€ de coût fixe par mois`);
  });
});