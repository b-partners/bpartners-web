import { ADDRESS_2, delimitPans, expectModel, exportPdf, openGeoSession, renameFirstPan, saveSession } from './geo-walk';

describe('3D Roofer Address 2', () => {
  it(ADDRESS_2.address, () => {
    openGeoSession(ADDRESS_2);
    delimitPans(ADDRESS_2);
    expectModel();
    renameFirstPan('My pan 1');
    saveSession();
    exportPdf();
  });
});
