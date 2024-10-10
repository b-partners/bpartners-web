import App from '@/App';
import { InvoiceStatus } from '@bpartners/typescript-client';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
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
    cy.stub(Reload, 'force').as('reload');
  });

  it('should create a TO_CONTACT prospect', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects**`, prospects).as('getProspects');

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
    cy.contains('Ajouter un prospect').click();

    cy.contains('Générer l’image').click();
    cy.contains('Ce champ est requis');

    cy.get('[data-testid="email-field-input"] > .MuiInputBase-root').type(createdProspect.email);
    cy.get('[data-testid="phone-field-input"] > .MuiInputBase-root').type(createdProspect.phone);
    cy.get('[data-testid="address-field-input"] > .MuiInputBase-root').type(createdProspect.address);
    cy.get('[data-testid="name-field-input"] > .MuiInputBase-root').type(createdProspect.name);
    cy.get('[data-testid="firstName-field-input"] > .MuiInputBase-root').type(createdProspect.firstName);
    cy.get('[data-testid="defaultComment-field-input"] > .MuiInputBase-root').type(createdProspect.defaultComment);

    cy.contains('Générer l’image').click();

    cy.wait('@createProspect');
    cy.contains('Prospect créé avec succès !');
    cy.wait('@createImageToAnnotate').then(({ request }) => {
      const expectedPayload = {
        address: createdProspect.address,
        fileId: request.body.fileId,
        filename: `Layer ${createdProspect.address}`,
        zoomLevel: 'HOUSES_0',
        prospectId: request.body.prospectId,
        shiftNb: 0,
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
    cy.contains("Recentrer l'image").click();
    cy.contains('Attention! Toutes les annotations seront tous supprimé.');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoomTousFrLayerExtended);
    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, areaPicturesBuildingZoomTousFrLayerExtended);
    cy.contains('Confirmer').click();

    // Check is isExtended had an effect
    cy.contains("Réinitialiser l'image");
    cy.get(`[aria-label="Décaler l'image vers la droite"]`).should('exist');
    cy.get(`[aria-label="Décaler l'image vers la gauche"]`).should('exist');

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, req => {
      expect(req.body.shiftNb).to.eq(-1);
      req.reply({ ...areaPicturesBuildingZoomTousFrLayerExtended, shiftNb: -1 });
    });
    cy.intercept('GET', `/accounts/${accounts1[0].id}/areaPictures/**`, { ...areaPicturesBuildingZoomTousFrLayerExtended, shiftNb: -1 });
    cy.get(`[aria-label="Décaler l'image vers la droite"]`).click();
    cy.contains('Attention! Toutes les annotations seront tous supprimé.');
    cy.contains('Confirmer').click();

    cy.intercept('PUT', `/accounts/${accounts1[0].id}/areaPictures/**`, req => {
      expect(req.body.shiftNb).to.eq(0);
      req.reply({ ...areaPicturesBuildingZoomTousFrLayerExtended, shiftNb: 0 });
    });
    cy.get(`[aria-label="Décaler l'image vers la droite"]`).should('exist');
    cy.get(`[aria-label="Décaler l'image vers la gauche"]`).should('exist');

    cy.get(`[aria-label="Décaler l'image vers la gauche"]`).click();
    cy.contains('Attention! Toutes les annotations seront tous supprimé.');
    cy.contains('Confirmer').click();

    // Draw annotation
    cy.get('[data-cy="annotator-canvas-cursor"]').click(600, 200, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(700, 200, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(700, 300, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(600, 200, { force: true });
    cy.get('[data-cy="annotator-canvas-cursor"]').click(700, 200, { force: true });

    // change label
    cy.get('[data-cy="label-name-input"]').clear().type('New Label');
    cy.get('[name="0.covering"]').parent().click();

    cy.contains('Tuiles plates');
    cy.contains('Tuiles canal');
    cy.contains('Béton');
    cy.contains('Ardoise');
    cy.contains('Bardeaux bitumineux');
    cy.contains('Bacacier');
    cy.contains('Autres');
    cy.contains('Fibro-ciment').click();

    cy.contains('Surface');

    // specify slope
    cy.get('[name="0.slope"]').parent().click();
    cy.get("img[aria-label='Pente 1/12']").click();

    // specify wear
    cy.get('[name="0.wear"]').parent().click();
    cy.contains('1. Minime').click();

    // specify wearLevel
    cy.get('[name="0.wearLevel"]').parent().click();
    cy.contains('10').click();

    // specify moldRate
    cy.get('[name="0.moldRate"]').parent().click();
    cy.contains('50').click();

    cy.get('[data-testid="ExpandMoreIcon"]').click();
  });
});
