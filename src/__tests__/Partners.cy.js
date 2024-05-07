import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import * as Redirect from 'src/common/utils';
import { account1, accountHolders1, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { whoami1 } from './mocks/responses/security-api';

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

    cy.contains("Besoin d'une assurance adaptée");
    cy.contains("Découvrez l'assurance");
    cy.contains('À votre activité professionnelle ?');
    cy.get(':nth-child(1) > .css-fevtbh > .MuiButtonBase-root').click();
  });
});
