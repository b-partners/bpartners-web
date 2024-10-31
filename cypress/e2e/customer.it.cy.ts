import { v4 as uuid } from 'uuid';

describe('Customers', () => {
  it('can be updated', () => {
    cy.e2eLogin();

    cy.get('[name="customers"]').click();
    cy.contains('Andriamahery IT').click();

    const randomFirstName = 'it-' + uuid().substring(0, 7);
    cy.get('[name="firstName"]').clear().type(randomFirstName);

    cy.contains('Enregistrer').click();
    cy.contains(randomFirstName);
  });
});
