import App from '@/App';
import { accountHolders1, accounts1, whoami1 } from './mocks/responses';

const SESSION_ID = '7c1b2f5e-9a3d-4c8e-9f21-6d4a8b0e5c33';
const PARIS_LAYER = { id: 'paris', name: 'PARIS', year: 2025, precisionLevelInCm: 5 };
const SECURE_LINK_TOKEN = { value: 'secure-link-value', expiresAtEpochSecond: 4102444800 };
// The library's whole credential since 0.17.0: the session token cy.cognitoLogin() caches under
// bp_access_token. Every call it makes carries it, the records as much as every bridge.
const SESSION_BEARER = 'Bearer dummy';

/**
 * The library holds its react-query client at module scope and caches the resolved layers and every
 * imagery cell on `staleTime: Infinity`, keyed by the position. One position per test is what keeps each
 * one asking for its own imagery instead of reading the previous test's answers out of that cache.
 */
const PLACES = {
  paris: { address: '10 rue de Rivoli, Paris', latitude: 48.8552353, longitude: 2.3595545 },
  lyon: { address: '5 place Bellecour, Lyon', latitude: 45.7578137, longitude: 4.8320114 },
  marseille: { address: '1 rue de la République, Marseille', latitude: 43.2965, longitude: 5.3698 },
  bordeaux: { address: '2 place de la Bourse, Bordeaux', latitude: 44.8411, longitude: -0.5697 },
};

type Place = (typeof PLACES)[keyof typeof PLACES];

const openSession = ({ address, latitude, longitude }: Place) => {
  cy.intercept('GET', '**/geodata/geocode?address=*', { score: 0, latitude, longitude }).as('geocode');
  cy.window().then(window => window.history.pushState({}, '', `/projects/${SESSION_ID}?flow=geo&address=${encodeURIComponent(address)}`));
  cy.mount(<App />);
};

describe('Annotator — session lon/lat de la librairie', () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder');

    cy.intercept('GET', `/users/${whoami1.user.id}/analysisProjects/${SESSION_ID}`, { projectKey: SESSION_ID, creditsSufficient: true, creditCost: 1 }).as(
      'getAnalysisProject'
    );

    // Every one of these is the Dashboard API's own (REACT_APP_BPARTNERS_API_URL): the geocoder and the
    // imagery are bridges on it now, not a GeoData lambda on an x-api-key and a GeoServer behind a proxy.
    cy.intercept('GET', '**/map/layers/actual?*', { layer: PARIS_LAYER, secureLinkToken: SECURE_LINK_TOKEN }).as('activeLayer');
    cy.intercept('GET', '**/map/layers?*', {
      secureLinkToken: SECURE_LINK_TOKEN,
      layers: [
        { layer: PARIS_LAYER, reachable: true },
        { layer: { id: 'ssd', name: 'Seine-Saint-Denis-Paris', year: 2023, precisionLevelInCm: 5 }, reachable: false },
      ],
    }).as('allLayers');
    cy.intercept('GET', '**/geoserver/wms?*', { fixture: 'test-annotator-image.jpeg', headers: { 'content-type': 'image/jpeg' } }).as('wmsTile');

    cy.intercept('PUT', '/accounts/**/areaPictures/**', {}).as('saveRecord');
    cy.intercept('GET', '/accounts/**/areaPictures/**', {}).as('readRecord');
  });

  it('géocode l’adresse sur le jeton de session puis ouvre la carte sur la couche active', () => {
    const place = PLACES.paris;
    openSession(place);

    cy.wait('@geocode').then(({ request }) => {
      expect(request.url).to.include(`address=${encodeURIComponent(place.address)}`);
      expect(request.headers.authorization).to.equal(SESSION_BEARER);
    });
    cy.wait('@activeLayer').then(({ request }) => {
      expect(request.url).to.include(`lat=${place.latitude}`).and.to.include(`lon=${place.longitude}`);
      expect(request.headers.authorization).to.equal(SESSION_BEARER);
    });
    cy.get('.geo-pans-stage', { timeout: 30000 }).should('exist');
    cy.get('.geo-topbar-layer-name').should('contain.text', PARIS_LAYER.name);
    cy.wait('@allLayers');
  });

  // The cells come off the Dashboard API's GetMap bridge, carrying the session token in a header — which an
  // <img> cannot send, so the library fetches each one itself. There is no proxy and no wmsBaseUrl left to
  // configure; the secure link still rides along as token/expires.
  it('lit les tuiles sur le bridge /geoserver/wms, signées par le jeton de session', () => {
    openSession(PLACES.lyon);

    cy.wait('@wmsTile', { timeout: 30000 }).then(({ request }) => {
      expect(request.url)
        .to.include('/geoserver/wms?')
        .and.to.include('layers=PARIS')
        .and.to.include('token=secure-link-value')
        .and.to.include(`expires=${SECURE_LINK_TOKEN.expiresAtEpochSecond}`);
      expect(request.headers.authorization).to.equal(SESSION_BEARER);
    });
    cy.get('.geo-pans-stage', { timeout: 30000 }).should('exist');
  });

  // No imagery resolves at all, so the library has no layer to open the map on: it reports that instead of
  // mounting an empty stage.
  it('signale une imagerie introuvable au lieu d’afficher une carte vide', () => {
    cy.intercept('GET', '**/map/layers/actual?*', { statusCode: 401, body: '' }).as('activeLayer');
    cy.intercept('GET', '**/map/layers?*', { statusCode: 401, body: '' }).as('allLayers');

    openSession(PLACES.marseille);

    cy.get('.geo-error-title', { timeout: 30000 }).should('be.visible');
    cy.get('.geo-error-message').should('contain.text', 'la photo aérienne');
    cy.get('.geo-pans-stage').should('not.exist');
  });

  // The layer resolves but its cells are refused: the library says so over the delimitation stage rather
  // than leaving the photo's spinner turning. Its own wording — this app has no imagery message left.
  it('signale une tuile refusée au-dessus de l’étape de délimitation', () => {
    cy.intercept('GET', '**/geoserver/wms?*', { statusCode: 401, body: '' }).as('refusedTile');

    openSession(PLACES.bordeaux);

    cy.wait('@refusedTile', { timeout: 30000 });
    cy.get('.geo-error-title', { timeout: 30000 }).should('contain.text', "La photo aérienne n'a pas pu être chargée");
    cy.get('.geo-error-message').should('contain.text', 'la photo aérienne');
  });
});
