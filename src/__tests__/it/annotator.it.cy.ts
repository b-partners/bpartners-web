describe('Account', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('Annotator E2E', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France{enter}');
    cy.name('name').clear().type('Annotator It');
    cy.contains("Générer l'image").click();
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');

    cy.wait(60000);
    cy.contains('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France');
  });
});
