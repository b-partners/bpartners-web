import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import { redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

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

    cy.stub({ redirect }, 'redirect').as('redirect');
  });

  it('should render the appropriate button', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.get("[data-testid='prospect-filter']").clear();

    // testing TO_CONTACT to CONTACTED
    cy.get('[data-testid="edit-prospect1_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-contacted"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2)').click();
    cy.contains('Pas intéressé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Intéressé').click();
    cy.contains('Réserver ce prospect');
    cy.contains('Devis envoyé').click();
    cy.contains('Réserver ce prospect');
    cy.contains('Annuler').click();

    // testing TO_CONTACT to CONVERTED
    cy.get('[data-testid="edit-prospect1_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-converted"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(3)').click();
    cy.contains('Pas intéressé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Intéressé').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Devis envoyé').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Annuler').click();

    // testing CONTACTED to CONVERTED
    cy.get('[data-testid="edit-prospect2_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-converted"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(3)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Facture envoyée').click();
    cy.contains('Transformer ce prospect en client');
    cy.contains('Annuler').click();

    // testing CONTACTED to TO_CONTACT
    cy.get('[data-testid="edit-prospect2_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-to_contact"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(1)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Libérer ce prospect');
    cy.contains('Facture envoyée').click();
    cy.contains('Libérer ce prospect');
    cy.contains('Annuler').click();

    // testing CONVERTED to CONTACTED
    cy.get('[data-testid="edit-prospect6_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-contacted"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Remettre ce client en prospect');
    cy.contains('Facture envoyée').click();
    cy.contains('Remettre ce client en prospect');
    cy.contains('Annuler').click();

    // testing CONVERTED to TO_CONTACT
    cy.get('[data-testid="edit-prospect6_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-to_contact"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(1)').click();
    cy.contains('Devis refusé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Devis accepté').click();
    cy.contains('Libérer ce client');
    cy.contains('Facture envoyée').click();
    cy.contains('Libérer ce client');
    cy.contains('Annuler').click();
  });

  it('should show empty list', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.contains('Pas encore de Prospect.');
    cy.contains('Ajouter un prospect');
  });

  it('consent google sheet', () => {
    const redirectionUrl = {
      redirectionStatusUrls: { failureUrl: 'dummy', successUrl: 'dummy' },
    };
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('POST', `/users/${whoami1.user.id}/sheets/oauth2/consent`, redirectionUrl).as('consentGoogleSheet');

    cy.mount(<App />);
    cy.get('[name="prospects"]').click();
    cy.get('[data-cy="administration-tab"]').click();

    cy.contains('Vous devez vous connecter à Google sheets pour importer ou évaluer des prospects');
    cy.get('[data-cy="evaluate-prospect"]').click();

    cy.get('@redirect').should('have.been.calledOnce');
  });

  it('change prospecting perimeter', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, []).as('getProspects1');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/globalInfo`, req => {
      expect(req.body.contactAddress.prospectingPerimeter).to.deep.eq(5);

      req.reply(accountHolders1[0]);
    }).as('updateProspectingPerimeter');

    cy.mount(<App />);
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
});
