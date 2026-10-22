import { ADDRESS_3, delimitPans, exportPdf, openGeoSession, openReport, runAnalyse, saveSession } from './geo-walk';

describe('Analyse Automatic Roof 3', () => {
  it(ADDRESS_3.address, () => {
    openGeoSession(ADDRESS_3);
    delimitPans(ADDRESS_3);
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
