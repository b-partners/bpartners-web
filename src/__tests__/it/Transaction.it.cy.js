import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../../App';

describe(specTitle('Transaction'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('are amounts displayed correctly', () => {
    mount(<App />);

    cy.get('[name="transactions"]').click();
    cy.get('#status').click();
    cy.contains('Acceptée').click();

    cy.contains('- 1000,00 €');
    cy.contains('VIR INST NORO RATOVONARI Virement de M F MAURICA ANDRIANA Virement de M F MAURICA ANDRIANA');

    cy.contains('- 3000,00 €');
    cy.contains('VIR INST NUMER Virement de M F MAURICA ANDRIANA Virement de M F MAURICA ANDRIANA');
  });
});
