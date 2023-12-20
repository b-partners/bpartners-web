import { mount } from '@cypress/react';
import { InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1, customers2 } from './mocks/responses/customer-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { createInvoices, getInvoices } from './mocks/responses/invoices-api';
import { products, setProduct } from './mocks/responses/product-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice creation'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', {});
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers**', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products**`, products).as('getProducts');
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
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
  });

  it('should display default values on invoice creation', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-draft-invoice']").click();

    cy.contains('0,00 €');

    cy.get('form input[name="title"]').should('have.value', 'Nouveau devis');
    cy.get('[data-testid="delayInPaymentAllowed-checkbox-id"]').click();
    cy.get('input[name="delayInPaymentAllowed"]').type(30);

    cy.get('input[name="delayPenaltyPercent"]').type(5);
    cy.get('[data-testid="globalDiscount-checkbox-id"]').click();
    cy.get('input[name="globalDiscount"]').type(20);
    cy.get('[data-testid="payment-regulation-checkbox-id"]').click();
    cy.contains('Acompte');
  });

  it('should create an draft invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-draft-invoice']").click();

    const newTitle = 'A new title';
    const badTitle = "@Bad'title";
    cy.get('form input[name=title]').clear().type(badTitle);
    cy.contains(`Le titre ne doit pas contenir des caractères spéciales autres que "éèêëçâùûôî.,;:/!?$%_=+()*°@#ÂÇÉÈÊËÎÔÙÛ"`);
    cy.get('form input[name=title]').clear().type(newTitle);

    const newRef = 'A new ref';
    cy.get('form input[name=ref]').clear().type(newRef);

    const newDelayInPaymentAllowed = 26;
    cy.get('[data-testid="delayInPaymentAllowed-checkbox-id"]').click();
    cy.get('input[name="delayInPaymentAllowed"]').type(newDelayInPaymentAllowed);

    const globalDiscount_percentValue = 100;
    cy.get('[data-testid="globalDiscount-checkbox-id"]').click();
    cy.get('input[name="globalDiscount"]').type(globalDiscount_percentValue);

    const newDelayPenaltyPercent = 40;

    cy.get('input[name="delayPenaltyPercent"]').type(newDelayPenaltyPercent);

    // select the customer
    cy.get('[data-testid="autocomplete-backend-for-customer"] input').type('lastName-0');
    cy.contains('lastName-2 firstName-2').click();

    // select the product
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('description');
    cy.contains('description 0').click();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewTitle');
    cy.wait('@crupdateWithNewTitle');
    // make change to send new request
    cy.get('.MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').clear().type(2);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      // check if the invoice status send by the use is DRAFT
      expect(req.body.status).to.deep.eq(InvoiceStatus.DRAFT);
      expect(req.body.ref).to.deep.eq(newRef);
      expect(req.body.delayInPaymentAllowed).to.deep.eq(newDelayInPaymentAllowed);
      expect(req.body.delayPenaltyPercent).to.deep.eq(parseInt(newDelayPenaltyPercent) * 100);
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewRefAndDelayData');
    cy.wait('@crupdateWithNewRefAndDelayData');

    cy.get('form input[name=delayPenaltyPercent]').should('have.value', newDelayPenaltyPercent);
    cy.get('[data-testid="invoice-Informations générales-accordion"]').click();
    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=validityDate]').invoke('removeAttr').type('2022-10-05');
    cy.get('form textarea[name=comment]').type('this is a comment for testing');
    cy.get('[data-testid="autocomplete-backend-for-customer"] input').type('lastName-0');
    cy.contains('lastName-2 firstName-2').click();
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('description');
    cy.contains('description 1').click();

    cy.contains('24,00 € (TTC)');
    cy.contains('TVA : 4,00 €');
    cy.contains('10,00 € (HT)');

    cy.get('[data-testid="product-product-1-id-item"] input').clear().type('15');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.products.length).to.deep.eq(2);

      const product0ToUpdate = req.body.products[0];
      const product0Updated = {
        ...product0ToUpdate,
        quantity: 15,
        totalPriceWithVat: 15 * product0ToUpdate.unitPrice * (1 + product0ToUpdate.vatPercent / 100 / 100),
      };
      const invoiceUpdated = {
        ...req.body,
        products: [product0Updated],
        totalPriceWithVat: product0Updated.totalPriceWithVat,
        updatedAt: new Date(),
      };
      req.reply({ body: invoiceUpdated });
    }).as('crupdateWithNewProduct');

    cy.wait('@crupdateWithNewProduct');
  });

  it('should create an confirmed invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-confirmed-invoice']").click();

    // select the customer
    cy.get('[data-testid="autocomplete-backend-for-customer"] input').type('lastName-0');
    cy.contains('lastName-2 firstName-2').click();

    // select the product
    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="autocomplete-backend-for-invoice-product"] input').type('description');
    cy.contains('description 0').click();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      // check if the invoice status send by the use is CONFIRMED
      expect(req.body.status).to.deep.eq(InvoiceStatus.CONFIRMED);

      const invoiceUpdated = {
        ...req.body,
        updatedAt: new Date(),
      };
      req.reply({ body: invoiceUpdated });
    }).as('crupdateWithNewProduct');

    cy.get('form #form-save-id').click();
    cy.contains('Tout voir');
    cy.contains('À payer uniquement');
  });

  it('should create a new customer', () => {
    cy.intercept('POST', '/accounts/mock-account-id1/customers**', req => {
      const newCustomer = {
        customerType: 'INDIVIDUAL',
        address: 'Wall Street 2',
        comment: 'comment',
        email: 'test@gmail.com',
        firstName: 'FirstName 11',
        lastName: 'LastName 11',
        phone: '55 55 55',
      };

      expect(req.body[0]).to.deep.eq(newCustomer);
      req.reply([customers2[12]]);
    }).as('createCustomer');

    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('[data-testid="open-popover"]').click();

    cy.get("[name='create-draft-invoice']").click();

    cy.get('[data-testid="create-new-customer"]').click();
    cy.contains('Créer un nouveau client');

    cy.get('#email').type('invalid email{enter}');
    cy.contains('Doit être un email valide');

    cy.get('#email').clear().type('test@gmail.com{enter}');
    cy.contains('Ce champ est requis');

    cy.get('#customerType_INDIVIDUAL').click();
    cy.get('#lastName').type('LastName 11');
    cy.get('#firstName').type('FirstName 11');
    cy.get('#address').type('Wall Street 2');
    cy.get('#comment').type('comment');
    cy.get('#phone').type('55 55 55{enter}');

    cy.wait('@createCustomer');
    cy.contains('Le client a été créé avec succès.');
  });

  it('should create a new product', () => {
    cy.intercept('POST', `/accounts/mock-account-id1/products`, req => {
      const newProduct = [
        {
          unitPrice: 10400,
          vatPercent: 600,
          description: 'new description product',
          quantity: 1,
          totalPriceWithVat: null,
          totalVat: null,
          unitPriceWithVat: null,
        },
      ];
      expect(req.body).to.deep.equals(newProduct);
      setProduct(newProduct[0], 0);
      req.reply(newProduct);
    }).as('createNewProduct');

    mount(<App />);

    cy.get('[name="invoice"]').click();

    cy.get('[data-testid="open-popover"]').click();
    cy.get("[name='create-draft-invoice']").click();

    cy.get('[data-testid="invoice-Produits-accordion"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('[data-testid="create-new-product"]').click();

    cy.contains('Créer un nouveau produit');

    cy.get('#description').type('new description product');
    cy.get('#unitPrice').type(1.04);
    cy.get('#vatPercent').type(6);
    cy.get('.RaToolbar-defaultToolbar > .MuiButtonBase-root').click();
    cy.wait('@createNewProduct');
    cy.contains('Le produit a été créé avec succès.');
  });
});
