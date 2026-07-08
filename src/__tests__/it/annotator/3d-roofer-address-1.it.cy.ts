const offsetX = 240;
const offsetY = 240;

describe('3D Roofer Address 1', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France{enter}');
    cy.name('name').clear().type('Annotator It');
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.measure('get-image', () => {
      cy.contains("Générer l'image").click();
      return cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
    });
    cy.contains('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France');

    cy.log('Check sidebar & area');
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="délimiter"]').click();

    cy.log('Draw polygons');
    cy.dataCy('annotator-canvas-cursor').click(1445 + offsetX, 1220 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1404 + offsetX, 1355 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1394 + offsetX, 1428 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1405 + offsetX, 1456 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1488 + offsetX, 1483 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1605 + offsetX, 1496 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1623 + offsetX, 1422 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1605 + offsetX, 1415 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1655 + offsetX, 1373 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1673 + offsetX, 1293 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1575 + offsetX, 1249 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1445 + offsetX, 1220 + offsetY, { force: true });

    cy.log('Génération 3d');
    cy.contains('3D').click();
    cy.measure('3d-generation', () => {
      cy.contains('Génération du modèle 3D').click();
      return cy.contains('Pan 1', { timeout: 180_000 });
    });

    cy.log('Area of pan 1');
    cy.contains('Pan 1').click();
    cy.contains(/43\.\d{2} m²/);

    cy.log('Measurements of pan 1');
    cy.contains(/3\.\d{2} m/);
    cy.contains(/4\.\d{2} m/);
    cy.contains(/7\.\d{2} m/);

    cy.log('Change pan 1 details');
    cy.get('.roof-drawer-detail > .MuiStack-root > :nth-child(1)').click();
    cy.contains('Noue').click();
    cy.get('.selected > .MuiButtonBase-root').click();
    cy.get('.selected input').clear().type('My pan 1{enter}');

    cy.contains('Sauvegarder').click();
    cy.wait(2_000);

    cy.log('Export pdf');
    cy.intercept('POST', '**/annotations/exports').as('exportPdf');
    cy.contains('Exporter en PDF').click();
    cy.wait('@exportPdf', { timeout: 120_000 }).then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
