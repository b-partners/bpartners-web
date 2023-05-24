import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { whoami1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1, businessActivities, account1 } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import * as Redirect from 'src/common/utils';

const redirectionUrl = {
  redirectionStatusUrls: { failureUrl: 'dummy', successUrl: 'dummy' },
  redirectionUrl: 'dummy',
};

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    const newAccount = [{ ...account1, bic: 'bic1234', iban: 'iban1234', bank: { name: 'BMOI' } }];

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccount).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('POST', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/initiateBankConnection`, redirectionUrl).as('initiateBankConnection');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
  });

  it('Test partners', () => {
    cy.stub(Redirect, 'redirect');

    mount(<App />);
    cy.get('[name="partners"]').click();
    cy.contains("Besoin d'un compte bancaire ?");
    cy.contains("Besoin d'assurer votre activité au meilleur tarif ?");
    cy.contains('Laetitia DRONIOU');
    cy.contains('01.40.04.77.07');
    cy.contains('laetitia.droniou@bred.fr');
    cy.contains('En cours de construction.');
  });
});
