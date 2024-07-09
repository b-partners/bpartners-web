import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { createInvoices, getInvoices, invoiceWithoutCustomer, invoiceWithoutTitle } from './mocks/responses/invoices-api';
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
  });

  it('Should show warning message', () => {
    const invoices = [invoiceWithoutCustomer, invoiceWithoutTitle, ...createInvoices(3, 'DRAFT')];
    cy.intercept('GET', `/accounts/mock-account-id1/invoices**`, invoices);
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get(':nth-child(1) > :nth-child(8) > .MuiTypography-root > .MuiBox-root > [aria-label="Convertir en devis"]').click();
    cy.contains('Veuillez vérifier que tous les champs ont été remplis correctement. Notamment chaque produit doit avoir une quantité supérieure à 0');
  });

  it("Should show error message and don't send invoice", () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document).as('getPdf');
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-draft-invoice']").click();

    cy.get('form input[name=title]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form input[name=title]').type('Nouveau titre');

    cy.get('form input[name=ref]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form input[name=ref]').type('New ref');

    cy.get('form input[name=sendingDate]').clear();
    cy.contains('Ce champ est requis');
    const currentDate = new Date();
    cy.get('form input[name=sendingDate]').type(`${currentDate.getFullYear() + 1}-01-01`);
    cy.contains("La date d'émission doit être antérieure ou égale à la date d’aujourd’hui");
    cy.get('form input[name=sendingDate]').clear();
    cy.get('form input[name=sendingDate]').type(`2023-01-01`);

    cy.get('form input[name=validityDate]').clear();

    cy.get('form input[name=validityDate]').type('2022-12-31');
    cy.contains("La date limite de validité doit être ultérieure ou égale à la date d'émission");
    cy.get('form input[name=validityDate]').clear().type('2023-01-02');

    // select the customer
    cy.get('[data-testid="autocomplete-backend-for-customer"]').click();
    cy.contains('lastName-2 firstName-2').click();

    cy.get('[data-testid="delayInPaymentAllowed-checkbox-id"]').click();
    cy.get('input[name="delayInPaymentAllowed"]').type(30);

    // the user can't save the invoice if it is not valid
    // the user should view an error message
    cy.get('#form-save-id').click();
    cy.contains('Ce champ est requis');
    cy.contains('Veuillez remplir correctement tous les champs');

    // select the product
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('description');
    cy.contains('description 0').click();

    // 'cause the invoice is now valid, onclick on the save button,
    // the crupdate request is send and the edit mode is closed
    cy.contains('Titre');
    cy.contains('Référence');
    cy.contains("Date d'émission");
    cy.contains('Rechercher un client');
    cy.contains('description');
    cy.get('#form-save-id').click();
  });
});
