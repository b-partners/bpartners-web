import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

const SESSION_ID = '7c1b2f5e-9a3d-4c8e-9f21-6d4a8b0e5c33';
const ADDRESS = '10 rue de Rivoli, Paris';
const PARIS_LAYER = { id: 'paris', name: 'PARIS', year: 2025, precisionLevelInCm: 5 };
const SECURE_LINK_TOKEN = { value: 'secure-link-value', expiresAtEpochSecond: 4102444800 };
// the cells are read off REACT_APP_WMS_TILE_BASE_URL, the dev server's own /wms-proxy only when it is blank
const WMS_TILE_BASE_URL = (process.env.REACT_APP_WMS_TILE_BASE_URL || '').trim() || '/wms-proxy';
const WMS_TILE = new RegExp(`${WMS_TILE_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?`);

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
    cy.intercept('GET', '**/map/layers/actual?*', { layer: PARIS_LAYER, secureLinkToken: SECURE_LINK_TOKEN }).as('activeLayer');
    cy.intercept('GET', '**/map/layers?*', {
      secureLinkToken: SECURE_LINK_TOKEN,
      layers: [
        { layer: PARIS_LAYER, reachable: true },
        { layer: { id: 'ssd', name: 'Seine-Saint-Denis-Paris', year: 2023, precisionLevelInCm: 5 }, reachable: false },
      ],
    }).as('allLayers');
    cy.intercept('GET', WMS_TILE, { fixture: 'test-annotator-image.jpeg', headers: { 'content-type': 'image/jpeg' } }).as('wmsTile');

    cy.intercept('PUT', '/accounts/**/areaPictures/**', {}).as('saveRecord');
    cy.intercept('GET', '/accounts/**/areaPictures/**', {}).as('readRecord');
  });

  it('géocode l’adresse puis ouvre la carte sur la couche active', () => {
    openSession(`?flow=geo&address=${encodeURIComponent(ADDRESS)}`);

    cy.wait('@geocode');
    cy.wait('@activeLayer').then(({ request }) => {
      expect(request.url).to.include('lat=48.8552353').and.to.include('lon=2.3595545');
      expect(request.headers.authorization).to.match(/^Bearer .+/);
    });
    cy.get('.geo-pans-stage', { timeout: 30000 }).should('exist');
    cy.get('.geo-topbar-layer-name').should('contain.text', PARIS_LAYER.name);
    cy.wait('@wmsTile')
      .its('request.url')
      .should('include', 'layers=PARIS')
      .and('include', 'token=secure-link-value')
      .and('include', `expires=${SECURE_LINK_TOKEN.expiresAtEpochSecond}`);
    cy.wait('@allLayers');
  });

  // the library reports the refusal with its own wording, the resolver's own message never reaches the screen
  it('signale une imagerie refusée au lieu d’afficher une carte vide', () => {
    cy.intercept('GET', '**/geocode?address=*', { score: 0, longitude: 5.3698, latitude: 43.2965 }).as('geocode');
    cy.intercept('GET', WMS_TILE, { statusCode: 401, body: '' }).as('refusedTile');

    openSession(`?flow=geo&address=${encodeURIComponent('1 rue de la République, Marseille')}`);

    cy.wait('@refusedTile');
    cy.get('.geo-error-title', { timeout: 30000 }).should('be.visible');
    cy.get('.geo-error-message').should('contain.text', 'la photo aérienne');
    cy.get('.geo-pans-stage').should('not.exist');
  });
});
