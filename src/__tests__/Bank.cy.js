import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { whoami1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1, businessActivities, account1 } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import * as accountProvider from 'src/providers/account-provider';
import * as Redirect from 'src/common/utils/redirect';

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

  it('Test bank', () => {
    cy.stub(Redirect, 'redirect');
    cy.stub(accountProvider, 'clearCachedAccount');

    mount(<App />);
    cy.get('[name="bank"]').click();
    cy.contains('BMOI');
    cy.contains('bic1234');
    cy.contains('iban1234');

    cy.get("[name='bic']").clear();
    cy.contains('Ce champ est requis');

    const newAccount2 = [{ ...account1, bic: 'newBic1234', iban: 'iban1234', bank: { name: 'BMOI' } }];
    cy.intercept('PUT', `/users/mock-user-id1/accounts/mock-account-id1/identity`, request => {
      const bankInfo = request.body;
      expect(bankInfo.name).to.eq('Numer');
      expect(bankInfo.bic).to.eq('newBic1234');
      expect(bankInfo.iban).to.eq('iban1234');
      request.reply({ body: newAccount2 });
    }).as('updateBankInfo');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccount2);

    cy.contains('Pour finaliser votre synchronisation de compte bancaire, veuillez renseigner votre BIC présent sur votre RIB et enregistrer.');
    cy.get("[name='bic']").type('newBic1234{enter}');

    cy.contains('newBic1234');
  });

  it('Should update account name and iban', () => {
    mount(<App />);
    cy.get('[name="bank"]').click();

    cy.contains('Numer');
    cy.contains('bic123');
    cy.contains('iban123');

    cy.get("[name='name']").clear();
    cy.contains('Ce champ est requis');
    cy.get("[name='name']").type('newName');
    cy.get("[name='bic']").clear().type('newBic1234');
    cy.get("[name='iban']").clear().type('newIban1234{enter}');

    cy.intercept('PUT', `/users/mock-user-id1/accounts/mock-account-id1/identity`, request => {
      const bankInfo = request.body;
      const newAccount2 = [{ ...bankInfo, bank: { name: 'BMOI' } }];
      expect(bankInfo.name).to.eq('newName');
      expect(bankInfo.bic).to.eq('newBic1234');
      expect(bankInfo.iban).to.eq('newIban1234');
      request.reply({ body: newAccount2 });
    }).as('updateBankInfo');
  });

  it('Should disconnect bank', () => {
    mount(<App />);
    cy.get('[name="bank"]').click();
    cy.get('[data-testid="bank-disconnection-front-button"]').click();
    cy.contains('Confirmation');
    cy.contains('Voulez vous déconnecter la banque BMOI ?');
    cy.get("[data-testid='bank-disconnection-button']").click();
    cy.intercept('POST', `/users/mock-user-id1/disconnectBank`, { ...account1, bank: null });
    cy.contains('Aucune banque associée.');
    cy.contains('Cliquez ici pour associer une banque.');
  });
});
