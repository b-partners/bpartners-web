import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1, user2 } from './mocks/responses/security-api';
import { accounts1, accountHolders1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';

describe(specTitle('Account'), () => {
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
  });

  it('is displayed on login', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();

    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.contains('Ma société');
    cy.contains('Numer');
    cy.contains('activité officielle');
    cy.contains('100000');
    cy.contains('123');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');
    cy.contains('101');

    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click(); // MON ABONNEMENT
    cy.contains('Mon abonnement');
    cy.contains(`L'essentiel`);
    cy.contains(`0€ de coût fixe par mois`);
  });

  it('Change business Activity', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw?fileType=LOGO`, images1).as('logoUpload');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/businessActivities`, accountHolders1).as(
      'updateBusinessActivities'
    );

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();

    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.get('#primary-activity').type('Bottier').blur();
    // cy.contains('Bottier').click();
    cy.get('#secondary-activity').type('Armurier').blur();
    // cy.contains('Armurier').click();
    cy.get('.css-19midj6 > .MuiButton-root').click();
    cy.contains('Changement enregistré');
  });

  it('unverified user warning', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user2).as('getUser2');

    mount(<App />);
    cy.wait('@getUser2');

    cy.contains('Avertissement');
    cy.contains(`Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au support.`);
    cy.get('#closeWarning').click();

    cy.contains('(Compte non vérifié)');

    cy.get('[name="account"]').click();
  });

  it('upload logo image', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw?fileType=LOGO`, images1).as('logoUpload');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();

    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.get('#upload-photo-label').should('be.visible').selectFile('public/favicon64.png', { force: true });

    cy.wait('@logoUpload');
    cy.contains('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.');
  });
});
