const offsetX = 240;
const offsetY = 240;

describe('3D Roofer Address 2', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
  });

  it('46.679859, 2.637623', () => {
    cy.visit('https://dashboard.birdia.fr');
    cy.get('[data-testid="address-auto-complete"] input').clear().type('46.679859, 2.637623{enter}');
    cy.name('name').clear().type('Annotator It');
    // Do not show the tutorial
    localStorage.setItem('bp_annotator_tutorial_seen', 'true');
    cy.contains("Générer l'image").click();
    cy.contains("Aucune annotation n'a encore été effectuée.", { timeout: 180_000 });
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

    cy.log('Génération 3d');
    cy.contains('3D').click();
    cy.measure('3d-generation', () => {
      cy.contains('Génération du modèle 3D').click();
      return cy.contains('Pan 1', { timeout: 180_000 });
    });

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

    cy.contains('Sauvegarder').click();
    cy.wait(2_000);

    cy.log('Export pdf');
    cy.intercept('POST', '**/annotations/exports').as('exportPdf');
    cy.contains('Exporter en PDF').click();
    cy.wait('@exportPdf', { timeout: 120_000 }).then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
