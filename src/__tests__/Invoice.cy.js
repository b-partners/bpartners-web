import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1 } from './mocks/responses/security-api';
import { accounts1, accountHolders1 } from './mocks/responses/account-api';
import { invoiceRelaunch1, invoiceRelaunch2 } from './mocks/responses/invoice-relaunch-api';
import { products1 } from './mocks/responses/product-api';
import { customers1 } from './mocks/responses/customer-api';
import { invoices1 } from './mocks/responses/invoices-api';

describe(specTitle('Frequency relaunch'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
    cy.then(async () => await authProvider.login('dummy', 'dummy', { redirectionStatusUrls: { successurl: 'dummy', FailureUrl: 'dummy' } }));
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch1).as('getInvoiceRelaunch1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoiceRelaunch`, invoiceRelaunch2).as('getInvoiceRelaunch2');
    cy.intercept('GET', '/accounts/mock-account-id1/customers', customers1).as('getCustomers');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/products?unique=true`, products1).as('getProducts1');
    cy.intercept('PUT', `/accounts/mock-account-id1/invoices/*`, [{}]).as('crupdate1');
    cy.intercept('GET', `/accounts/mock-account-id1/invoices?page=1&pageSize=10`, invoices1).as('getInvoices1');
  });

  it('Should show an error message', () => {
    mount(<App />);

    cy.get(':nth-child(2) > .MuiListItem-root > .RaMenuItemCategory-link').click();
    cy.get('[type="submit"]').click();

    cy.contains('Ce champ est requis');
  });

  it('Should add invoice/quote', () => {
    mount(<App />);

    cy.get(':nth-child(2) > .MuiListItem-root > .RaMenuItemCategory-link').click();
    cy.get('.makeStyles-formControl-17 > :nth-child(1) > .MuiInputBase-root > .MuiInputBase-input').type('Title');
    cy.get(':nth-child(2) > .MuiInputBase-root > .MuiInputBase-input').type('ref1');
    cy.get(':nth-child(3) > .MuiInputBase-root > .MuiInputBase-input').invoke('removeAttr', 'type').type('01-10-2020');
    cy.get(':nth-child(4) > .MuiInputBase-root > .MuiInputBase-input').invoke('removeAttr', 'type').type('05-10-2020');
    cy.get('div.MuiBox-root.MuiBox-root-20 > div.MuiFormControl-root.makeStyles-formControl-19').click();
    cy.get('[data-value="customer2"]').click();
    cy.get(`div.MuiBox-root.MuiBox-root-23 > button`).click();
    cy.get(`.MuiInputBase-root > #product-selection-id`).click();
    cy.get('[data-value="product2_id"]').click();
    cy.get(`div.MuiBox-root.MuiBox-root-23 > button`).click();
    cy.get(`.MuiInputBase-root > #product-selection-id`).click();
    cy.get('.MuiList-root > [tabindex="0"]').click();
    cy.get(`:nth-child(1) > .MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input`).type(0);
    cy.get(`:nth-child(2) > .MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input`).type(0);

    cy.contains('36.00€');
    cy.get(`[type="submit"]`).click();

    cy.contains('Facture bien enregistré');
  });

  it('Should edit an invoice', () => {
    mount(<App />);

    cy.get(':nth-child(1) > .column-undefined > .MuiTypography-root > .MuiBox-root > [title="modifier"]').click();
    cy.get(':nth-child(1) > .MuiCardHeader-root > .MuiCardHeader-action > .MuiButtonBase-root').click();
    cy.get('.MuiCardActions-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputBase-input').type(0);

    cy.contains('24.00€');

    cy.get('[type="submit"]').click();

    cy.contains('Facture bien enregistré');
  });
});
