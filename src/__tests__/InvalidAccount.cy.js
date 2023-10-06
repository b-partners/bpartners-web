import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { whoami1 } from './mocks/responses/security-api';
import { accountHolders1, accounts1, validationRedirectionUrl } from './mocks/responses/account-api';
import App from 'src/App';
import { transactions, transactionsSummary } from './mocks/responses/paying-api';
import transactionCategory1 from './mocks/responses/transaction-category-api';
import * as Redirect from '../common/utils/redirect';

const date = new Date().toISOString().slice(0, 10);

describe(specTitle('Validate Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.stub(Redirect, 'redirect').as('redirect');

    cy.intercept('GET', '/accounts/mock-account-id1/**', transactions).as('getTransactions');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, [{ ...accounts1[0], status: 'VALIDATION_REQUIRED' }]).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary**`, transactionsSummary).as('getTransactionsSummary');
    cy.intercept('GET', `/accounts/mock-account-id1/transactionCategories?transactionType=INCOME&from=${date}&to=${date}`, transactionCategory1).as(
      'getTransactionCategory'
    );
  });

  it('should validate account', () => {
    cy.intercept('POST', '/users/mock-user-id1/accounts/mock-account-id1/initiateAccountValidation', validationRedirectionUrl).as('initiateAccountValidation');
    cy.mount(<App />);

    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');
    cy.contains('Validation de vos identifiants requis');
    cy.contains('Il semble que vos identifiants ne soient pas corrects, veuillez les valider.');

    cy.get('[data-testid="dialog-btn"]').click();
    cy.get('@redirect').should('have.been.calledOnce');
  });
});
