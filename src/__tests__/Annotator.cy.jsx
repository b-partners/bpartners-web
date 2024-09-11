import App from '@/App';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { areaPictures } from './mocks/responses/area-pictures';
import { getInvoices } from './mocks/responses/invoices-api';
import { getProspect } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle("tester le fonctionnement de l'annotator"), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects**`, req => {
      const { pageSize, status = '', page } = req.query;
      req.reply(getProspect(page, pageSize, status));
    }).as('getProspects');

    cy.stub(Redirect, 'toURL').as('toURL');
  });

  it('When a roofer creates a lead, he is redirected to the /annotator page after generating the image URL', () => {
    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.wait('@getProspects');

    cy.contains('Ajouter un prospect').click();

    cy.get('[data-testid="email-field-input"]').clear().type('doejhonson@gmail.com');
    cy.get('[data-testid="phone-field-input"]').clear().type('+261340465399');
    cy.get('[data-testid="name-field-input"]').clear().type('Doe');
    cy.get('[data-testid="address-field-input"]').type('Evry');
    cy.get('[data-testid="firstName-field-input"]').clear().type('Jhonson');

    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects`, req => {
      req.reply(req.body);
    });

    cy.intercept('PUT', `/accounts/**/areaPictures/**`, areaPictures);
    cy.intercept('GET', '/accounts/**/areaPictures/**', areaPictures);
    cy.intercept('GET', '/accounts/**/files/**/raw');

    cy.contains('Générer l’image').click();
  });

  it('Show error message on address image not found', () => {
    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.wait('@getProspects');

    cy.contains('Ajouter un prospect').click();

    cy.get('[data-testid="email-field-input"]').clear().type('doejhonson@gmail.com');
    cy.get('[data-testid="phone-field-input"]').clear().type('+261340465399');
    cy.get('[data-testid="name-field-input"]').clear().type('Doe');
    cy.get('[data-testid="address-field-input"]').type('Evry');
    cy.get('[data-testid="firstName-field-input"]').clear().type('Jhonson');

    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects`, req => {
      req.reply(req.body);
    });

    cy.intercept('PUT', `/accounts/**/areaPictures/**`, req => req.reply({ statusCode: 500 }));

    cy.contains('Générer l’image').click();
    cy.contains("L'adresse que vous avez spécifiée n'est pas encore pris en charge. Veuillez réessayer ultérieurement.");
    cy.contains('Fermer').click();
  });
});
