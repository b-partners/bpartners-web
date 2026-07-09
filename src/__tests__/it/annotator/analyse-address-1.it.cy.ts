const offsetX = 240;
const offsetY = 240;

describe('Analyse Automatic Roof 1', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France{enter}');
    cy.name('name').clear().type('Annotator It');
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.contains("Générer l'image").click();
    cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
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

    cy.log('Check sidebar & area');
    cy.contains('Polygon A');
    cy.contains(/219\.\d{2} m²/);

    cy.log('Check measurements');
    cy.contains('8.40m');
    cy.contains('9.00m');
    cy.contains('4.60m');
    cy.contains('2.00m');
    cy.contains('5.60m');
    cy.contains('7.40m');
    cy.contains('4.80m');
    cy.contains('1.20m');
    cy.contains('4.20m');
    cy.contains('5.20m');
    cy.contains('6.80m');

    cy.log('Launch analyse');
    cy.measure('analyse', () => {
      cy.contains('Analyse').click();
      return cy.contains('Surface au sol', { timeout: 180_000 });
    });

    cy.log('Analyse sidebar');
    cy.contains(/219\.\d{2} m²/);
    cy.contains('Chargement de la hauteur du bâtiment');

    cy.wait(60_000);

    cy.log('Check slope/height info');
    cy.contains(/La pente et la hauteur du bâtiment ne sont pas encore disponibles\.|Hauteur du bâtiment/, { timeout: 120_000 });

    cy.get('[data-testid="pente"] input').clear().type('10').blur();
    cy.contains('Chargement de la surface sélectionnée...');
    cy.wait(5_000);
    cy.contains('Surface rampante');

    cy.log('Save changes');
    cy.contains('Sauvegarder').click();
    cy.wait(2_000);

    cy.contains('Rapport').click();

    cy.wait(10_000);
    cy.contains('COMPRENDRE VOTRE RAPPORT');

    cy.contains('Sauvegarder').click();
    cy.wait(2_000);

    cy.log('Export pdf');
    cy.intercept('POST', '**/annotations/exports').as('exportPdf');
    cy.contains('Exporter en PDF').click();
    cy.wait('@exportPdf', { timeout: 120_000 }).then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
