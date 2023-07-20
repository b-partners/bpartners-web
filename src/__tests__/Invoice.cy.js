import { mount } from '@cypress/react';
import { InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices, invoicesToChangeStatus } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/mock-account-id1/products**`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, status, page } = req.query;
      req.reply(getInvoices(page - 1, pageSize, InvoiceStatus[status]));
    });

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
  });

  it('Should show the money in major unit', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('120,00 €');
    cy.contains('20,00 €');
  });

  it('Test pagination', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-ref-0');
    cy.contains('invoice-ref-14');

    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('invoice-ref-15');
    cy.contains('invoice-ref-34');

    cy.get('[data-testid="pagination-right-id"]').click();
    cy.contains('invoice-ref-0');
    cy.contains('invoice-ref-14');

    cy.get(`div .MuiSelect-select`).click();
    cy.get('[data-value="10"]').click();

    cy.contains('invoice-ref-10').not();
    cy.contains('invoice-ref-14').not();

    cy.contains('Page : 1 / 4');
  });

  it('Should show the list of invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Brouillon');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();

    cy.contains('À confirmer');

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();

    cy.contains('À payer');
  });

  it('Can be paid', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.contains('invoice-ref-3');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.status).to.eq(InvoiceStatus.PAID);
      req.reply({ ...req.body });
    }).as('pay');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=15&status=PAID`).as('refetch');
    cy.intercept('POST', `/users/mock-user-id1/accountHolders/mock-accountHolder-id1/feedback`, req => {
      const actualFeedbackAsked = req.body;
      expect(actualFeedbackAsked.subject).contains(' -  donnez nous votre avis');
      expect(actualFeedbackAsked.message).contains('<p>').and().contains('<br/>').and().contains('Nous espérons que vous allez bien.');
      req.reply({});
    }).as('AskFeedback');
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [data-testid="invoice-conversion-PAID-invoice-ref-0"]').click();
    cy.wait('@refetch');
    cy.contains("Envoyer un demande d'avis à firstName-0 lastName-0.");
    cy.get('[data-cy="invoice-relaunch-submit"]').click();
  });

  it('Should automatically change tabs when converting to a quote or invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Convertir en devis"]').click();
    cy.contains('À confirmer');
    cy.contains('Brouillon transformé en devis !');

    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Transformer en facture"]').click();
    cy.contains('À payer');
    cy.contains('Devis confirmé');
  });

  it('Check if date label are corrects', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains("Date d'émission");
    cy.contains('Date limite de validité');
  });

  it('Should show an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Justificatif"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Justificatif');
    cy.get('[data-testid="DownloadForOfflineIcon"]').click();
  });

  it('Should send the request even if there is not comment', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();
    const simpleComment = 'This is a simple comment';
    cy.get('form textarea[name=comment]').type(simpleComment);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.comment).to.be.eq(simpleComment);
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
        comment: simpleComment,
      });
    });
    cy.get('form textarea[name=comment]').clear();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      assert.isNull(req.body.comment);
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    });
  });

  it('Should able to refresh the preview', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    }).as('emitInvoice');

    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.wait('@getAccount1');
    cy.wait('@whoami');
    cy.wait('@getAccountHolder1');

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();
    cy.get('#form-refresh-preview').click();
    cy.wait('@emitInvoice');
  });

  it("Shouldn't show all tva reference when isSubjectToVat is false", () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, req => {
      // make isSubjectToVat = false
      const accountHolder = { ...accountHolders1[0] };
      accountHolder.companyInfo.isSubjectToVat = false;

      req.reply({
        body: [{ ...accountHolder }],
      });
    }).as('getAccountHolder2');

    mount(<App />);

    cy.get('[name="invoice"]').click();

    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder2');
    // shouldn't show TTC price
    cy.contains(/TTC/gi).should('not.exist');

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    // shouldn't show TTC price
    cy.contains(/TTC/gi).should('not.exist');
    cy.contains(/TVA/gi).should('not.exist');
    cy.contains('Total TTC').should('not.exist');
    cy.contains('Total HT');
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('[data-testid="product-product-1-id-item"]').clear().type(2);
    // we have now 2 products
    // description1 { quantity: 1, unitPrice: 10 }
    // description2 { quantity: 1, unitPrice: 20 }
    // because of (1 * 10 + 1 * 20 == 30), we should see "Total HT 30.00 €"
    cy.contains('30,00 €');
  });

  it('Should show payment regulation comment', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, invoicesToChangeStatus);

    mount(<App />);

    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();
    cy.get('[data-testid="invoice-Acompte-accordion"]').click();
    cy.contains('Test dummy comment');
  });
});
