import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { Redirect } from '@/common/utils';
import { account1, account2, accountHolders1, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { user1, whoami1 } from './mocks/responses/security-api';

const redirectionUrl = {
  redirectionStatusUrls: { failureUrl: 'dummy', successUrl: 'dummy' },
  redirectionUrl: 'dummy',
};
const newUser = { ...user1, activeAccount: { ...account2, active: true } };
const newAccounts = [
  { ...account2, active: true },
  { ...account1, active: false },
];
describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    const newAccount = [{ ...account1, bic: 'bic1234', iban: 'iban1234', bank: { name: 'BMOI' } }];

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [...newAccount, account2]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('POST', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/initiateBankConnection`, redirectionUrl).as('initiateBankConnection');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.intercept('POST', `/users/mock-user-id1/accounts/mock-account-id2/active`, newUser).as('setAccount');
  });

  it('Test change account', () => {
    cy.mount(<App />);
    cy.get('[name="bank"]').click();
    cy.contains('BMOI');
    cy.contains('bic1234');
    cy.contains('iban1234');

    cy.contains('Changer de compte d’encaissement.');
    cy.get('[data-testid="ArrowDropDownIcon"]').click();
    cy.contains('Numer-account-2').click();
    cy.get('[data-testid="submit-change-account"]').click();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccounts);
  });

  it('Test bank', () => {
    cy.stub(Redirect, 'toURL');

    cy.mount(<App />);
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
      request.reply({ body: newAccount2[0] });
    }).as('updateBankInfo');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, newAccount2);

    cy.contains('Pour finaliser votre synchronisation de compte bancaire, veuillez renseigner votre BIC présent sur votre RIB et enregistrer.');
    cy.get("[name='bic']").type('newBic1234{enter}');

    cy.contains('newBic1234');
  });

  it('Should update account name and iban', () => {
    cy.mount(<App />);
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
    cy.mount(<App />);
    cy.intercept('POST', `/users/mock-user-id1/disconnectBank`, { ...account1, bank: null });
    cy.get('[name="bank"]').click();
    cy.get('[data-testid="bank-disconnection-front-button"]').click();
    cy.contains('Confirmation');
    cy.contains('Voulez vous déconnecter la banque BMOI ?');
    cy.get("[data-testid='bank-disconnection-button']").click();
    cy.contains('Aucune banque associée.');
    cy.contains('Cliquez ici pour associer une banque.');
  });
});
