import App from '@/App';
import { Redirect } from '@/common/utils';
import { customers } from '@/operations/customers';
import { InvoiceStatus } from '@bpartners/typescript-client';
import {
  account1,
  accountHolder1,
  accountHolders1,
  accounts1,
  annotations,
  areaPicture1,
  draftAnnotationOne,
  draftAnnotations,
  getInvoices,
  prospectOne,
  prospects,
  whoami1,
} from './mocks/responses';

describe('annotation-export view', () => {
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

  it('should redirect one export page if submit export and redirect back to annotator', () => {
    cy.intercept('GET', `/accounts/${account1.id}/annotations/drafts*`, draftAnnotations).as('getDraftAnnotations');
    cy.intercept('GET', `/accounts/${account1.id}/areaPictures/${areaPicture1.id}/annotations/drafts*`, draftAnnotations).as('getDraftAreaPictureAnnotaitons');
    cy.intercept('GET', `/accountHolders/${accountHolder1.id}/prospects*`, prospects).as('getProspects');
    cy.intercept('GET', `/accountHolders/${accountHolder1.id}/prospects/${areaPicture1.prospectId}`, prospectOne).as('getDraftAnnotationOneProspect');
    cy.intercept('GET', `/accounts/${account1.id}/areaPictures/${areaPicture1.id}`, areaPicture1).as('getAreaPicture1');
    cy.intercept('PUT', `/accounts/${account1.id}/areaPictures/${areaPicture1.id}/annotations/${draftAnnotationOne.id}`, draftAnnotationOne).as(
      'annotateAreaPicture'
    );
    cy.intercept('GET', `/accounts/${account1.id}/customers*`, customers).as('getCustomers');
    cy.intercept('GET', `/accounts/${account1.id}/areaPictures/${areaPicture1.id}/annotations`, annotations).as('getAreaPictureAnnotaitons');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.getByName('prospects').click();
    cy.getByDataCy('drafts-tab').click();
    cy.wait('@getDraftAnnotations');
    cy.wait('@getDraftAnnotationOneProspect');

    cy.getByDataCy('finish-draft-btn').first().click();
    cy.wait('@getDraftAreaPictureAnnotaitons');
    cy.getByTestId('submit-annotation-export').click();

    cy.getByTestId('export-pdf-title').contains(prospectOne.address);
    cy.contains(draftAnnotationOne.annotations[0].labelName);
    cy.getByTestId('go-back-to-annotator-btn').click();
    cy.wait('@getDraftAreaPictureAnnotaitons');
    cy.getByTestId('submit-annotation-export').should('be.visible');
  });
});
