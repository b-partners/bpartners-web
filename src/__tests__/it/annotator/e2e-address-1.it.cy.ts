import { ADDRESS_1, delimitPans, expectModel, exportPdf, openGeoSession, openReport, renameFirstPan, runAnalyse, saveSession } from './geo-walk';

describe('Annotator E2E 1', () => {
  it(ADDRESS_1.address, () => {
    openGeoSession(ADDRESS_1);
    delimitPans(ADDRESS_1);
    expectModel();
    renameFirstPan('My pan 1');
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
