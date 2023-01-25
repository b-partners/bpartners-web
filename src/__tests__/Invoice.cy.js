import { mount } from '@cypress/react';
import { InvoiceStatus } from 'bpartners-react-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { customers1 } from './mocks/responses/customer-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { createInvoices, invoiceWithoutCustomer, invoiceWithoutTitle } from './mocks/responses/invoices-api';
import { products } from './mocks/responses/product-api';
import { token1, user1, whoami1 } from './mocks/responses/security-api';

describe(specTitle('Invoice'), () => {
  beforeEach(() => {
    cy.viewport(1326, 514);
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy',
          },
        })
    );
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');

    cy.intercept('POST', '/accounts/mock-account-id1/invoices/invoice-id-1/relaunch', {});

    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products).as('getProducts');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, createInvoices(1)[0]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer10Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT')).as('getDraftsPer5Page1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=DRAFT`, createInvoices(5, 'DRAFT'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=PROPOSAL`, createInvoices(5, 'PROPOSAL'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=CONFIRMED`, createInvoices(5, 'CONFIRMED'));
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PAID`, createInvoices(1, 'PAID')).as('getPaidsPer10Page1');
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, createInvoices(1)[0]).as('crupdate1');
  });

  it('should display modal to relaunch a quotation', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

    cy.contains('Relance manuelle du devis ref: invoice-ref-1');

    cy.get('[data-test-item="object-field"]').type('objet-example');
    cy.get('.public-DraftEditor-content').type('message here');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.contains('Le devis ref: invoice-ref-1');
  });

  it('should display modal to relaunch an invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.get('[data-test-item="relaunch-invoice-id-1"]').click();

    cy.contains('Relance manuelle de la facture ref: invoice-ref-1');

    cy.get('[data-test-item="object-field"]').type('objet-example');
    cy.get('.public-DraftEditor-content').type('message here');

    cy.get('[data-cy="invoice-relaunch-submit"]').click();

    cy.contains('La facture ref: invoice-ref-1');
  });

  it('should show the money in major unit', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('120.00 €');
    cy.contains('20.00 €');
  });

  it('should show the list of invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.contains('Brouillon');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();

    cy.contains('À confirmer');

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();

    cy.contains('À payer');
  });

  it('can be paid', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get('.MuiTabs-flexContainer > :nth-child(3)').click();
    cy.contains('invoice-ref-3');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.status).to.eq(InvoiceStatus.PAID);
      req.reply({ ...req.body });
    }).as('pay');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=PAID`).as('refetch');
    cy.get('[data-test-item="pay-invoice-id-3"]').click();
    cy.wait('@pay');
    cy.wait('@refetch');
    cy.contains('Facture invoice-ref-3 payée !');
  });

  it('should test pagination', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.RaList-main > :nth-child(3) > .MuiButtonBase-root').click();

    cy.contains('Page : 2');
    cy.contains('Taille : 5');
  });

  it('should show success message', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Convertir en devis"]').click();
    cy.contains('Brouillon transformé en devis !');

    cy.get('.MuiTabs-flexContainer > :nth-child(2)').click();
    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Transformer en facture"]').click();
    cy.contains('Devis confirmé');
  });

  it('should automatically change tabs when converting to a quote or invoice', () => {
    mount(<App />);
    cy.get('[name="invoice"]').click();

    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Convertir en devis"]').click();
    cy.contains('À confirmer');

    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Transformer en facture"]').click();
    cy.contains('À payer');
  });

  it('should display default values on invoice creation', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();

    cy.contains('0.00 €');
    cy.get('form input[name="delayInPaymentAllowed"]').should('have.value', 30);
    cy.get('form input[name="delayPenaltyPercent"]').should('have.value', 5);
  });

  it('should create an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();

    const newTitle = 'A new title';
    cy.get('form input[name=title]').clear().type(newTitle);

    const newRef = 'A new ref';
    cy.get('form input[name=ref]').clear().type(newRef);

    const newDelayInPaymentAllowed = '26';
    cy.get('form input[name=delayInPaymentAllowed]').clear().type(newDelayInPaymentAllowed);

    const newDelayPenaltyPercent = '40';
    cy.get('form input[name=delayPenaltyPercent]').clear().type(newDelayPenaltyPercent);

    // select the customer
    cy.get('#invoice-client-selection-id').click();
    cy.get('[data-value="customer2"]').click();

    // select the product
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('.MuiInputBase-root > #product-selection-id').click();
    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewTitle');
    cy.wait('@crupdateWithNewTitle');
    // make change to send new request
    cy.get('.MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').clear().type(2);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.ref).to.deep.eq(newRef);
      expect(req.body.delayInPaymentAllowed).to.deep.eq(newDelayInPaymentAllowed);
      expect(req.body.delayPenaltyPercent).to.deep.eq(parseInt(newDelayPenaltyPercent) * 100);
      req.reply({ ...req.body, updatedAt: new Date() });
    }).as('crupdateWithNewRefAndDelayData');
    cy.wait('@crupdateWithNewRefAndDelayData');

    cy.get('form input[name=delayPenaltyPercent]').should('have.value', newDelayPenaltyPercent);

    cy.get('form input[name=sendingDate]').invoke('removeAttr').type('2022-10-02');
    cy.get('form input[name=toPayAt]').invoke('removeAttr').type('2022-10-05');
    cy.get('form input[name=comment]').type('this is a comment for testing');
    cy.get('#invoice-client-selection-id').click();
    cy.get('[data-value="customer2"]').click();
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('.MuiInputBase-root > #product-selection-id').click();

    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();
    cy.contains('24.00 € (TTC)');
    cy.contains('TVA : 0.04 €');
    cy.contains('10.00 € (HT)');
    cy.contains('20.00 € (HT)');

    cy.get(':nth-child(2) > .MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').clear().type('15');
    cy.get(':nth-child(4) > :nth-child(1) > .MuiCardHeader-root > .MuiCardHeader-action > .MuiButtonBase-root > [data-testid="ClearIcon"]').click();
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.products.length).to.deep.eq(1);

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
    cy.contains('360.00 €');
  });

  it("should show error message and don't send invoice", () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document).as('getPdf');
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.css-1lsi523-MuiToolbar-root-RaListToolbar-root > .MuiButtonBase-root > .MuiSvgIcon-root').click();

    cy.get('form input[name=title]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form input[name=title]').type('Nouveau titre');

    cy.get('form input[name=ref]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form input[name=ref]').type('New ref');
    cy.get('form input[name=delayInPaymentAllowed]').clear().type('30');

    cy.get('form input[name=sendingDate]').clear();
    cy.contains('Ce champ est requis');
    const currentDate = new Date();
    cy.get('form input[name=sendingDate]').type(`${currentDate.getFullYear() + 1}-01-01`);
    cy.contains("La date d'envoi doit précéder celle du paiement");
    cy.get('form input[name=sendingDate]').clear();
    cy.get('form input[name=sendingDate]').type(`2023-01-01`);

    cy.get('form input[name=toPayAt]').clear();
    cy.contains('Ce champ est requis');

    cy.get('form input[name=toPayAt]').type('2022-12-31');
    cy.contains("La date d'envoi doit précéder celle du paiement");
    cy.get('form input[name=toPayAt]').clear().type('2023-01-02');

    cy.contains('Ce champ est requis');
    // select the customer
    cy.get('#invoice-client-selection-id').click();
    cy.get('[data-value="customer2"]').click();

    // the user can't save the invoice if it is not valid
    // the user shoud view an error message
    cy.get('#form-save-id').click();
    cy.contains('Veuillez remplir correctement tous les champs');
    // select the product
    cy.get('#invoice-product-selection-button-id').click();
    cy.get('.MuiInputBase-root > #product-selection-id').click();
    cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click();

    // 'cause the invoice is now valid, onclick on the save button,
    // the crupdate request is send and the edit mode is closed
    cy.get('#form-save-id').click();
    cy.contains('Référence');
    cy.contains('Titre');
    cy.contains('Client');
    cy.contains('Prix TTC');
    cy.contains('Statut');
    cy.contains("Date d'émission");
  });

  it('should edit an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains('Modification');
    cy.get('form #form-save-id').click();
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    });

    cy.contains('invoice-title-0');
    cy.contains('Name 3');
    cy.contains('Taille : 5');
  });

  it('Check if date label are corrects', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.contains("Date d'émission");
    cy.contains('Date limite de validité');
  });

  it('should show an invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Justificatif"] > .MuiSvgIcon-root').click();

    cy.contains('invoice-title-0');
    cy.contains('Justificatif');
    cy.get('[data-testid="DownloadForOfflineIcon"]').click();
  });

  it('should show warning message', () => {
    const invoices = [invoiceWithoutCustomer, invoiceWithoutTitle, ...createInvoices(3, 'DRAFT')];
    mount(<App />);
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10&status=DRAFT`, invoices).as('incompleteInvoice1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=5&status=DRAFT`, invoices).as('incompleteInvoice2');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=2&pageSize=5&status=DRAFT`, invoices).as('incompleteInvoice3');
    cy.get('[name="invoice"]').click();

    cy.get(':nth-child(1) > :nth-child(7) > .MuiTypography-root > .MuiBox-root > [aria-label="Convertir en devis"]').click();
    cy.contains('Veuillez vérifier que tous les champs ont été remplis correctement. Notamment chaque produit doit avoir une quantité supérieure à 0');
  });

  it('should send the request even if there is not comment', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });

    mount(<App />);
    cy.get('[name="invoice"]').click();
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();
    const simpleComment = 'This is a simple comment';
    cy.get('form input[name=comment]').type(simpleComment);

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      expect(req.body.comment).to.be.eq(simpleComment);
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
        comment: simpleComment,
      });
    });
    cy.get('form input[name=comment]').clear();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/invoices/*`, req => {
      assert.isNull(req.body.comment);
      req.reply({
        body: { ...req.body },
        updatedAt: new Date(),
      });
    });
  });

  it('is able to refresh the preview', () => {
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
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.get('#form-refresh-preview').click();
    cy.wait('@emitInvoice');
  });

  it.only("Shouldn't show all tva reference when isSubjectToVat is false", () => {
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
    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();

    cy.get('#form-refresh-preview').click();
    cy.wait('@emitInvoice');
  });
});
