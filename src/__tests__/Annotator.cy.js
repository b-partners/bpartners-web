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
  xTile: 0,
  yTile: 6,
  otherLayers: [
    {
      departementName: 'departementName',
      maximumZoomLevel: null,
      year: '',
      name: 'name',
      precisionLevelInCm: '',
      id: 'id',
      source: null,
    },
    {
      departementName: 'departementName',
      maximumZoomLevel: null,
      year: '',
      name: 'name',
      precisionLevelInCm: '',
      id: 'id',
      source: null,
    },
  ],
  id: 'id',
  actualLayer: {
    departementName: 'departementName',
    maximumZoomLevel: null,
    year: '',
    name: 'name',
    precisionLevelInCm: '',
    id: 'id',
    source: null,
  },
  availableLayers: [null, null],
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

    cy.contains('Créer').click();
  });
});
