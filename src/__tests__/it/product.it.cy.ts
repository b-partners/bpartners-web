describe('Products', () => {
  it('are displayed', () => {
    cy.e2eLogin();

    cy.get('[name="products"]').click();
    cy.contains('Un euro symbolique');
    cy.contains('Un micro-conseil');
    cy.contains('1,00 €');

    cy.intercept('GET', '**/products?*descriptionFilter=*').as('filter');

    cy.name('descriptionFilter').type('complexe');
    cy.name('priceFilter').type('7.91');

    // Each keystroke can send its own debounced request, so the settled one is the last to arrive.
    cy.get('@filter.all').should(calls => {
      const { query } = calls[calls.length - 1].request;
      expect(query.descriptionFilter).to.eq('complexe');
      expect(query.priceFilter).to.eq('791');
    });

    cy.contains('Un produit avec un prix complexe').click();
    cy.contains('Archiver');
  });
});
