import { annotatorStore } from '@/common/store';
import { calculateGlobalRate } from '@/operations/annotator/utils';

const ROOF_POLYGON_ID = 'roof-analyse-1';

const roofAnalyseAnnotation = (annotationInfos: { wearLevel?: number; moldRate?: number; humidityLevel?: number }) => ({
  isFirst: true,
  polygon: { id: ROOF_POLYGON_ID, points: [] as { x: number; y: number }[], fillColor: '', strokeColor: '' },
  annotationInfos: { labelType: 'roof' as const, polygonId: ROOF_POLYGON_ID, ...annotationInfos },
  screen: 'roof-analyse' as const,
});

const Harness = () => {
  const globalRate = calculateGlobalRate();
  return <div data-cy='global-rate'>{globalRate === null ? 'null' : JSON.stringify(globalRate)}</div>;
};

describe('calculateGlobalRate', () => {
  beforeEach(() => {
    annotatorStore.useAnnotatorStore.getState().reset();
  });

  it('returns null when there is no annotation at all', () => {
    cy.mount(<Harness />);

    cy.get('[data-cy=global-rate]').should('have.text', 'null');
  });

  it('returns null when annotations exist but none is a roof-analyse roof annotation', () => {
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': {
        isFirst: true,
        polygon: { id: 'pan-1', points: [], fillColor: '', strokeColor: '' },
        annotationInfos: { labelType: 'pan', polygonId: 'pan-1' },
        screen: 'annotator',
      },
      '1': {
        isFirst: false,
        polygon: { id: 'roof-annotator-1', points: [], fillColor: '', strokeColor: '' },
        annotationInfos: { labelType: 'roof', polygonId: 'roof-annotator-1' },
        screen: 'annotator',
      },
    });

    cy.mount(<Harness />);

    cy.get('[data-cy=global-rate]').should('have.text', 'null');
  });

  it('returns the calculated value and type when a roof-analyse roof annotation exists', () => {
    // globalRate = 0.4 * 10 (wear) + 0.8 * 5 (mold) + 1.0 * 2 (humidity) = 10
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': roofAnalyseAnnotation({ wearLevel: 10, moldRate: 5, humidityLevel: 2 }),
    });

    cy.mount(<Harness />);

    cy.get('[data-cy=global-rate]').should('have.text', JSON.stringify({ value: 10, type: 'B' }));
  });

  it('defaults missing rates to 0 and returns the lowest degradation type', () => {
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': roofAnalyseAnnotation({}),
    });

    cy.mount(<Harness />);

    cy.get('[data-cy=global-rate]').should('have.text', JSON.stringify({ value: 0, type: 'A' }));
  });
});
