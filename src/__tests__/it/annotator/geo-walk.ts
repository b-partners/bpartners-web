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

/**
 * The export: its button only opens the dialog of sections, and the report itself is built in the
 * browser — nothing is posted any more — so the run is read off the notice it ends on.
 */
export const exportPdf = () => {
  cy.contains('button', 'Exporter en PDF').should('be.enabled').click();
  cy.contains('Contenu du rapport PDF');
  cy.measure('export-pdf', () => {
    cy.get('[data-testid="export-pdf-conf-confirm"]').should('be.enabled').click();
    return cy.contains(/Le rapport PDF a été généré/, { timeout: GENERATION_TIMEOUT }).should('be.visible');
  });
};

/** Every pan the model reports, read off its own row: `Pan n` and `<area> m² · <slope>°`. */
export const readPanRows = () =>
  cy.get('.geo-3d-list-item-meta').then($rows =>
    [...$rows].map(row => {
      const [area, slope] = (row.textContent ?? '').split('·').map(part => Number.parseFloat(part.replace(',', '.')));
      return { area, slope };
    })
  );

/**
 * What the model says about itself has to hold together: a pan per traced pan, every area and slope a
 * real number, the total the sum of the parts, and a measurable side on the pan that is open.
 */
export const expectConsistentMeasurements = (tracedPanCount: number) => {
  cy.get('.geo-3d-list-count').should('have.text', String(tracedPanCount));
  readPanRows().then(rows => {
    expect(rows, 'a row per traced pan').to.have.length(tracedPanCount);
    rows.forEach(({ area, slope }) => {
      expect(area, 'pan area in m²').to.be.greaterThan(0);
      expect(slope, 'pan slope in degrees').to.be.within(0, 90);
    });
    const total = rows.reduce((sum, { area }) => sum + area, 0);
    cy.contains('.geo-3d-list-total', /Surface totale/).then($total => {
      const shown = Number.parseFloat(($total.text().match(/([\d.]+) m²/) ?? [])[1]);
      expect(shown, 'the total is the sum of the pans').to.be.closeTo(total, 0.05 * rows.length);
    });
  });
  cy.get('.geo-3d-detail-stat-value')
    .eq(2)
    .then($sides => {
      const sides = Number.parseInt($sides.text(), 10);
      expect(sides, 'the open pan has sides').to.be.greaterThan(2);
      cy.get('.geo-3d-edge-row').should('have.length', sides);
    });
  cy.get('.geo-3d-edge-value')
    .not('.slope')
    .each($edge => expect(Number.parseFloat($edge.text()), 'edge length in m').to.be.greaterThan(0));
};

/** Types the first side of the open pan, which is the other thing the sidebar writes into the session. */
export const setFirstEdgeType = (label: string) => {
  cy.get('.geo-3d-edge-type').first().click();
  cy.get('.MuiMenuItem-root').contains(label).click();
  cy.get('.geo-3d-edge-type').first().should('contain', label);
};

/**
 * Drops everything the browser kept of this session and loads it again, so what comes back can only
 * have come from the record the save wrote.
 */
export const reopenFromBackend = () => {
  cy.window().then(window => {
    Object.keys(window.localStorage)
      .filter(key => key.startsWith('roof-analyser:geo:'))
      .forEach(key => window.localStorage.removeItem(key));
  });
  cy.reload();
  cy.contains('Pans de toit', { timeout: GENERATION_TIMEOUT });
};

export interface PdfSummary {
  name: string;
  bytes: number;
  isPdf: boolean;
  hasEof: boolean;
  pages: number;
  text: string;
}

/** The browser writes the file a moment after it says it has, so the look-up is given a few goes. */
const findDownloadedPdf = (params: { match: string; since: number }, attempts = 30): Cypress.Chainable<PdfSummary | null> =>
  cy.task<PdfSummary | null>('inspectPdfDownload', params, { timeout: 120_000 }).then(pdf => {
    if (pdf || attempts <= 0) return cy.wrap(pdf, { log: false });
    return cy.wait(1_000, { log: false }).then(() => findDownloadedPdf(params, attempts - 1));
  });

/**
 * The report that has just been downloaded, read as the file on disk rather than as a notice on
 * screen: whole between its two marks, and carrying the pages the session fed it.
 */
export const expectDownloadedPdf = ({ match, since, minPages }: { match: string; since: number; minPages: number }) =>
  findDownloadedPdf({ match, since }).should(pdf => {
    expect(pdf, `a report named after « ${match} » was downloaded`).not.to.equal(null);
    expect(pdf!.isPdf, `${pdf!.name} starts as a PDF`).to.equal(true);
    expect(pdf!.hasEof, `${pdf!.name} was written to its end`).to.equal(true);
    expect(pdf!.pages, `${pdf!.name} page count`).to.be.at.least(minPages);
    expect(pdf!.bytes, `${pdf!.name} size in bytes`).to.be.greaterThan(100_000);
    expect(pdf!.text, 'the report names the address it was run on').to.include(match);
    expect(pdf!.text, 'the report carries its wear score').to.match(/SCORE D.USURE/i);
    expect(pdf!.text, 'the report has a page per pan').to.match(/Pan [A-Z]\b[\s\S]{0,120}Surface/);
  });
