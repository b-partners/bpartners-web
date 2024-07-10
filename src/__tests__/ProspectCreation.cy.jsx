import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import { Redirect, Reload } from '../common/utils';
import {
  accountHolders1,
  accounts1,
  areaPictures,
  areaPicturesBuildingZoom,
  areaPicturesBuildingZoomTousFrLayer,
  areaPicturesBuildingZoomTousFrLayerExtended,
  createdProspect,
  getInvoices,
  prospects,
  whoami1,
} from './mocks/responses';
import { PathVariable } from './mocks/utilities';

let fileId = null;

describe(specTitle('Prospects'), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const couvreurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, couvreurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPictures);
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPictures).as('createImageToAnnotate');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=dummy&fileType=AREA_PICTURE`, { fixture: 'test-annotator-image.jpeg' }).as(
      'getAddressImage'
    );
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

    cy.stub(Redirect, 'toURL').as('toURL');
    cy.stub(Reload, 'force').as('reload');
  });

  it.skip('should create a TO_CONTACT prospect', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');

    cy.intercept('PUT', `/accountHolders/mock-accountHolder-id1/prospects`, req => {
      const response = req.body;
      delete response[0].id;
      expect(response).deep.eq([createdProspect]);
      req.reply(req.body);
    }).as('createProspect');

    cy.mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();

    cy.wait('@getProspects');
    cy.get('.css-69i1ev > .MuiButtonBase-root').click();

    cy.contains('Créer').click();
    cy.contains('Ce champ est requis');

    cy.get('[data-testid="email-field-input"] > .MuiInputBase-root').type(createdProspect.email);
    cy.get('[data-testid="phone-field-input"] > .MuiInputBase-root').type(createdProspect.phone);
    cy.get('[data-testid="address-field-input"] > .MuiInputBase-root').type(createdProspect.address);
    cy.get('[data-testid="name-field-input"] > .MuiInputBase-root').type(createdProspect.name);
    cy.get('[data-testid="firstName-field-input"] > .MuiInputBase-root').type(createdProspect.firstName);
    cy.get('[data-testid="defaultComment-field-input"] > .MuiInputBase-root').type(createdProspect.defaultComment);

    cy.get('[data-testid="autocomplete-backend-for-invoice"] > .MuiFormControl-root > .MuiInputBase-root').click();
    cy.contains('invoice-title-1').click();

    cy.get('[data-testid="contractAmount-field-input"] > .MuiInputBase-root').type('91');

    cy.contains('Créer').click();

    cy.wait('@createProspect');
    cy.contains('Prospect créé avec succès !');
    cy.wait('@createImageToAnnotate').then(({ request }) => {
      const expectedPayload = {
        address: createdProspect.address,
        fileId: request.body.fileId,
        filename: `Layer ${createdProspect.address}`,
        zoomLevel: 'HOUSES_0',
        prospectId: request.body.prospectId,
      };
      expect(request.body).to.deep.equal(expectedPayload);
    });
    cy.wait('@getAddressImage').then(({ request }) => {
      const { url } = request;
      fileId = PathVariable.getFileId(url);
    });

    // should be in the annotator page
    cy.contains('x : 0');
    cy.contains('y : 0');
    // should show nothing cause there is no annotation done
    cy.contains("Aucune annotation n'a encore été effectuée.");

    // default value of zoom
    cy.contains('Parcelle cadastrale');
    // default value of image source
    cy.contains('vendee 2023 20cm');
    cy.contains("Source de l'image: vendee, 20cm, 2023");

    // change zoom
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoom).as('createImageToAnnotate2');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoom);
    cy.get(':nth-child(1) > .MuiInputBase-root > #dynamic-select').click();
    cy.contains('Quartier').click();
    cy.wait('@createImageToAnnotate2').then(({ request }) => {
      expect(request.body.zoomLevel).to.equal('BUILDING');
    });
    cy.wait('@getAddressImage').then(({ request }) => {
      const { url } = request;
      const newFileId = PathVariable.getFileId(url);
      expect(fileId).not.equal(newFileId);
      fileId = newFileId;
    });

    // change image source
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoomTousFrLayer).as('createImageToAnnotate3');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoomTousFrLayer);
    cy.get(':nth-child(2) > .MuiInputBase-root > #dynamic-select').click();
    cy.contains('tous_fr 0 20cm').click();
    cy.wait('@createImageToAnnotate3').then(({ request }) => {
      expect(request.body.layerId).to.equal('2cb589c1-45b0-4cb8-b84e-f1ed40e97bd8');
    });
    cy.wait('@getAddressImage').then(({ request }) => {
      const { url } = request;
      const newFileId = PathVariable.getFileId(url);
      expect(fileId).not.equal(newFileId);
      fileId = newFileId;
    });

    // Check if all the fields have been properly updated.
    cy.contains('Quartier');
    cy.contains('tous_fr 0 20cm');

    // Refocus the image.
    cy.get('[data-testid="center-img-btn"]').click();
    cy.contains("Recentrer l'image");
    cy.contains('Attention! Toutes les annotations seront tous supprimé.');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoomTousFrLayerExtended);
    cy.get('.MuiDialogActions-root > .MuiButton-contained').click();
    cy.get('@reload').should('have.been.calledOnce');
    cy.get('[data-testid="center-img-btn"]').should('be.disabled');

    // Draw annotation
    cy.get('[data-cy="annotator-canvas-cursor"]').click(600, 200, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(700, 200, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(700, 300, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(600, 200, { force: true });

    // change label
    cy.get('#labelType').click();
    cy.contains('Toit').click();

    cy.contains('Surface');

    // specify covering
    cy.get('#covering').click();
    cy.contains('Béton').click();

    // specify slope
    cy.get('#demo-simple-select').click();
    cy.get("img[aria-label='Pente 1/12']").click();

    // specify wear
    cy.get('#wear').click();
    cy.contains('1. Minime').click();

    // specify wearLevel
    cy.get('#wearLevel').click();
    cy.contains('10').click();

    // specify moldRate
    cy.get('#moldRate').click(0);
    cy.contains('50').click();

    cy.get('[data-testid="ExpandMoreIcon"]').click();
  });
});
