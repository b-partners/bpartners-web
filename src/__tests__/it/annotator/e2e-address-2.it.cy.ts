const offsetX = 240;
const offsetY = 240;

describe('Annotator E2E 2', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('46.679859, 2.637623', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('46.679859, 2.637623{enter}');
    cy.name('name').clear().type('Annotator It');
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.measure('get-image', () => {
      cy.contains("Générer l'image").click();
      return cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
    });
    cy.contains('46.679859, 2.637623');

    cy.log('Check sidebar & area');
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="délimiter"]').click();

    cy.log('Draw polygons');
    cy.dataCy('annotator-canvas-cursor').click(1471 + offsetX, 1115 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1609 + offsetX, 1312 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1645 + offsetX, 1295 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1681 + offsetX, 1262 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1544 + offsetX, 1064 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1509 + offsetX, 1097 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(1471 + offsetX, 1115 + offsetY, { force: true });

    cy.log('Check sidebar & area');
    cy.contains('Polygon A');
    cy.contains(/84\.\d{2} m²/);

    cy.log('Check measurements');
    cy.contains('3.00m');
    cy.contains('2.60m');
    cy.contains('15.20m');

    cy.log('Launch analyse');
    cy.contains('Analyse').click();
    cy.contains('Surface au sol', { timeout: 180_000 });

    cy.log('Analyse sidebar');
    cy.contains(/84\.\d{2} m²/);
    cy.contains('Chargement de la hauteur du bâtiment');

    cy.wait(60_000);

    cy.log('Check slope/height info');
    cy.contains(/La pente et la hauteur du bâtiment ne sont pas encore disponibles\.|Hauteur du bâtiment/, { timeout: 320_000 });

    cy.get('[data-testid="pente"] input').clear().type('10').blur();
    cy.contains('Chargement de la surface sélectionnée...');
    cy.wait(5_000);
    cy.contains('Surface rampante');

    cy.log('Génération 3d');
    cy.contains('3D').click();
    cy.contains('Génération du modèle 3D').click();
    cy.contains('Pan 1', { timeout: 180_000 });

    cy.log('Area of pan 1');
    cy.contains('Pan 1').click();

    cy.log('Measurements of pan 1');
    cy.contains(/(0|1)\.\d{2} m/);
    cy.contains(/3\.\d{2} m/);
    cy.contains(/(14|15)\.\d{2} m/);

    cy.log('Change pan 1 details');
    cy.get('.roof-drawer-detail > .MuiStack-root > :nth-child(1)').click();
    cy.contains('Noue').click();
    cy.get('.selected > .MuiButtonBase-root').click();
    cy.get('.selected input').clear().type('My pan 1{enter}');

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
