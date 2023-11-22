import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../../App';

describe(specTitle('Products'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('are displayed', () => {
    mount(<App />);

    cy.get('[name="products"]').click();
    cy.contains('Un euro symbolique');
    cy.contains('Un micro-conseil');
    cy.contains('1,00 €');

    cy.get('#descriptionFilter').type('complexe');

    cy.intercept(
      'GET',
      '/accounts/414049cb-5b6e-429e-b64d-8d6afdb201e4/products?unique=true&descriptionFilter=complexe&priceFilter=791&status=ENABLED&page=1&pageSize=15'
    ).as('filter');
    cy.get('#priceFilter').type('7.91');
    cy.wait('@filter', { timeout: 10_000 });
    cy.contains('Un produit avec un prix complexe').click();
    cy.contains('Supprimer');
  });
});
