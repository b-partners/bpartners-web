import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { useGlobalRateQuery } from '@/operations/annotator/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const ROOF_POLYGON_ID = 'roof-analyse-1';

const roofAnalyseAnnotation = (annotationInfos: { wearLevel?: number; moldRate?: number; humidityLevel?: number }) => ({
  isFirst: true,
  polygon: { id: ROOF_POLYGON_ID, points: [] as { x: number; y: number }[], fillColor: '', strokeColor: '' },
  annotationInfos: { labelType: 'roof' as const, polygonId: ROOF_POLYGON_ID, ...annotationInfos },
  screen: 'roof-analyse' as const,
});

const Harness = () => {
  const globalRate = useGlobalRateQuery();
  return <div data-cy='global-rate'>{globalRate === null ? 'null' : JSON.stringify(globalRate)}</div>;
};

const mountHarness = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
};

describe('useGlobalRateQuery', () => {
  beforeEach(() => {
    annotatorStore.useAnnotatorStore.getState().reset();
    useAnnotatorComponentStore.getState().reset();
    cy.clearAllLocalStorage();
    cy.then(() => localStorage.setItem('bp_user_api_key', 'dummy'));
  });

  it('returns null when there is no annotation at all', () => {
    mountHarness();

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

    mountHarness();

    cy.get('[data-cy=global-rate]').should('have.text', 'null');
  });

  it('shows the backend-computed value once /roof/overallScore resolves', () => {
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': roofAnalyseAnnotation({ wearLevel: 10, moldRate: 5, humidityLevel: 2 }),
    });

    cy.intercept('GET', '**/roof/overallScore**', req => {
      expect(req.query.usureRate).to.eq('10');
      expect(req.query.moisissureRate).to.eq('5');
      expect(req.query.humiditeRate).to.eq('2');
      req.reply({ score: 15, category: 'C' });
    }).as('getRoofScore');

    mountHarness();

    cy.wait('@getRoofScore');
    cy.get('[data-cy=global-rate]').should('have.text', JSON.stringify({ value: 15, type: 'C' }));
  });

  it('falls back to the local formula when the backend call fails', () => {
    // local fallback = 0.4 * 10 (wear) + 0.8 * 5 (mold) + 1.0 * 2 (humidity) = 10
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': roofAnalyseAnnotation({ wearLevel: 10, moldRate: 5, humidityLevel: 2 }),
    });

    cy.intercept('GET', '**/roof/overallScore**', { statusCode: 500, body: {} }).as('getRoofScoreFailure');

    mountHarness();

    cy.wait('@getRoofScoreFailure');
    cy.get('[data-cy=global-rate]').should('have.text', JSON.stringify({ value: 10, type: 'B' }));
  });

  it('defaults missing rates to 0 and returns the lowest degradation type while loading', () => {
    annotatorStore.useAnnotatorStore.getState().setAnnotations({
      '0': roofAnalyseAnnotation({}),
    });

    cy.intercept('GET', '**/roof/overallScore**', { score: 0, category: 'A' }).as('getRoofScoreDefault');

    mountHarness();

    cy.get('[data-cy=global-rate]').should('have.text', JSON.stringify({ value: 0, type: 'A' }));
  });
});
