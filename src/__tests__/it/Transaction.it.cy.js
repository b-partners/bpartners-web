import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../../App';

describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('Transaction it test', () => {
    mount(<App />);

    cy.get('[name="transactions"]').click();

    const timeout = 10_000;

    cy.intercept('GET', '/accounts/7efea565-bc2b-463f-b219-ef695c4acdc8/transactions?status=2&category=15').as('getTransactionByStatus');
    cy.get('#status').click();
    cy.contains('Acceptée').click();
    cy.wait('@getTransactionByStatus');

    cy.intercept('GET', '/accounts/7efea565-bc2b-463f-b219-ef695c4acdc8/transactions?label=VIREMENT+MLE+TAHINA+RAL+Toulouse&status=2&category=15').as(
      'getTransactionByLabelStatus'
    );
    const labelToSearch = 'VIREMENT MLE TAHINA RAL Toulouse';
    cy.get("[name='label']").type(labelToSearch);
    cy.wait('@getTransactionByLabelStatus', { timeout });

    // test of money unity
    cy.contains('+ 258,02 €');
  });
});
