import { ADDRESS_1, delimitPans, exportPdf, openGeoSession, openReport, runAnalyse, saveSession } from './geo-walk';

describe('Analyse Automatic Roof 1', () => {
  it(ADDRESS_1.address, () => {
    openGeoSession(ADDRESS_1);
    delimitPans(ADDRESS_1);
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
