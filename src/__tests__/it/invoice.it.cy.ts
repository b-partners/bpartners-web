import { v4 as uuid } from 'uuid';

const TIMEOUT = 30_000;
const SEARCH_BAR = '[data-testid="invoice-search-bar"] input';

/**
 * Whether the drafts answer that has just come back carries the draft, read off the response rather
 * than off the page: the row is rendered a tick later, and the list is judged here, not drawn.
 *
 * A draft the API does not list yet is asked for again through a reload, never by retyping the same
 * search: react-query answers an identical filter from its cache, so no second request would leave.
 */
const findDraft = (ref: string, attempts = 3): Cypress.Chainable<boolean> =>
  cy.wait('@searchDrafts', { timeout: TIMEOUT }).then(({ response }) => {
    if (JSON.stringify(response?.body ?? '').includes(ref)) return cy.wrap(true, { log: false });
    if (attempts <= 0) return cy.wrap(false, { log: false });
    cy.wait(2_000, { log: false });
    cy.reload();
    return findDraft(ref, attempts - 1);
  });

describe('Test invoice', () => {
  it('Create invoice from draft to paid', () => {
    const ref = 'it-' + uuid().substring(0, 7);
    const comment = `Test comment for ${ref}`;

    cy.intercept('GET', '**/accounts/*/invoicesSummary').as('getInvoicesSummary');
    // What the draft is saved through: nothing may look for it in a list before this has come back.
    cy.intercept('PUT', '**/invoices/*').as('saveInvoice');
    cy.intercept('GET', '**/invoices?*statusList=DRAFT*').as('getdrafts');
    cy.intercept('GET', `**/invoices?*filters=${ref}*`).as('searchDrafts');

    cy.e2eLogin();

    cy.get('[name="invoice"]').click();
    cy.wait('@getInvoicesSummary', { timeout: TIMEOUT });

    cy.contains('Devis');
    cy.contains('Factures payées');
    cy.contains('Factures en attente');
    cy.get('[data-testid="AddIcon"]').click();
    cy.get('[name="create-draft-invoice"]').click();

    cy.get('[data-testid="ref-field-input"] input').click().clear().type(ref);
    cy.get('[data-testid="sendingDate-field-input"] input').click().clear().type('2023-06-26');

    cy.get('[data-testid="autocomplete-backend-for-customer"] input').type('Maurica');
    cy.contains('Maurica Fonenantsoa').click(); // F. Maurica

    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('Un');
    cy.contains('Un euro symbolique').click(); // 1 €

    // test payment regulation comment
    cy.get('[data-testid="payment-regulation-checkbox-id"] > .PrivateSwitchBase-input').click();
    cy.get('[data-testid="invoice-Acompte-accordion"]').click();
    cy.get('#form-create-regulation-id').click();
    cy.get("input[name='comment']").clear().type(comment);
    cy.get('#form-regulation-save-id').click();

    cy.get('#form-save-id').click();
    cy.wait('@saveInvoice', { timeout: TIMEOUT }).its('response.statusCode').should('be.within', 200, 299);

    cy.contains('Devis').click();
    cy.contains('Factures').click();
    cy.contains('Brouillons').click();

    cy.wait('@getdrafts', { timeout: TIMEOUT });

    cy.get(SEARCH_BAR).clear().type(ref);
    findDraft(ref).should('eq', true);
    cy.contains(ref, { timeout: TIMEOUT }).click();

    cy.get('[data-testid="invoice-Acompte-accordion"]').click();
    // The acompte's comment, which the record kept: its row shows it cut to 23 characters.
    cy.contains(comment.slice(0, 23));

    cy.get('#form-save-id').click();
    cy.wait('@saveInvoice', { timeout: TIMEOUT }).its('response.statusCode').should('be.within', 200, 299);
  });
});
