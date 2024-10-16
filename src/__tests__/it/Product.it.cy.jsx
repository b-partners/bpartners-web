import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

describe(specTitle('Products'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('are displayed', () => {
    cy.mount(<App />);

    cy.skipBankSynchronisation();

    cy.get('[name="products"]').click();
    cy.contains('Un euro symbolique');
    cy.contains('Un micro-conseil');
    cy.contains('1,00 €');

    cy.name('descriptionFilter').type('complexe');

    cy.intercept(
      'GET',
      '/accounts/76aa0457-a370-4df8-b8f9-105a8fe16375/products?unique=true&descriptionFilter=complexe&priceFilter=791&status=ENABLED&page=1&pageSize=15'
    ).as('filter');
    cy.name('priceFilter').type('7.91');
    cy.wait('@filter', { timeout: 10_000 });
    cy.contains('Un produit avec un prix complexe').click();
    cy.contains('Archiver');
  });
});
