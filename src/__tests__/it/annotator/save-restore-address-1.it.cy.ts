import {
  ADDRESS_1,
  delimitPans,
  expectConsistentMeasurements,
  expectModel,
  openGeoSession,
  renameFirstPan,
  reopenFromBackend,
  saveSession,
  setFirstEdgeType,
} from './geo-walk';

const PAN_NAME = 'Pan sauvegardé';
const EDGE_TYPE = 'Noue';

describe('Annotator save and restore 1', () => {
  it(ADDRESS_1.address, () => {
    openGeoSession(ADDRESS_1);
    delimitPans(ADDRESS_1).then(pans => {
      expectModel();

      cy.log('Le modèle se tient debout tout seul');
      expectConsistentMeasurements(pans.length);

      cy.log('On écrit dans la barre latérale');
      renameFirstPan(PAN_NAME);
      setFirstEdgeType(EDGE_TYPE);
      saveSession();

      cy.log('On rouvre la session depuis son enregistrement');
      reopenFromBackend();

      cy.contains('.geo-3d-list-item-name', PAN_NAME);
      cy.contains('.geo-3d-list-item-name', PAN_NAME).click();
      cy.get('.geo-3d-detail-title').should('have.text', PAN_NAME);
      cy.get('.geo-3d-edge-type').first().should('contain', EDGE_TYPE);
      expectConsistentMeasurements(pans.length);
    });
  });
});
