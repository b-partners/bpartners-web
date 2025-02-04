import App from '@/App';
import { getFileUrl, Redirect } from '@/common/utils';
import { customers } from '@/operations/customers';
import { ExportAreaPictureAnnotation, FileType, InvoiceStatus } from '@bpartners/typescript-client';
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
    cy.fixture('export-annotation.pdf', 'binary').then(document => {
      cy.intercept('POST', `/accounts/${account1.id}/annotations/exports`, document).as('exportAnnotation');
    });
    cy.stub(Redirect, 'toURL').as('toURL');
  });

  it('can export annotation to a file', () => {
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
    cy.getByTestId('submit-annotation-export').click();
    cy.get('.ra-confirm').click();
    cy.wait('@exportAnnotation').then(intersection => {
      const { areaPicture } = draftAnnotationOne;
      const { fileId } = areaPicture;
      const imageUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
      const requestBody = intersection.request.body as ExportAreaPictureAnnotation;

      expect(requestBody.address).to.be.equal(prospectOne.address);
      expect(requestBody.imageUrl).to.be.equal(imageUrl);
      expect(requestBody.annotations.length).to.be.equal(draftAnnotationOne.annotations.length);
    });
  });
});
