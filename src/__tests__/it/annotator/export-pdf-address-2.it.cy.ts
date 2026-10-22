import { ADDRESS_2, delimitPans, expectDownloadedPdf, expectModel, exportPdf, openGeoSession, openReport, runAnalyse, saveSession } from './geo-walk';

/** Plan, analysed zones, the written report and the model's own pages: a whole report runs well past this. */
const MIN_PAGES = 4;

describe('Annotator PDF export 2', () => {
  it(ADDRESS_2.address, () => {
    const startedAt = Date.now();

    openGeoSession(ADDRESS_2);
    delimitPans(ADDRESS_2);
    expectModel();
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();

    cy.log('Le fichier téléchargé est un rapport entier');
    expectDownloadedPdf({ match: ADDRESS_2.address, since: startedAt, minPages: MIN_PAGES });
  });
});
