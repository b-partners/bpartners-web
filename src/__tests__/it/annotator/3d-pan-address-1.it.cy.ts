import { ADDRESS_3, delimitPans, expectModel, exportPdf, openGeoSession, renameFirstPan, saveSession } from './geo-walk';

describe('3D Pan Address 1', () => {
  it(ADDRESS_3.address, () => {
    openGeoSession(ADDRESS_3);
    delimitPans(ADDRESS_3);
    expectModel();
    renameFirstPan('My pan 1');
    saveSession();
    exportPdf();
  });
});
