import { ADDRESS_1, delimitPans, expectModel, exportPdf, openGeoSession, renameFirstPan, saveSession } from './geo-walk';

describe('3D Roofer Address 1', () => {
  it(ADDRESS_1.address, () => {
    openGeoSession(ADDRESS_1);
    delimitPans(ADDRESS_1);
    expectModel();
    renameFirstPan('My pan 1');
    saveSession();
    exportPdf();
  });
});
