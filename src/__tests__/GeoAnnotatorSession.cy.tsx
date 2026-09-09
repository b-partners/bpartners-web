import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

const SESSION_ID = '7c1b2f5e-9a3d-4c8e-9f21-6d4a8b0e5c33';
const ADDRESS = '10 rue de Rivoli, Paris';

const openSession = (search: string) => {
  cy.window().then(window => window.history.pushState({}, '', `/projects/${SESSION_ID}${search}`));
  cy.mount(<App />);
};

describe('Annotator — session lon/lat de la librairie', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder');

    cy.intercept('GET', '/api/keys', [{ id: 'api-key', apiKey: 'dummy-api-key' }]).as('apiKey');

    cy.intercept('GET', '**/geocode?address=*', { score: 0, longitude: 2.3595545, latitude: 48.8552353 }).as('geocode');
    cy.intercept('GET', '**/areaPictureMapLayers/availability*', {
      wmsBaseUrl: 'https://geoserver.birdia.fr/geoserver/cite/wms',
      actualLayer: { id: 'paris', name: 'PARIS', year: 2025, precisionLevelInCm: 5 },
      availableLayers: [],
    }).as('wmsLayers');
    cy.intercept('GET', 'https://geoserver.birdia.fr/**', { statusCode: 200, body: '' }).as('wmsTile');

    cy.intercept('PUT', '/accounts/**/areaPictures/**', {}).as('saveRecord');
    cy.intercept('GET', '/accounts/**/areaPictures/**', {}).as('readRecord');
  });

  it('géocode l’adresse puis ouvre la carte Leaflet sur la position', () => {
    openSession(`?flow=geo&address=${encodeURIComponent(ADDRESS)}`);

    cy.wait('@geocode');
    cy.wait('@wmsLayers').its('request.url').should('include', 'lat=48.8552353').and('include', 'lon=2.3595545');
    cy.get('.leaflet-container', { timeout: 30000 }).should('exist');
  });
});
