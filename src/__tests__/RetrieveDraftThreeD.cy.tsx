import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useRetrievePolygons } from '@/operations/invoice/utils/use-retrieve-polygons';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { AreaPictureAnnotation } from '@bpartners/typescript-client';

const PICTURE_ID = 'picture-3d-1';
const DRAFT_ID = 'draft-3d-1';
const ROOF_ANALYSE_ID = 'roof-analyse-3d-1';
const THREE_D_GENERATION_ID = 'three-d-generation-1';

const draftWithThreeD = {
  id: DRAFT_ID,
  idAreaPicture: PICTURE_ID,
  isDraft: true,
  annotations: [
    {
      id: `roof-uuid__${roofGlobalIdRef}`,
      labelName: 'Polygone A',
      labelType: 'Toit',
      polygon: {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ],
      },
      metadata: { fillColor: '#00ff0000', strokeColor: '#00ff00' },
    },
  ],
  properties: {
    roofAnalyseId: ROOF_ANALYSE_ID,
    threeDGenerationId: THREE_D_GENERATION_ID,
    threeDGenerationMode: true,
    analyseImageGenerated: false,
  },
} as unknown as AreaPictureAnnotation;

const Harness = () => {
  useRetrievePolygons(draftWithThreeD);
  const roofAnalyseId = annotatorStore.useAnnotatorStore(state => state.roofAnalyseId);
  const threeDGenerationId = annotatorStore.useAnnotatorStore(state => state.threeDGenerationId);
  const threeDFromSegmentation = annotatorStore.useAnnotatorStore(state => state.threeDFromSegmentation);
  return (
    <div>
      <div data-cy='roof-analyse-id'>{roofAnalyseId || ''}</div>
      <div data-cy='three-d-generation-id'>{threeDGenerationId || ''}</div>
      <div data-cy='three-d-mode'>{String(threeDFromSegmentation)}</div>
    </div>
  );
};

describe('useRetrievePolygons — hydratation d’un draft 2D + 3D', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.then(() => {
      window.history.replaceState({}, '', `?pictureId=${PICTURE_ID}&draftAnnotationId=${DRAFT_ID}`);
      annotatorStore.useAnnotatorStore.getState().reset();
      useAnnotatorComponentStore.getState().reset();
    });
  });

  it('hydrate roofAnalyseId, threeDGenerationId et threeDGenerationMode sans que l’un écrase l’autre', () => {
    cy.mount(<Harness />);

    cy.get('[data-cy=roof-analyse-id]').should('have.text', ROOF_ANALYSE_ID);
    cy.get('[data-cy=three-d-generation-id]').should('have.text', THREE_D_GENERATION_ID);
    cy.get('[data-cy=three-d-mode]').should('have.text', 'true');
  });

  it('conserve roofAnalyseId même quand threeDGenerationId est présent', () => {
    cy.mount(<Harness />);

    cy.get('[data-cy=three-d-generation-id]').should('have.text', THREE_D_GENERATION_ID);
    cy.get('[data-cy=roof-analyse-id]').should('not.have.text', '');
    cy.get('[data-cy=roof-analyse-id]').should('have.text', ROOF_ANALYSE_ID);
  });
});
