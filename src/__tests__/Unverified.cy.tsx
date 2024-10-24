import App from '@/App';
import { cache, getCached } from '@/providers';
import { account1, accountHolders1, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { user1, user2, whoami1 } from './mocks/responses/security-api';

describe('Unverified user', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(getCached, 'account').returns(account1);
    cy.stub(navigator.clipboard, 'writeText').as('copyToClipboard');
  });

  it('should test unverified user warning', () => {
    cache.whoami({ user: user2 });
    cy.intercept('GET', `/users/${whoami1.user.id}`, user2).as('getUser2');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.contains('Avertissement');
    cy.contains(`Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au support.`);
    cy.get('#closeWarning').click();

    cy.contains('(Compte non vérifié)');

    cy.get('[name="account"]').click();
  });

  it('should test bank update warning', () => {
    const unverifiedAccount = accounts1.slice();
    unverifiedAccount[0].status = 'SCA_REQUIRED';

    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser2');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, unverifiedAccount).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${unverifiedAccount[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${unverifiedAccount[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.contains('Mettez à jour votre banque');
    cy.contains('01 84 80 31 69');
    cy.contains('Plus tard').click();
  });
});
