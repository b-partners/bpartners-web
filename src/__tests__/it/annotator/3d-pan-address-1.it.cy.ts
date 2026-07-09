const offsetX = 240;
const offsetY = 240;

describe('3D Roofer Address 1', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('2 Place Bellecour, 69002 Lyon', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('2 Place Bellecour, 69002 Lyon{enter}');
    cy.name('name').clear().type('Annotator It');
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.contains("Générer l'image").click();
    cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
    cy.contains('2 Place Bellecour, 69002 Lyon');

    cy.log('Check sidebar & area');
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="délimiter"]').click();

    cy.log('Draw pans');
    cy.contains('Pans').click();

    cy.log('Draw pan 1');
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(175 + offsetX, 1059 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });
    cy.wait(500);
    cy.realPress('Escape');

    cy.log('Draw pan 2');
    cy.wait(500);
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(529 + offsetX, 807 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.wait(500);
    cy.realPress('Escape');

    cy.log('Draw pan 3');
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(458 + offsetX, 974 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.wait(500);
    cy.realPress('Escape');

    cy.log('Draw pan 4');
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(250 + offsetX, 1056 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(216 + offsetX, 1079 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(175 + offsetX, 1059 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.wait(500);
    cy.realPress('Escape');

    cy.log('Génération 3d');
    cy.contains('3D').click({ force: true });
    cy.measure('3d-generation', () => {
      cy.contains('Génération du modèle 3D').click();
      return cy.contains('Pan 1', { timeout: 180_000 });
    });

    cy.log('Area of pan 1');
    cy.contains('Pan 1').click();
    cy.contains(/191\.\d{2} m²/);
    cy.contains(/157\.\d{2} m²/);
    cy.contains(/50\.\d{2} m²/);
    cy.contains(/63\.\d{2} m²/);

    cy.log('Measurements of pan 1');
    cy.contains(/23\.\d{2} m/);
    cy.contains(/11\.\d{2} m/);
    cy.contains(/15\.\d{2} m/);
    cy.contains(/10\.\d{2} m/);

    cy.get('.roof-drawer-detail > .MuiStack-root > :nth-child(1)').click();
    cy.contains('Solin').click();
    cy.get('.selected > .MuiButtonBase-root').click();
    cy.get('.selected input').clear().type('My pan 1{enter}');
    cy.log('Change pan 1 details');

    cy.contains('Sauvegarder').click();
    cy.wait(2_000);

    cy.log('Export pdf');
    cy.intercept('POST', '**/annotations/exports').as('exportPdf');
    cy.contains('Exporter en PDF').click();
    cy.wait('@exportPdf', { timeout: 120_000 }).then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
