import App from '@/App';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { contactedProspect, getProspect, prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Prospects.Actions'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Carreleur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.stub(Redirect, 'toURL').as('toURL');
  });

  it('are displayed', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects**`, req => {
      const { pageSize, status = '', page } = req.query;
      req.reply(getProspect(page, pageSize, status));
    }).as('getProspects');

    cy.mount(<App />);
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
    cy.intercept('GET', '/accountHolders/mock-accountHolder-id1/prospects**', req => {
      const { pageSize, status = '', page, name } = req.query;
      expect(name).eq(filterName);
      req.reply(getProspect(page, pageSize, status));
    }).as('filterProspect');
    cy.dataCy('prospect-filter').type(filterName);
  });
});
