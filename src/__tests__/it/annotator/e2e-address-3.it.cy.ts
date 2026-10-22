import { ADDRESS_3, delimitPans, expectModel, exportPdf, openGeoSession, openReport, renameFirstPan, runAnalyse, saveSession } from './geo-walk';

describe('Annotator E2E 3', () => {
  it(ADDRESS_3.address, () => {
    openGeoSession(ADDRESS_3);
    delimitPans(ADDRESS_3);
    expectModel();
    renameFirstPan('My pan 1');
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
