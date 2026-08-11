import { saveImageToCache } from '@/common/utils/indexed-db-image-cache';
import { resolveAnalyseImageBase64 } from '@/operations/annotator/utils/use-crop-polygon';

const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAen63NgAAAAASUVORK5CYII=';
const DETECTION_IMAGE_URL = '/mock/original-image.png';

const pngBytes = () => Cypress.Buffer.from(PNG_B64, 'base64');
const pngBlob = () => new Blob([Cypress.Buffer.from(PNG_B64, 'base64')], { type: 'image/png' });

const clearImageCache = () =>
  new Promise<void>(resolve => {
    const request = indexedDB.deleteDatabase('bpartners-image-cache');
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });

describe('resolveAnalyseImageBase64 — image de détection pour les résultats d’analyse', () => {
  beforeEach(() => {
    cy.then(() => clearImageCache());
  });

  it('utilise l’image de original_image_url (image issue de la détection) quand elle est disponible', () => {
    cy.intercept('GET', DETECTION_IMAGE_URL, { statusCode: 200, headers: { 'content-type': 'image/png' }, body: pngBytes() }).as('getDetectionImage');

    cy.then(() => resolveAnalyseImageBase64(DETECTION_IMAGE_URL, 'analyse-image-file')).then(result => {
      expect(result).to.match(/^data:image\//);
    });
    cy.get('@getDetectionImage.all').should('have.length', 1);
  });

  it('retombe sur l’image de détection persistée quand original_image_url renvoie 403 (URL expirée)', () => {
    cy.intercept('GET', DETECTION_IMAGE_URL, { statusCode: 403, body: 'AccessDenied' }).as('getDetectionImage');

    cy.then(() => saveImageToCache('analyse-image-file', pngBlob()));
    cy.then(() => resolveAnalyseImageBase64(DETECTION_IMAGE_URL, 'analyse-image-file')).then(result => {
      expect(result).to.match(/^data:image\//);
    });
  });

  it('utilise l’image de détection persistée quand aucune original_image_url n’est fournie', () => {
    cy.then(() => saveImageToCache('analyse-image-file', pngBlob()));
    cy.then(() => resolveAnalyseImageBase64(undefined, 'analyse-image-file')).then(result => {
      expect(result).to.match(/^data:image\//);
    });
  });

  it('renvoie une chaîne vide quand l’URL échoue et qu’aucune image de détection n’est persistée', () => {
    cy.intercept('GET', DETECTION_IMAGE_URL, { statusCode: 403, body: 'AccessDenied' }).as('getDetectionImage');

    cy.then(() => resolveAnalyseImageBase64(DETECTION_IMAGE_URL, 'missing-analyse-image-file')).then(result => {
      expect(result).to.equal('');
    });
  });
});
