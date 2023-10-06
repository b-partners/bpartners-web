import { InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices } from './mocks/responses/invoices-api';
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
      const { pageSize, statusList, page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/**`, document);
    });
  });

  it('Should show the money in major unit', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('120,00 €');
    cy.contains('20,00 €');
  });

  it('Test pagination', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-ref-0');
    cy.contains('invoice-ref-14');

    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('invoice-ref-15');
    cy.get('[data-testid="pagination-left-id"]').click();
    cy.contains('invoice-ref-34');

    cy.get('[data-testid="pagination-right-id"]').click();
    cy.contains('invoice-ref-15');
    cy.get('[data-testid="pagination-right-id"]').click();
    cy.contains('invoice-ref-0');

    cy.get(`div .MuiSelect-select`).click();
    cy.get('[data-value="10"]').click();

    cy.contains('invoice-ref-10').not();
    cy.contains('invoice-ref-14').not();
  });

  it('Should show the list of invoice', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Brouillon');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();

    cy.contains('À confirmer');

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.get("[data-testid='invoice-confirmed-switch']").click();
    cy.contains('À payer');
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

    cy.mount(<App />);

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

  it('Empty list', () => {
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, []);
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.wait('@whoami');
    cy.wait('@getAccount1');
    cy.wait('@legalFiles');

    cy.contains('Pas encore de devis/facture.');
    cy.contains('Voulez-vous en créer un ?');
    cy.get('[name="create-draft-invoice"]').click();
    cy.contains('Création');
    cy.get('[data-testid="ClearIcon"]').click();
    cy.get('[name="create-confirmed-invoice"]').click();
    cy.contains('Création');
  });

  it('Search invoice', () => {
    cy.mount(<App />);
    cy.get('[name="invoice"]').click();

    const toSearch = 'test search';
    const expectedQuery = 'test,search';

    cy.get("[data-testid='invoice-search-bar'] input").type(toSearch);

    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList, page, filters } = req.query;
      expect(filters).eq(expectedQuery);
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    }).as('searchInvoice');

    cy.wait('@searchInvoice');
  });
});
