import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import { InvoiceStatus } from '@bpartners/typescript-client';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { supportingDoc, transactions, transactionsSummary, transactionsSummary1 } from './mocks/responses/paying-api';
import { whoami1 } from './mocks/responses/security-api';
import transactionCategory1 from './mocks/responses/transaction-category-api';
import { createEmailResponse, transactionExportLinkResponse } from './mocks/responses/transaction-mailing-api';

describe(specTitle('Transactions'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', '/accounts/mock-account-id1/transactions**', transactions).as('getTransactions');
    cy.intercept('GET', `/users/${whoami1.user.id}/legalFiles`, []).as('legalFiles');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');

    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=${new Date().getFullYear()}`, transactionsSummary).as('getTransactionsSummary');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=2022`, transactionsSummary1).as('getEmptyTransactionSummary');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/transactionsSummary?year=2021`, transactionsSummary1).as('getEmptyTransactionSummary');
    cy.intercept('POST', `accounts/${accounts1[0].id}/transactions/${transactions[0].id}/transactionCategories`, transactions).as('getEmptyTransactionSummary');
    cy.intercept('GET', `/accounts/mock-account-id1/transactionCategories**`, transactionCategory1).as('getTransactionCategory');
  });

  it('can be categorized', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.get('#categorized').click();

    cy.wait('@legalFiles');
    cy.get('[data-testid="transaction-add-category-transaction3"]').click();
    cy.wait('@getTransactionCategory');
    cy.get('.MuiButtonBase-root > [data-testid="ArrowDropDownIcon"]').click();
    cy.contains('Autres dépenses').click();
    cy.get('[name="comment"]').type('Test');
    cy.get('[name="vat"]').type(10);
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').click();
  });

  it('are displayed', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    cy.contains("Abonnement BPartners - L'essentiel");
    cy.contains('- 0,05 €');
    cy.contains('+ 0,05 €');
    cy.contains('18/08/2022');
    cy.contains('05:34:20');
    cy.contains('Acceptée');
    cy.get('#categorized').click();
    cy.contains('En attente');
    cy.contains('Rejetée');
    cy.contains('En traitement');
  });

  it('display graphic summary', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    const today = new Date();
    cy.wait('@getTransactionsSummary');
    cy.get('[name="datePicker"]').should('have.value', today.getFullYear());
    cy.get('[name="datePicker"]').clear().type(2024);

    cy.contains('Vue mensuelle');
    cy.contains('Vue annuelle');
    cy.contains('Sélectionnez une année');

    cy.contains('Décaissement 2024');
    cy.contains('Encaissement 2024');
    cy.contains('Trésorerie 2024');

    cy.contains('2100,00 €');
    cy.contains('1000,00 €');
    cy.contains('1100,00 €');

    cy.get('[name="datePicker"]').clear().type(2022);
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('#annualSummarySwitch').click();
    cy.contains('Sélectionnez un mois');

    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('[name="datePicker"]').clear().type('janvier 2024');

    cy.contains('120,00 €');
    cy.contains('0,00 €');

    cy.contains('Décaissement');
    cy.contains('Encaissement');
    cy.contains('Trésorerie');

    cy.contains('Dernière modification');

    cy.get('[name="datePicker"]').clear().type('avril 2024');

    cy.contains('130,00 €');
    cy.contains('10,00 €');
    cy.contains('330,00 €');

    cy.get('[name="datePicker"]').clear().type('décembre 2024');

    cy.contains(`Vous n'avez pas de transaction sur cette période.`);

    cy.get('[name="datePicker"]').clear().type('avril 2022');
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);
  });

  it('display graphic of revenue targets', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    const today = new Date();
    cy.wait('@getTransactionsSummary');
    cy.get('[name="datePicker"]').should('have.value', today.getFullYear());
    cy.get('[name="datePicker"]').clear().type(2024);

    cy.contains('Objectif annuel (10,00 % atteint)');
    cy.contains('Encaissement de cette année : 12000,00 €');
    cy.contains('120000,00 €');

    cy.get('[name="datePicker"]').clear().type(2022);
    cy.contains(`Vous n'avez pas défini d'objectif pour cette année. Veuillez accéder à l'onglet mon compte pour définir votre objectif annuel.`);

    cy.get('[name="datePicker"]').clear().type(2021);
    cy.contains('Objectif annuel (100 % atteint. +8,33 %)');
    cy.contains('Encaissement de cette année : 130000,00 €');
  });

  it('display current balance all the time', () => {
    const newDate = new Date(2024, 1, 1);
    cy.clock(newDate);
    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.wait('@legalFiles');

    cy.wait('@getTransactionsSummary');
    cy.contains('Solde du compte d’encaissement : 220,00 €');

    cy.get('#annualSummarySwitch').click();

    cy.get('[name="datePicker"]').clear().type('janvier 2024');
    cy.contains('Solde du compte d’encaissement : 220,00 €');
    cy.contains('Trésorerie');
    cy.get('[name="datePicker"]').clear().type('décembre 2024');
    cy.contains('Solde du compte d’encaissement : 220,00 €');
    cy.contains(`Vous n'avez pas de transaction sur cette période.`);
  });

  it('are filterable', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('#categorized').check();
    cy.should('not.contain.text', 'TVA 20%');
  });

  it('Should show the appropriate status', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.wait('@legalFiles');

    cy.get('#status').click();

    cy.contains('En réception').should('not.exist');
  });

  it('Link transaction to invoice', () => {
    cy.readFile('src/operations/transactions/testInvoice.pdf', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=INVOICE`, document);
    });
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=15', transactions).as('getTransactions5');
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
    cy.intercept('PUT', `/accounts/mock-account-id1/transactions/transaction3/invoices/invoice-PAID-0-id`, transactions[0]).as('linkInvoiceAndTransaction');
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.get('#categorized').click();

    cy.wait('@legalFiles');
    cy.wait('@getTransactions5');

    cy.get('[data-testid="transaction3-link-invoice-button"]').click();

    cy.contains(/Lier la transaction (.*) à une facture :/);

    cy.get('.MuiTableBody-root > :nth-child(1) > .column-ref').click();
    const newTransaction = transactions.slice();
    newTransaction[0].invoice = { fileId: 'file-id-1', invoiceId: 'invoice-id-1' };
    cy.intercept('GET', '/accounts/mock-account-id1/transactions**', newTransaction).as('getTransactionsWithInvoice5');

    cy.get('#link-invoice-button-id').click();
    cy.wait('@linkInvoiceAndTransaction');
    cy.wait('@getTransactionsWithInvoice5');

    cy.get('#categorized').click();
    cy.get('#document-button-transaction1').click();
    cy.contains('Justificatif');
    cy.get('[data-testid="ClearIcon"]').click();
    cy.contains('Vue mensuelle');
  });

  it('Import document for a transaction', () => {
    cy.readFile('cypress/fixtures/test_image.jpg', 'binary').then(document => {
      cy.intercept('GET', `/accounts/mock-account-id1/files/*/raw?accessToken=accessToken1&fileType=TRANSACTION_SUPPORTING_DOCS`, document);
    });
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?page=1&pageSize=15', transactions).as('getTransactions5');
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
    cy.intercept('POST', `/accounts/mock-account-id1/transactions/transaction3/supportingDocuments`, supportingDoc).as('supportingDocuments');
    const newTransaction = transactions.slice();
    newTransaction[2].supportingDocs = supportingDoc;
    cy.intercept('GET', '/accounts/mock-account-id1/transactions**', newTransaction).as('getTransactionsWithSupportingDoc');
    mount(<App />);
    cy.get('[name="transactions"]').click();

    cy.get('#categorized').click();

    cy.wait('@legalFiles');

    cy.get('[data-testid="transaction3-link-invoice-button"]').click();

    cy.contains('Veuillez sélectionner une facture');
    cy.contains('ou importer un document');

    const file = 'cypress/fixtures/test_image.jpg';

    cy.get('#attachment-input').invoke('show').selectFile(file).invoke('hide');

    cy.get('#link-invoice-button-id').click();
    cy.wait('@supportingDocuments');
    cy.contains('Document ajouté avec succès.');
    cy.wait('@getTransactionsWithSupportingDoc');

    cy.get('#document-button-transaction3').click();
    cy.contains('Justificatif');
    cy.get('[data-testid="ClearIcon"]').click();
    cy.contains('Vue mensuelle');
  });

  it('Filter transaction by label', () => {
    mount(<App />);
    cy.get('[name="transactions"]').click();

    const labelToSearch = 'to search';
    cy.intercept('GET', '/accounts/mock-account-id1/transactions?label=to+search&page=1&pageSize=15', req => {
      expect(req.query.label).eq(labelToSearch);
      req.reply(transactions);
    });

    cy.get("[name='label']").type(labelToSearch);
  });

  it('should generate export transactions link and send email', () => {
    const currentDate = new Date();
    const from = '2023-03-15';
    const to = '2023-11-01';
    cy.intercept('POST', '/accounts/mock-account-id1/transactions/exportLink', transactionExportLinkResponse).as('generateExportTransactionsLink');
    cy.intercept('PUT', '/users/mock-user-id1/emails', createEmailResponse).as('sendEmails');

    mount(<App />);
    cy.get('[name="transactions"]').click();
    cy.contains('Export comptable').click();
    // tester l'ouverture et la fermeture du GenerateLinkModal
    cy.contains('Choisissez votre période de transaction à communiquer à votre comptable');
    cy.get('[type="submit"]').click();
    cy.contains('Ce champ est requis');
    cy.get('[name="generate-link-modal-cancel-button"]').click();
    cy.contains('Choisissez votre période de transaction à communiquer à votre comptable').should('not.exist');
    // exécuter la requete pour générer le lien du téléchargement
    cy.contains('Export comptable').click();
    cy.get('input[name="from"]').type(`${currentDate.getFullYear() + 1}-03-15`);
    cy.contains("La date d'émission doit être antérieure ou égale à la date d’aujourd’hui");
    cy.get('input[name="from"]').invoke('removeAttr').type(from);
    cy.get('input[name="to"]').type(to);
    cy.get('[type="submit"]').click();
    cy.wait('@generateExportTransactionsLink').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
    cy.contains('Envoi de mail');
    // On test le form mail
    cy.get('[type="submit"]').click();
    cy.contains('Ce champ est requis.');
    cy.get('[name="recipient"]').type('dummy{enter}');
    cy.contains('Email non valide');
    cy.get('[name="recipient"]').invoke('removeAttr').type('dummy@gmail.com');
    cy.get('[type="submit"]').click();
    cy.wait('@sendEmails').then(interception => {
      const responseStatus = interception.response.statusCode;
      expect(responseStatus).to.equal(200);
    });
    cy.contains('Votre mail a été envoyé avec succès');
  });
});
