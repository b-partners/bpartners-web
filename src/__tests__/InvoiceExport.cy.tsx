import App from '@/App';
import {
  accountHolders1,
  accounts1,
  businessActivities,
  invoiceExportRequestEmpty,
  invoiceExportRequestPending,
  invoiceExportRequestReady,
  whoami1,
} from './mocks/responses';

const EXPORT_BUTTON = '[name="open-invoice-export-modal"]';
const SUBMIT = '[name="export-invoice-submit"]';

const goToSubscriptionCard = () => {
  cy.mount(<App />);
  cy.get('[name="account"]').click();
  cy.wait('@getAccountHolder1');
  cy.contains('Mon abonnement');
};

describe('Invoice export', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', '/businessActivities?page=1&pageSize=100', businessActivities).as('getBusinessActivities');
  });

  it('opens the export modal from the subscription card', () => {
    goToSubscriptionCard();

    cy.contains('Télécharger les factures').should('not.exist');

    cy.get(EXPORT_BUTTON).should('be.visible').and('contain', 'Télécharger mes factures').click();

    cy.contains('Télécharger les factures').should('be.visible');
    cy.contains('Période de création de la facture').should('be.visible');
    cy.contains('Statuts des factures').should('be.visible');
    cy.contains('État des factures').should('be.visible');
    cy.contains('Nombre de factures par lot').should('be.visible');

    cy.get('[name="export-invoice-cancel"]').click();
    cy.contains('Télécharger les factures').should('not.exist');
  });

  it('submits the export request then polls until the batches are ready', () => {
    cy.intercept('PUT', `/users/${whoami1.user.id}/invoiceExportRequests`, req => {
      const [exportRequest] = req.body;
      expect(exportRequest.outputFormat).to.eq('ZIP');
      expect(exportRequest.batchSize).to.eq(100);
      expect(exportRequest.statusList).to.deep.eq(['CONFIRMED']);
      expect(exportRequest.archiveStatus).to.eq('ENABLED');
      expect(exportRequest.id).to.be.a('string');
      req.reply({});
    }).as('submitExport');

    cy.intercept('GET', '/dummy-export/*', { body: 'dummy-archive' }).as('downloadBatch');
    cy.intercept('GET', `/users/${whoami1.user.id}/invoiceExportRequests/*`, invoiceExportRequestReady).as('retrieveReady');
    cy.intercept({ method: 'GET', url: `/users/${whoami1.user.id}/invoiceExportRequests/*`, times: 1 }, invoiceExportRequestPending).as('retrievePending');

    goToSubscriptionCard();
    cy.get(EXPORT_BUTTON).click();
    cy.get(SUBMIT).click();

    cy.wait('@submitExport');

    cy.wait('@retrievePending');
    cy.get('.export-progress').should('have.class', 'MuiLinearProgress-determinate');

    cy.wait('@retrieveReady');
    cy.contains('Le téléchargement de vos factures a démarré.').should('be.visible');
    cy.contains('Télécharger les factures').should('not.exist');
  });

  it('warns when no invoice matches the selected filters', () => {
    cy.intercept('PUT', `/users/${whoami1.user.id}/invoiceExportRequests`, {}).as('submitExport');
    cy.intercept('GET', `/users/${whoami1.user.id}/invoiceExportRequests/*`, invoiceExportRequestEmpty).as('retrieveExport');

    goToSubscriptionCard();
    cy.get(EXPORT_BUTTON).click();
    cy.get(SUBMIT).click();

    cy.wait('@submitExport');
    cy.wait('@retrieveExport');

    cy.contains('Aucune facture ne correspond aux critères sélectionnés.').should('be.visible');
    cy.contains('Télécharger les factures').should('be.visible');
  });

  it('notifies when the export request fails', () => {
    cy.intercept('PUT', `/users/${whoami1.user.id}/invoiceExportRequests`, { statusCode: 500, body: {} }).as('submitExport');

    goToSubscriptionCard();
    cy.get(EXPORT_BUTTON).click();
    cy.get(SUBMIT).click();

    cy.wait('@submitExport');
    cy.get('.MuiSnackbar-root').should('be.visible');
    cy.get(SUBMIT).should('be.enabled');
  });
});
