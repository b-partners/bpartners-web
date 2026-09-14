import {
  annotatorStore,
  useAnalyseCreditPopupStore,
  useAnnotatorComponentStore,
  useAnnotatorScreenSwitch,
  useOptimisticCreditBalanceStore,
} from '@/common/store';
import { useRoofAnalyseGeneration } from '@/operations/annotator/utils';
import { CreditBalance } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { areaPictures } from './mocks/responses';
import { user1 } from './mocks/responses/security-api';

const ROOF_ID = 'roof-2d-polygon';
const CREDIT_BALANCE_URL = `/users/${user1.id}/creditBalance`;

const areaPictureDetails = {
  ...areaPictures,
  actualLayer: { ...areaPictures.actualLayer, precisionLevelInCm: 5 },
};

const roofAnnotation: any = {
  isFirst: true,
  screen: 'annotator',
  polygon: {
    id: ROOF_ID,
    points: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 100, y: 300 },
    ],
    fillColor: 'rgba(0,0,0,0.2)',
    strokeColor: 'rgb(0,0,0)',
  },
  annotationInfos: { polygonId: ROOF_ID, labelType: 'roof', labelName: 'Polygon A' },
};

const mercatorResponse = {
  'roof.jpg': {
    regions: {
      '1': {
        shape_attributes: {
          all_points_x: [46.5, 46.6, 46.7, 46.5],
          all_points_y: [-1.79, -1.78, -1.77, -1.79],
        },
      },
    },
  },
};

const detectionResponse = {
  geoJsonZone: [{ properties: { vgg_file_url: 'https://s3.example.com/vgg.json', original_image_url: 'https://s3.example.com/original.png' } }],
  roofDelimiter: { polygon: [] as number[][] },
  imageTileInfoOrigin: { coordinates: { x: 0, y: 0 }, size: { width: 1024 } },
};

const Harness = () => {
  const { runAnalyse } = useRoofAnalyseGeneration();
  return (
    <button data-cy='run-analyse' onClick={runAnalyse}>
      Run analysis
    </button>
  );
};

const mountHarness = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
};

const interceptDetection = () => cy.intercept('POST', '**/detections/*/sync', detectionResponse).as('processDetection');

const interceptDetectionsByZone = (exists: boolean) =>
  cy.intercept({ method: 'GET', url: /\/detections\?/ }, exists ? [detectionResponse] : []).as('detectionsByZone');

const interceptBalance = (balance: CreditBalance) => cy.intercept('GET', CREDIT_BALANCE_URL, balance).as('getCreditBalance');

const optimisticSpendable = () => useOptimisticCreditBalanceStore.getState().balance?.spendableCredits;

describe('useRoofAnalyseGeneration — optimistic balance guard', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('POST', '**', req => {
      if (req.url.includes('/detections/')) return;
      req.reply(mercatorResponse);
    }).as('pointsToGeoPoints');
    cy.intercept('PUT', '**/city-jsons/*/process', {}).as('processCityJson');
    interceptDetectionsByZone(false);
    cy.then(() => {
      localStorage.setItem('bp_user_api_key', 'dummy');
      useAnnotatorComponentStore.getState().reset();
      annotatorStore.useAnnotatorStore.getState().reset();
      useOptimisticCreditBalanceStore.getState().clear();
      useAnalyseCreditPopupStore.setState({ armed: false, visible: false, credits: undefined, willDebit: true });
      useAnnotatorScreenSwitch.getState().setScreen('roof-analyse');
      useAnnotatorComponentStore.getState().setAreaPictureDetails(areaPictureDetails);
      useAnnotatorComponentStore.getState().setAnalyseImageUrl('blob:analyse-image');
      annotatorStore.useAnnotatorStore.getState().setAnnotations({ [ROOF_ID]: roofAnnotation });
    });
  });

  afterEach(() => useOptimisticCreditBalanceStore.getState().clear());

  it('blocks a new analysis when the optimistic cache is exhausted while the API is still stale', () => {
    useOptimisticCreditBalanceStore.getState().setBalance({ spendableCredits: 0, grantedCredits: 0, purchasedCredits: 0, creditCostPerAnalysis: 10 });
    interceptBalance({ spendableCredits: 10, grantedCredits: 10, purchasedCredits: 0, creditCostPerAnalysis: 10, estimatedRemainingAnalyses: 1 });
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@getCreditBalance');
    cy.wait(500);
    cy.get('@processDetection.all').should('have.length', 0);
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'the cache stays at zero').to.eq(0));
  });

  it('allows and chains debits from the cache while the API is not up to date', () => {
    interceptBalance({ spendableCredits: 20, grantedCredits: 20, purchasedCredits: 0, creditCostPerAnalysis: 10, estimatedRemainingAnalyses: 2 });
    interceptDetection();

    mountHarness();

    cy.get('[data-cy=run-analyse]').click();
    cy.wait('@processDetection');
    cy.wrap(null).should(() => {
      expect(optimisticSpendable(), 'first debit from the API').to.eq(10);
      expect(useAnalyseCreditPopupStore.getState().armed, 'banner armed on a real debit').to.eq(true);
    });

    cy.wait(300);
    cy.get('[data-cy=run-analyse]').click();
    cy.wait('@processDetection');
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'second debit chained from the cache, not from the stale API').to.eq(0));

    cy.get('@processDetection.all').should('have.length', 2);
  });

  it('ne débite pas le cache et n’arme pas la bannière quand une détection existe déjà pour la même adresse', () => {
    interceptDetectionsByZone(true);
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@processDetection');
    cy.get('@processDetection.all').should('have.length', 1);
    cy.wrap(null).should(() => {
      expect(optimisticSpendable(), 'aucun débit optimiste sur une même adresse').to.eq(undefined);
      expect(useAnalyseCreditPopupStore.getState().armed, 'bannière non armée sur une même adresse').to.eq(false);
    });
  });

  it('autorise la ré-analyse d’une même adresse même quand le crédit optimiste est épuisé (garde bypassé)', () => {
    useOptimisticCreditBalanceStore.getState().setBalance({ spendableCredits: 0, grantedCredits: 0, purchasedCredits: 0, creditCostPerAnalysis: 10 });
    interceptDetectionsByZone(true);
    interceptBalance({ spendableCredits: 0, grantedCredits: 0, purchasedCredits: 0, creditCostPerAnalysis: 10, estimatedRemainingAnalyses: 0 });
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@processDetection');
    cy.get('@processDetection.all').should('have.length', 1);
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'le cache reste inchangé à zéro').to.eq(0));
  });
});
