import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';
import { accountHolders1, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { whoami1 } from './mocks/responses/security-api';

xdescribe(specTitle('Error handling'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}`).as('getCustomers');
  });

  it('Should stay logged after catching an error', () => {
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    mount(<App />);

    cy.get('[name="account"]').click();

    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.contains('Ma société');

    cy.contains('activité officielle');
    cy.contains('101');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');

    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click(); // MON ABONNEMENT
    cy.contains('Mon abonnement');
    cy.contains(`L'essentiel`);
    cy.contains(`0€ de coût fixe par mois`);

    cy.get('[name="products"]').click();

    cy.contains("Une erreur s'est produite");

    cy.get('[name="customers"]').click();

    cy.contains("Une erreur s'est produite");

    cy.get('[name="account"]').click();

    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.contains('Ma société');

    cy.contains('101');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');

    cy.contains('Mon abonnement');
  });
});
