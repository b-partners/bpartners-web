import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from '../App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { contactedProspect, convertedProspect, prospects } from './mocks/responses/prospects-api';
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

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('should change status of a prospect', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');

    // TO_CONTACT to CONTACTED
    cy.get('[data-testid="edit-prospect1_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-contacted"]').click();
    cy.get('.MuiFormGroup-root > :nth-child(2) > .MuiTypography-root').click();

    cy.contains('Pas intéressé');
    cy.contains('Intéressé');
    cy.contains('Devis envoyé');

    cy.contains('Pas intéressé').click();
    cy.contains('Abandonner ce prospect');
    cy.contains('Intéressé').click();

    contactedProspect.rating.lastEvaluation = contactedProspect.rating.lastEvaluation.toISOString();
    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects/${prospects[0].id}`, req => {
      expect(req.body).deep.eq(contactedProspect);

      req.reply(req.body);
    }).as('updateStatusToContacted');
    cy.contains('Réserver ce prospect').click();
    cy.wait('@updateStatusToContacted');
    cy.contains('Prospect mis à jour avec succès !');

    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, [contactedProspect, ...prospects.slice(1)]).as('getProspects');
    cy.wait('@getProspects');

    // CONTACTED to CONVERTED
    cy.get('[data-testid="edit-prospect2_id"]').click();
    cy.contains('Changez le statut du prospect pour le protéger');
    cy.get('[data-testid="edit-status-to-converted"]').click();

    cy.get('[name="contractAmount"]').type(123);
    cy.contains('Transformer ce prospect en client').click();

    cy.contains('Veuillez sélectionner une option.');

    cy.contains('Facture envoyée').click();
    cy.get('[name="contractAmount"]').clear();
    cy.contains('Transformer ce prospect en client').click();

    cy.contains('Ce champ est requis.');

    cy.get('[name="contractAmount"]').type(321);

    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects/${prospects[1].id}`, req => {
      // Delete rating property due to different dateFormat
      const convertedProspectWithoutRating = { ...convertedProspect };
      delete convertedProspectWithoutRating.rating;

      const requestBodyWithoutRating = { ...req.body };
      delete requestBodyWithoutRating.rating;

      expect(requestBodyWithoutRating).to.deep.equal(convertedProspectWithoutRating);

      req.reply(req.body);
    }).as('updateStatusToConverted');

    cy.contains('Transformer ce prospect en client').click();
    cy.wait('@updateStatusToConverted');

    cy.contains('Prospect mis à jour avec succès !');
  });
});
