import { ADDRESS_2, delimitPans, expectModel, exportPdf, openGeoSession, openReport, renameFirstPan, runAnalyse, saveSession } from './geo-walk';

describe('Annotator E2E 2', () => {
  it(ADDRESS_2.address, () => {
    openGeoSession(ADDRESS_2);
    delimitPans(ADDRESS_2);
    expectModel();
    renameFirstPan('My pan 1');
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
