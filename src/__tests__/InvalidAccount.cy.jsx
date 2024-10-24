import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '@/App';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1, validationRedirectionUrl } from './mocks/responses/account-api';
import { transactions, transactionsSummary } from './mocks/responses/paying-api';
import { whoami1 } from './mocks/responses/security-api';
import transactionCategory1 from './mocks/responses/transaction-category-api';

const date = new Date().toISOString().slice(0, 10);

describe(specTitle('Validate Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.stub(Redirect, 'toURL').as('toURL');

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
    cy.contains('Mettez à jour votre banque');
    cy.contains('Pour continuer à voir vos transactions et encaisser en temps réel, veuillez reconnecter votre banque.');

    cy.get('[data-testid="dialog-btn"]').click();
    cy.get('@toURL').should('have.been.calledOnce');
  });
});
