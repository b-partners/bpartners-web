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
      expect(bankInfo.name).to.eq('BMOI');
      expect(bankInfo.bic).to.eq('newBic1234');
      expect(bankInfo.iban).to.eq('iban1234');
      request.reply({ body: newAccount2 });
    }).as('updateBankInfo');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccount2);
    cy.get("[name='bic']").type('newBic1234{enter}');

    cy.contains('newBic1234');
  });
});
