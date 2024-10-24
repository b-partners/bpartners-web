import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('is displayed on login', () => {
    cy.mount(<App />);

    cy.skipBankSynchronisation()

    cy.get('[name="account"]').click();

    cy.contains('NUMER');

    cy.contains('InformationAndCommunication');
    cy.contains('6000,00 €');
    cy.contains('10000,00 €');
    cy.contains('899067250');
    cy.contains('FONTENAY-SOUS-BOIS');
    cy.contains('FRA');
    cy.contains('6 RUE PAUL LANGEVIN');
    cy.contains('92002');
    cy.contains('78090');

    cy.contains('Fonenantsoa');
    cy.contains('Maurica Andrianampoizinimaro');
    cy.contains('+33648492113');
  });
});
