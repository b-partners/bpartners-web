/*
  The steps every annotator IT walks, in the order the lon/lat flow walks them:

    home → session → délimiter les pans → aligner les lignes → modèle 3D → analyse → rapport → PDF

  Only the two steps that are a drawing — the pans and the alignment — are not played from here: they
  come off `cypress/fixtures/annotator/*.json`, recorded once by hand in `npm run cy:open`.
*/

export interface GeoPlace {
  /** The fixture its pans are recorded in, and the folder names the monitoring workflows use. */
  key: string;
  address: string;
}

export const ADDRESS_1: GeoPlace = { key: 'address-1', address: '1 Rue de la Vau Saint-Jacques, 79200 Parthenay, France' };
export const ADDRESS_2: GeoPlace = { key: 'address-2', address: '46.679859, 2.637623' };
export const ADDRESS_3: GeoPlace = { key: 'address-3', address: '2 Place Bellecour, 69002 Lyon' };

const PROSPECT_NAME = 'Annotator It';

/**
 * The library's own onboarding guide, a modal over the very screens the walk works on — and its button
 * is labelled "Suivant" too. Turned off the way the viewer turns it off, before any session is opened.
 */
const GUIDE_DISMISSED_KEY = 'roof-analyser:onboarding:dismissed';
const dismissGuides = () => cy.window().then(window => window.localStorage.setItem(GUIDE_DISMISSED_KEY, JSON.stringify(['trace', 'texture'])));

const SESSION_TIMEOUT = 300_000;
const GENERATION_TIMEOUT = 300_000;

/** Signs in, asks for the imagery of `address` and lands on the session's own screen. */
export const openGeoSession = ({ address }: GeoPlace) => {
  cy.e2eLogin();
  cy.get('[data-testid="address-auto-complete"] input', { timeout: 60_000 }).clear().type(`${address}{enter}`);
  dismissGuides();
  cy.name('name').clear().type(PROSPECT_NAME);
  cy.measure('get-image', () => {
    cy.contains("Générer l'image").click();
    return cy.location('pathname', { timeout: SESSION_TIMEOUT }).should('match', /^\/projects\//);
  });
};

/** The tracing step: the pans of `place` on the aerial photo, then on to what follows them. */
export const delimitPans = (place: GeoPlace) => {
  cy.get('[data-testid="geo-pan-delimit"]', { timeout: SESSION_TIMEOUT }).should('be.visible');
  cy.contains('Aucun pan tracé.');
  return cy.geoDrawPans(place.key).then(({ pans, replayed }) => {
    if (pans.length > 1) cy.geoAlignLines(replayed);
    return cy.wrap(pans, { log: false });
  });
};

/**
 * Waits on the model the traced pans are generated into, and opens the first pan's own card. The
 * selection toggles, so the pan is left selected here rather than clicked again further down.
 */
export const expectModel = () => {
  cy.measure('3d-generation', () => {
    cy.contains('Pans de toit', { timeout: GENERATION_TIMEOUT });
    return cy.contains('.geo-3d-list-item-name', 'Pan 1', { timeout: GENERATION_TIMEOUT });
  });
  cy.contains('Surface totale :');
  cy.contains('.geo-3d-list-item-name', 'Pan 1').click();
  cy.get('.geo-3d-detail-title').should('have.text', 'Pan 1');
  cy.contains('.geo-3d-detail-stat-label', 'Surface');
  cy.contains('.geo-3d-detail-stat-label', 'Pente');
  cy.contains('.geo-3d-detail-stat-value', /\d+\.\d{2} m²/);
};

/** Renames the first pan through its own pencil, which is what proves the model's records are writable. */
export const renameFirstPan = (name: string) => {
  cy.get('[aria-label="Renommer Pan 1"]').click();
  cy.get('.geo-3d-list-item-input input').clear().type(`${name}{enter}`);
  cy.contains('.geo-3d-list-item-name', name);
  cy.get('.geo-3d-detail-title').should('have.text', name);
};

/** The analyse screen: the emprise deduced from the pans, then the detection run on it. */
export const runAnalyse = () => {
  cy.contains('button', 'Analyse').click();
  cy.measure('analyse', () => {
    cy.contains("Lancer l'analyse", { timeout: GENERATION_TIMEOUT }).should('be.enabled').click();
    return cy.contains('Zones analysées', { timeout: GENERATION_TIMEOUT });
  });
  cy.contains('Analyse de la toiture en cours…').should('not.exist');
};

/** The written report the analysis feeds. */
export const openReport = () => {
  cy.contains('button', 'Rapport', { timeout: GENERATION_TIMEOUT }).should('be.enabled').click();
  cy.measure('report', () => cy.get('.geo-report-scroll', { timeout: GENERATION_TIMEOUT }).should('be.visible'));
};

export const saveSession = () => {
  cy.contains('button', 'Enregistrer').click();
  cy.contains('button', 'Enregistrer').should('be.enabled');
};

export const exportPdf = () => {
  cy.intercept('POST', '**/annotations/exports').as('exportPdf');
  cy.contains('button', 'Exporter en PDF').should('be.enabled').click();
  cy.measure('export-pdf', () => cy.wait('@exportPdf', { timeout: GENERATION_TIMEOUT }).then(({ response }) => expect(response?.statusCode).to.equal(200)));
};
