import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { evaluationJobDetails, evaluationJobs } from './mocks/responses/Evaluation-jobs-api';
import { importProspects } from './mocks/responses/import-prospects-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Customers'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
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
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, evaluationJobs).as('getEvaluationJobs');
    cy.intercept('GET', `/accountHolders?name=`, req => {
      req.reply(accountHolders1);
    }).as('getAllAccountHolders');

    // Configurez localStorage pour que la fonction isExhalationPassed retourne true
    const futureExpirationDate = new Date();
    futureExpirationDate.setMinutes(futureExpirationDate.getMinutes() + 30);
    cy.window().its('localStorage').invoke('setItem', 'expiredAt_validationToken_googleSheet', futureExpirationDate.toISOString());

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('should trigger an error during prospects import', () => {
    cy.intercept('POST', `/accountHolders/${accountHolders1[0].id}/prospects/import`, req => {
      req.reply({
        statusCode: 403,
        body: {
          message: errorMessage,
        },
      });
    }).as('importProspectsError');
    const errorMessage = 'File(name=spreed Sheet Name test) does not exist or you do not have authorization to read it';

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="administration-tab"]').click();

    cy.contains('Importer des prospects dans la base de données depuis Google Sheet');

    cy.get('[name="import_sheetName"]').click();
    cy.contains('Daniderat').click();
    cy.get('[name="import_min"]').type(2);
    cy.get('[name="import_max"]').type(4);
    cy.get('#importProspectsSubmit').click();

    cy.wait('@importProspectsError');

    cy.contains(errorMessage);
  });

  it('should import prospects successfully', () => {
    cy.intercept('POST', `/accountHolders/${accountHolders1[0].id}/prospects/import`, importProspects).as('importProspectsSuccessfully');
    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="administration-tab"]').click();

    cy.contains('Importer des prospects dans la base de données depuis Google Sheet');

    cy.get('[name="import_sheetName"]').click();
    cy.contains('Daniderat').click();
    cy.get('[name="import_min"]').type(2);
    cy.get('[name="import_max"]').type(4);
    cy.get('#importProspectsSubmit').click();

    cy.wait('@importProspectsSuccessfully');

    cy.contains('Prospects importés avec succès');
  });

  it('should evaluate prospects', () => {
    cy.intercept('GET', `/accountHolders?name=Numer`, accountHolders1[0]).as('getAccountHoldersByName');
    cy.intercept('PUT', ` /accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, {}).as('evaluateProspects');

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="administration-tab"]').click();
    cy.contains('Évaluation des prospects');

    cy.get('#mui-component-select-interventionTypes').click();
    cy.get('[data-value="RAT_REMOVAL"]').click();

    cy.get('body').click();
    cy.get('[data-testid="autocomplete-backend-for-artisanOwner"]').click();
    cy.contains('Numer').click();

    cy.wait('@getAccountHoldersByName');

    cy.get('[name="sheetName"]').click();
    cy.contains('Daniderat').click();
    cy.get('[name="min"]').type(2);
    cy.get('[name="max"]').type(4);
    cy.get('[name="minCustomerRating"]').type(-12);
    cy.get('[name="minProspectRating"]').type(30);
    cy.get('#evaluateProspectsSubmit').click();
    cy.contains('La valeur minimale autorisée est 0');
    cy.contains('La valeur maximale autorisée est 10');
    cy.get('[name="minCustomerRating"]').clear().type(8);
    cy.get('[name="minProspectRating"]').clear().type(9);
    cy.get('#evaluateProspectsSubmit').click();
    cy.wait('@evaluateProspects').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
  });

  it('view prospect evaluation jobs', () => {
    cy.intercept('PUT', ` /accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, {}).as('evaluateProspects');
    cy.intercept('GET', `/accountHolders/mock-accountHolder-id1/prospects/evaluationJobs/mock-evaluationJob-id1`, evaluationJobDetails).as(
      'getProspectEvaluationJobDetails'
    );

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="administration-tab"]').click();

    cy.contains('En attente');
    cy.contains('Traitement');
    cy.contains('Réussi');
    cy.contains('Échoué');

    cy.contains('Rafraîchir la liste').click();

    cy.get(`[data-cy="view-details-job-${evaluationJobs[0].id}"]`).click();
    cy.wait('@getProspectEvaluationJobDetails');
    cy.contains('Détails');
    cy.contains('Nombre de prospects évalués');
    cy.contains('Fermer').click();

    cy.get(`[data-cy="rerun-evaluation-failed-${evaluationJobs[0].id}"]`).click();
    cy.wait('@evaluateProspects').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
  });
});
