import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { contactedProspect, prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Prospects.Actions'), () => {
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

  it('are displayed', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');

    cy.contains('À contacter');
    cy.contains('Contactés');
    cy.contains('Convertis');

    cy.contains(/John Doe/gi);
    cy.contains('johnDoe@gmail.com');
    cy.contains('+261340465338');
    cy.contains('30 Rue de la Montagne Sainte-Genevieve');
    cy.contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
    cy.contains('10.00');
    cy.contains('6.00');

    // test filter prospect by name
    const filterName = 'to search';
    cy.intercept('GET', '/accountHolders/mock-accountHolder-id1/prospects?name=to+search', req => {
      expect(req.query.name).eq(filterName);
      req.reply([contactedProspect, ...prospects.slice(1)]);
    }).as('filterProspect');
    cy.get("[data-testid='prospect-filter']").type(filterName);
    cy.wait('@filterProspect');
  });
});
