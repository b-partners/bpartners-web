const offsetX = 240;
const offsetY = 240;

const ANALYSE_TIME_LIMIT_MS = 120_000;

describe('Analyse Automatic Roof 1 duration', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('measures the analyse duration for 1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France', () => {
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

    cy.log('Check sidebar & area');
    cy.contains('Polygon A');
    cy.contains(/219\.\d{2} m²/);

    cy.log('Launch analyse and measure how long it takes to be done');
    cy.measure(
      'analyse',
      () => {
        cy.contains('Analyse').click();
        return cy.contains('Surface au sol', { timeout: ANALYSE_TIME_LIMIT_MS });
      },
      ANALYSE_TIME_LIMIT_MS
    );
  });
});
