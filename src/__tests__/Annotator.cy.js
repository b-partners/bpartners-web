import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

const areaPictures = {
  id: '8631544e-f84e-47bb-9601-5baeee5062c5',
  xTile: 519192,
  yTile: 370917,
  availableLayers: ['tous_fr'],
  actualLayer: {
    id: 'cee23f9b-d3ca-4a47-b27a-d7d62b5119c7',
    name: 'vendee',
    year: 2023,
    source: 'GEOSERVER',
    departementName: 'vendee',
    maximumZoomLevel: 'HOUSES_0',
    maximumZoom: {
      level: 'HOUSES_0',
      number: 20,
    },
    precisionLevelInCm: 20,
  },
  otherLayers: [
    {
      id: 'cee23f9b-d3ca-4a47-b27a-d7d62b5119c7',
      name: 'vendee',
      year: 2023,
      source: 'GEOSERVER',
      departementName: 'vendee',
      maximumZoomLevel: 'HOUSES_0',
      maximumZoom: {
        level: 'HOUSES_0',
        number: 20,
      },
      precisionLevelInCm: 20,
    },
    {
      id: '2cb589c1-45b0-4cb8-b84e-f1ed40e97bd8',
      name: 'tous_fr',
      year: 0,
      source: 'OPENSTREETMAP',
      departementName: 'ALL',
      maximumZoomLevel: 'HOUSES_0',
      maximumZoom: {
        level: 'HOUSES_0',
        number: 20,
      },
      precisionLevelInCm: 20,
    },
  ],
  address: "25 Rue Camille Guérin, 85180 Les Sables-d'Olonne",
  zoomLevel: 'HOUSES_0',
  zoom: {
    level: 'HOUSES_0',
    number: 20,
  },
  fileId: '682d9f63-19d9-4cf0-9cf3-1d63b0272c1c',
  filename: 'vendee_HOUSES_0_519192_370917',
  prospectId: 'b42c4eeb-30d9-463e-bb8e-b7378bd957a6',
  createdAt: '2024-05-28T12:34:54.897272Z',
  updatedAt: '2024-05-28T12:34:54.897319Z',
  layer: 'tous_fr',
};

describe(specTitle("tester le fonctionnement de l'annotator"), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList, page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('When a roofer creates a lead, he is redirected to the /annotator page after generating the image URL', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.wait('@getProspects');

    cy.get('.css-69i1ev > .MuiButtonBase-root').click();

    cy.get('[data-testid="email-field-input"]').clear().type('doejhonson@gmail.com');
    cy.get('[data-testid="phone-field-input"]').clear().type('+261340465399');
    cy.get('[data-testid="name-field-input"]').clear().type('Doe');
    cy.get('[data-testid="address-field-input"]').type('Evry');
    cy.get('[data-testid="firstName-field-input"]').clear().type('Jhonson');

    cy.get('[data-testid="autocomplete-backend-for-invoice"]').click();
    cy.contains('invoice-title-0').click();

    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects`, req => {
      req.reply(req.body);
    });

    cy.intercept('PUT', `/accounts/**/areaPictures/**`, areaPictures);
    cy.intercept('GET', '/accounts/**/areaPictures/**', areaPictures);
    cy.intercept('GET', '/accounts/**/files/**/raw');

    cy.contains('Créer').click();
  });
});
