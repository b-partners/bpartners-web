const offsetX = 240;
const offsetY = 240;

describe('Annotator E2E 2', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('3D on 2 Place Bellecour, 69002 Lyon', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('3D on 2 Place Bellecour, 69002 Lyon{enter}');
    cy.name('name').clear().type('Annotator It');
    cy.contains("Générer l'image").click();
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.wait(20000);

    cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
    cy.contains('3D on 2 Place Bellecour, 69002 Lyon');

    cy.log('Check sidebar & area');
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="Zoom +"]').click();
    cy.get('[aria-label="délimiter"]').click();

    cy.log('Draw polygons');
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(529 + offsetX, 807 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(458 + offsetX, 974 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(250 + offsetX, 1056 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(297 + offsetX, 1075 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(284 + offsetX, 1108 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });

    cy.log('Draw pans');
    cy.contains('Pans').click();

    cy.log('Draw pan 1');
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(175 + offsetX, 1059 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(36 + offsetX, 993 + offsetY, { force: true });

    cy.log('Draw pan 2');
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(529 + offsetX, 807 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(197 + offsetX, 669 + offsetY, { force: true });

    cy.log('Draw pan 3');
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(458 + offsetX, 974 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(482 + offsetX, 919 + offsetY, { force: true });

    cy.log('Draw pan 4');
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(250 + offsetX, 1056 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(216 + offsetX, 1079 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(175 + offsetX, 1059 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(272 + offsetX, 833 + offsetY, { force: true });
    cy.dataCy('annotator-canvas-cursor').click(313 + offsetX, 912 + offsetY, { force: true });

    // cy.log('Check sidebar & area');
    // cy.contains('Polygon A');
    // cy.contains(/84\.\d{2} m²/);

    // cy.log('Check measurements');
    // cy.contains('3.00m');
    // cy.contains('2.60m');
    // cy.contains('15.20m');

    // cy.log('Launch analyse');
    // cy.contains('Analyse').click();
    // cy.wait(60_000);

    // cy.log('Analyse sidebar');
    // cy.contains('Surface au sol');
    // cy.contains(/84\.\d{2} m²/);
    // cy.contains('Chargement de la hauteur du bâtiment');

    // cy.wait(60_000);

    // cy.log('Check slope/height info');
    // cy.contains(/La pente et la hauteur du bâtiment ne sont pas encore disponibles\.|Hauteur du bâtiment/, { timeout: 320_000 });

    // cy.get('[data-testid="pente"] input').clear().type('10').blur();
    // cy.contains('Chargement de la surface sélectionnée...');
    // cy.wait(5_000);
    // cy.contains('Surface rampante');

    // cy.log('Génération 3d');
    // cy.contains('3D').click();
    // cy.contains('Génération du modèle 3D').click();
    // cy.wait(60_000);

    // cy.log('Area of pan 1');
    // cy.contains('Pan 1', { timeout: 120_000 }).click();

    // cy.log('Measurements of pan 1');
    // cy.contains(/(0|1)\.\d{2} m/);
    // cy.contains(/3\.\d{2} m/);
    // cy.contains(/(14|15)\.\d{2} m/);

    // cy.log('Change pan 1 details');
    // cy.get('.roof-drawer-detail > .MuiStack-root > :nth-child(1)').click();
    // cy.contains('Noue').click();
    // cy.get('.selected > .MuiButtonBase-root').click();
    // cy.get('.selected input').clear().type('My pan 1{enter}');

    // cy.log('Save changes');
    // cy.contains('Sauvegarder').click();
    // cy.wait(2_000);

    // cy.contains('Rapport').click();

    // cy.wait(10_000);
    // cy.contains('COMPRENDRE VOTRE RAPPORT');

    // cy.contains('Sauvegarder').click();
    // cy.wait(2_000);

    // cy.log('Export pdf');
    // cy.intercept('POST', '**/annotations/exports').as('exportPdf');
    // cy.contains('Exporter en PDF').click();
    // cy.wait('@exportPdf', { timeout: 120_000 }).then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
