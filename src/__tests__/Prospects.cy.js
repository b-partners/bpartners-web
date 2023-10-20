import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { prospects, contactedProspect } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { InvoiceStatus } from 'bpartners-react-client';
import { evaluationJobs } from './mocks/responses/Evaluation-jobs-api';

describe(specTitle('Prospects'), () => {
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

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('are displayed', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');

    cy.contains('À contacter');
    cy.contains('Contactés');
    cy.contains('Convertis');

    cy.contains(/John Doe/gi);
    cy.contains('johnDoe@gmail.com');
    cy.contains('+261340465338');
    cy.contains('30 Rue de la Montagne Sainte-Genevieve');
    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.contains('10.00');
    cy.contains('6.00');

    // test filter prospect by name
    const filterName = 'to search';
    cy.intercept('GET', '/accountHolders/mock-accountHolder-id1/prospects?name=to+search', req => {
      expect(req.query.name).eq(filterName);
      req.reply([contactedProspect, ...prospects.slice(1)]);
    }).as('filterProspect');
    cy.get("[data-testid='prospect-filter']").type(filterName);
    cy.wait('@filterProspect');
  });

  it('should render the appropriate button', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.get("[data-testid='prospect-filter']").clear();

    // testing TO_CONTACT to CONTACTED
    cy.get('[data-testid="statusprospect1_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2)').click();
    cy.contains('Pas intéressé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Intéressé').click();
    cy.contains('Réserver ce prospect');
    cy.contains('Devis envoyé').click();
    cy.contains('Réserver ce prospect');
    cy.contains('Annuler').click();

    // testing TO_CONTACT to CONVERTED
    cy.get('[data-testid="statusprospect1_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(3)').click();
    cy.contains('Pas intéressé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Intéressé').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Devis envoyé').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Annuler').click();

    // testing CONTACTED to CONVERTED
    cy.get('[data-testid="statusprospect2_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(3)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Facture envoyée').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Annuler').click();

    // testing CONTACTED to TO_CONTACT
    cy.get('[data-testid="statusprospect2_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(1)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Libérer ce prospect');
    cy.contains('Facture envoyée').click();
    cy.contains('Libérer ce prospect');
    cy.contains('Annuler').click();

    // testing CONVERTED to CONTACTED
    cy.get('[data-testid="statusprospect6_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Remettre ce client en prospect');
    cy.contains('Facture envoyée').click();
    cy.contains('Remettre ce client en prospect');
    cy.contains('Annuler').click();

    // testing CONVERTED to TO_CONTACT
    cy.get('[data-testid="statusprospect6_id"] > [data-testid="MoreVertIcon"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(1)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Libérer ce client');
    cy.contains('Facture envoyée').click();
    cy.contains('Libérer ce client');
    cy.contains('Annuler').click();
  });

  it('change prospecting perimeter', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/globalInfo`, req => {
      expect(req.body.contactAddress.prospectingPerimeter).to.deep.eq(5);

      req.reply(accountHolders1[0]);
    }).as('updateProspectingPerimeter');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="configuration-tab"]').click();

    cy.contains('Configurer le périmètre de prospection.');
    cy.contains('0 km');
    cy.contains('4');
    cy.contains('10 km');

    cy.get('[data-testid="perimeterSlider"]').invoke('val', 5).trigger('change').click({ force: true });

    cy.contains('5');

    cy.wait('@updateProspectingPerimeter');

    cy.contains('Changement enregistré');
  });

  it('should show empty list', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.contains('Pas encore de Prospect.');
  });

  it('consent google sheet', () => {
    const redirectionUrl = {
      redirectionStatusUrls: { failureUrl: 'dummy', successUrl: 'dummy' },
    };
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('POST', `/users/${whoami1.user.id}/sheets/oauth2/consent`, redirectionUrl).as('consentGoogleSheet');

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="configuration-tab"]').click();

    cy.contains('Évaluation des prospects');
    cy.get('[data-cy="evaluate-prospect"]').click();
    cy.contains('Connexion à Google Sheets requise');
    cy.get('[data-testid="connect-to-googleSheets"]').click();

    cy.get('@redirect').should('have.been.calledOnce');
  });
  //
  it('should evaluate prospects', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, evaluationJobs).as('getEvaluationJobs');
    cy.intercept('GET', `/accountHolders?name=`, req => {
      req.reply(accountHolders1);
    }).as('getAllAccountHolders');
    cy.intercept('GET', `/accountHolders?name=Numer`, accountHolders1[0]).as('getAccountHoldersByName');
    cy.intercept('PUT', ` /accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, {}).as('evaluateProspects');

    // Configurez localStorage pour que la fonction isExhalationPassed retourne true
    const futureExpirationDate = new Date();
    futureExpirationDate.setMinutes(futureExpirationDate.getMinutes() + 30);
    cy.window().its('localStorage').invoke('setItem', 'expiredAt_validationToken_googleSheet', futureExpirationDate.toISOString());

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="configuration-tab"]').click();
    cy.get('#mui-component-select-interventionTypes').click();
    cy.get('[data-value="RAT_REMOVAL"]').click();

    cy.get('body').click();
    cy.get('[data-testid="autocomplete-backend-for-artisanOwner"]').click();
    cy.contains('Numer').click();

    cy.wait('@getAccountHoldersByName');

    cy.get('[name="spreedSheetName"]').type('spreed Sheet Name test');
    cy.get('[name="sheetName"]').type('sheet name test');
    cy.get('[name="min"]').type(2);
    cy.get('[name="max"]').type(4);
    cy.get('[name="minCustomerRating"]').type(-12);
    cy.get('[name="minProspectRating"]').type(30);
    cy.get('#confirmation').click();
    cy.contains('La valeur minimale autorisée est 0');
    cy.contains('La valeur maximale autorisée est 10');
    cy.get('[name="minCustomerRating"]').clear().type(8);
    cy.get('[name="minProspectRating"]').clear().type(9);
    cy.get('#confirmation').click();
    cy.wait('@evaluateProspects').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
  });

  it('view prospect evaluation jobs', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, evaluationJobs).as('getEvaluationJobs');
    cy.intercept('GET', `/accountHolders?name=`, req => {
      req.reply(accountHolders1);
    }).as('getAllAccountHolders');
    cy.intercept('PUT', ` /accountHolders/${accountHolders1[0].id}/prospects/evaluationJobs`, {}).as('evaluateProspects');

    const futureExpirationDate = new Date();
    futureExpirationDate.setMinutes(futureExpirationDate.getMinutes() + 30);
    cy.window().its('localStorage').invoke('setItem', 'expiredAt_validationToken_googleSheet', futureExpirationDate.toISOString());

    mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="configuration-tab"]').click();

    cy.contains('En attente');
    cy.contains('Traitement');
    cy.contains('Réussi');
    cy.contains('Échoué');

    cy.contains('Rafraîchir la liste').click();

    cy.get(`[data-cy="view-details-job-${evaluationJobs[0].id}"]`).click();
    cy.contains('Détails');
    cy.contains('Fermer').click();

    cy.get(`[data-cy="rerun-evaluation-failed-${evaluationJobs[0].id}"]`).click();
  });
});
