import App from '@/App';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { Redirect } from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { prospects, updatedProspects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle('Prospects'), () => {
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

  it('should edit a prospect', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');

    cy.get('[data-testid="edit-prospect1_id"]').click();
    cy.get('[data-testid="edit-prospect-prospect1_id"]').click();

    const updatedProspect = {
      ...prospects[0],
      name: 'Doe Jhonson',
      comment: 'Update comment',
      phone: '+261340465399',
      email: 'doejhonson@gmail.com',
      contractAmount: '',
    };

    updatedProspect.rating.lastEvaluation = updatedProspect.rating.lastEvaluation.toISOString();

    cy.intercept('PUT', `/accountHolders/${accountHolders1[0].id}/prospects/${prospects[0].id}`, req => {
      expect(req.body).deep.eq(updatedProspect);

      req.reply(req.body);
    }).as('updateProspect');

    cy.get('[data-testid="email-field-input"] > .MuiInputBase-root').clear().type('doejhonson@gmail.com');
    cy.get('[data-testid="phone-field-input"] > .MuiInputBase-root').clear().type('+261340465399');
    cy.get('[data-testid="name-field-input"] > .MuiInputBase-root').clear().type('Doe Jhonson');
    cy.get('[data-testid="comment-field-input"] > .MuiInputBase-root').clear().type('Update comment');

    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, updatedProspects).as('getupdatedProspects');
    cy.get('.MuiDialogActions-root > :nth-child(2)').click();

    cy.wait('@updateProspect');

    cy.wait('@getupdatedProspects');
    cy.contains('Prospect mis à jour avec succès !');

    cy.contains('Doe Jhonson');
    cy.contains('Update comment');
  });
});
