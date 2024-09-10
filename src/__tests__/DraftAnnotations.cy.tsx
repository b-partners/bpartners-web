import App from '@/App';
import { Redirect } from '@/common/utils';
import { InvoiceStatus } from '@bpartners/typescript-client';
import {
  account1,
  accountHolder1,
  accountHolders1,
  accounts1,
  draftAnnotationOneAreaPicture,
  draftAnnotations,
  getInvoices,
  prospectOne,
  prospects,
  whoami1,
} from './mocks/responses';

describe('draft-annotations view', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList = '', page } = req.query;
      req.reply(getInvoices((page as number) - 1, pageSize as number, (statusList as string).split(',') as InvoiceStatus[]));
    });
    cy.stub(Redirect, 'toURL').as('toURL');
  });

  it('Can list all drafts annotations', () => {
    cy.intercept('GET', `/accounts/${account1.id}/annotations/drafts*`, draftAnnotations).as('getDraftAnnotations');
    cy.intercept('GET', `/accountHolders/${accountHolder1.id}/prospects`, prospects).as('getProspects');
    cy.intercept('GET', `/accountHolders/${accountHolder1.id}/prospects/${draftAnnotationOneAreaPicture.prospectId}`, prospectOne).as(
      'getDraftAnnotationOneProspect'
    );
    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name=prospects]').click();
    cy.get('[data-cy="drafts-tab"]').click();
    cy.wait('@getDraftAnnotations');
    cy.wait('@getDraftAnnotationOneProspect');

    cy.contains(prospectOne.name);
    cy.contains(prospectOne.address);
    cy.get('[data-cy="draft-item"]').should('have.length', draftAnnotations.length);
  });

  it('Can show empty drafts annotations', () => {
    cy.intercept('GET', `/accounts/${account1.id}/annotations/drafts*`, []).as('getDraftAnnotations');
    cy.intercept('GET', `/accountHolders/${accountHolder1.id}/prospects`, prospects).as('getProspects');
    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name=prospects]').click();
    cy.get('[data-cy="drafts-tab"]').click();
    cy.wait('@getDraftAnnotations');
    cy.contains('Pas encore de Prospect avec brouillon.');
  });
});
