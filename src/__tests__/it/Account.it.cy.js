import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../../App';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('is displayed on login', () => {
    mount(<App />);

    cy.get('[name="account"]').click();

    cy.contains('NUMER');
    cy.contains('Couvreur');
    cy.contains('Carreleur');

    cy.contains('InformationAndCommunication');
    cy.contains('6000,00 €');
    cy.contains('10000,00 €');
    cy.contains('899067250');
    cy.contains('FONTENAY-SOUS-BOIS');
    cy.contains('FRA');
    cy.contains('6 RUE PAUL LANGEVIN');
    cy.contains('94120');
    cy.contains('78090');

    cy.contains('Fonenantsoa');
    cy.contains('Maurica Andrianampoizinimaro');
    cy.contains('+33648492113');
  });
});
