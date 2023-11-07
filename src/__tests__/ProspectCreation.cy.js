import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { prospects, createdProspect } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { InvoiceStatus } from 'bpartners-react-client';

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

  it('should create a TO_CONTACT prospect', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    cy.intercept('PUT', `/accountHolders/mock-accountHolder-id1/prospects`, req => {
      const response = req.body;
      delete response[0].id;
      expect(response).deep.eq([createdProspect]);
      req.reply(req.body);
    }).as('createProspect');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');
    cy.get('.css-69i1ev > .MuiButtonBase-root').click();

    cy.get('[data-testid="email-field-input"] > .MuiInputBase-root').type('doejhonson@gmail.com');
    cy.get('[data-testid="phone-field-input"] > .MuiInputBase-root').type('+261340465399');
    cy.get('[data-testid="address-field-input"] > .MuiInputBase-root').type('Evry');
    cy.get('[data-testid="name-field-input"] > .MuiInputBase-root').type('Doe Jhonson');
    cy.get('[data-testid="defaultComment-field-input"] > .MuiInputBase-root').type('create comment');

    cy.get('[data-testid="autocomplete-backend-for-invoice"] > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('invoice-title-1').click();

    cy.get('[data-testid="contractAmount-field-input"] > .MuiInputBase-root').type('91');

    cy.contains('Créer').click();

    cy.wait('@createProspect');
  });
});
