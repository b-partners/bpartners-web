import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { v4 as uuid } from 'uuid';

import App from '../../App';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('is created from draft to confirmed', () => {
    mount(<App />);

    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="AddIcon"]').click();
    cy.get('[name="create-draft-invoice"]').click();

    const ref = 'it-' + uuid().substring(0, 7);
    const comment = `Test comment for ${ref}`;
    cy.get('[data-testid="ref-field-input"]').click().clear().type(ref);
    cy.get('[data-testid="sendingDate-field-input"]').click().clear().type('2023-06-26');

    cy.get('[data-testid="invoice-client-selection"] input').type('Maurica');
    cy.contains('Maurica Fonenantsoa').click(); // F. Maurica

    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('Un euro symbolique');
    cy.contains('Un euro symbolique').click(); // 1 €

    cy.contains('Bon pour accord');

    cy.intercept('GET', '/accounts/7efea565-bc2b-463f-b219-ef695c4acdc8/invoices?page=1&pageSize=15&status=DRAFT').as('getdrafts');

    // test payment regulation comment
    cy.get('[data-testid="payment-regulation-checkbox-id"] > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="invoice-Acompte-accordion"]').click();
    cy.get('#form-create-regulation-id').click();
    cy.get("input[name='comment']").clear().type(comment);
    cy.get('#form-regulation-save-id').click();
    cy.contains(comment);

    cy.get('#form-save-id').click();

    const timeout = 10_000;
    cy.wait('@getdrafts', { timeout: timeout });

    cy.contains(ref).click();
    cy.get('[data-testid="invoice-Acompte-accordion"]').click();
    cy.get(':nth-child(1) > .MuiPaper-root > .MuiCardActions-root > .MuiBox-root > :nth-child(1)').click();
    cy.contains(comment);

    cy.get('#form-save-id').click();

    cy.wait('@getdrafts', { timeout: timeout });

    cy.intercept('GET', '/accounts/7efea565-bc2b-463f-b219-ef695c4acdc8/invoices?page=1&pageSize=15&status=PROPOSAL').as('getproposals');
    cy.get(`[data-testid="invoice-conversion-PROPOSAL-BROUILLON-${ref}"]`).click();
    cy.contains('Brouillon transformé en devis', { timeout: timeout });

    cy.wait('@getproposals', { timeout: timeout });
    cy.get(`[data-testid="invoice-conversion-CONFIRMED-DEVIS-${ref}"]`).click();
    cy.contains('Devis confirmé', { timeout: timeout });

    cy.get(`[data-testid="invoice-conversion-PAID-${ref}-1"]`).click();
    cy.get(`[data-testid="invoice-conversion-PAID-${ref}"]`).click();
    cy.contains('Facture payée', { timeout: timeout });
  });
});
