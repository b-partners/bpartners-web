import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { v4 as uuid } from 'uuid';

import App from '@/App';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('can be updated', () => {
    cy.mount(<App />);

    cy.skipBankSynchronisation();

    cy.get('[name="customers"]').click();
    cy.contains('Andriamahery IT').click();

    const randomFirstName = 'it-' + uuid().substring(0, 7);
    cy.get('[name="firstName"]').clear().type(randomFirstName);

    cy.contains('Enregistrer').click();
    cy.contains(randomFirstName);
  });
});
