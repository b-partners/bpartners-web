import { ADDRESS_2, delimitPans, exportPdf, openGeoSession, openReport, runAnalyse, saveSession } from './geo-walk';

describe('Analyse Automatic Roof 2', () => {
  it(ADDRESS_2.address, () => {
    openGeoSession(ADDRESS_2);
    delimitPans(ADDRESS_2);
    runAnalyse();
    openReport();
    saveSession();
    exportPdf();
  });
});
