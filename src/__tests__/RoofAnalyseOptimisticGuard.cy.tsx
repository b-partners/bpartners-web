import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch, useOptimisticCreditBalanceStore } from '@/common/store';
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
      Lancer l’analyse
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

const interceptBalance = (balance: CreditBalance) => cy.intercept('GET', CREDIT_BALANCE_URL, balance).as('getCreditBalance');

const optimisticSpendable = () => useOptimisticCreditBalanceStore.getState().balance?.spendableCredits;

describe('useRoofAnalyseGeneration — garde optimiste sur le solde', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.intercept('POST', '**', req => {
      if (req.url.includes('/detections/')) return;
      req.reply(mercatorResponse);
    }).as('pointsToGeoPoints');
    cy.intercept('PUT', '**/city-jsons/*/process', {}).as('processCityJson');
    cy.then(() => {
      localStorage.setItem('bp_user_api_key', 'dummy');
      useAnnotatorComponentStore.getState().reset();
      annotatorStore.useAnnotatorStore.getState().reset();
      useOptimisticCreditBalanceStore.getState().clear();
      useAnnotatorScreenSwitch.getState().setScreen('roof-analyse');
      useAnnotatorComponentStore.getState().setAreaPictureDetails(areaPictureDetails);
      useAnnotatorComponentStore.getState().setAnalyseImageUrl('blob:analyse-image');
      annotatorStore.useAnnotatorStore.getState().setAnnotations({ [ROOF_ID]: roofAnnotation });
    });
  });

  afterEach(() => useOptimisticCreditBalanceStore.getState().clear());

  it('bloque une nouvelle analyse quand le cache optimiste est épuisé alors que l’API est encore périmée', () => {
    useOptimisticCreditBalanceStore.getState().setBalance({ spendableCredits: 0, grantedCredits: 0, purchasedCredits: 0, creditCostPerAnalysis: 10 });
    interceptBalance({ spendableCredits: 10, grantedCredits: 10, purchasedCredits: 0, creditCostPerAnalysis: 10, estimatedRemainingAnalyses: 1 });
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@getCreditBalance');
    cy.wait(500);
    cy.get('@processDetection.all').should('have.length', 0);
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'le cache reste à zéro').to.eq(0));
  });

  it('autorise et enchaîne les débits depuis le cache tant que l’API n’est pas à jour', () => {
    interceptBalance({ spendableCredits: 20, grantedCredits: 20, purchasedCredits: 0, creditCostPerAnalysis: 10, estimatedRemainingAnalyses: 2 });
    interceptDetection();

    mountHarness();

    cy.get('[data-cy=run-analyse]').click();
    cy.wait('@processDetection');
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'premier débit depuis l’API').to.eq(10));

    cy.wait(300);
    cy.get('[data-cy=run-analyse]').click();
    cy.wait('@processDetection');
    cy.wrap(null).should(() => expect(optimisticSpendable(), 'second débit chaîné depuis le cache, pas depuis l’API périmée').to.eq(0));

    cy.get('@processDetection.all').should('have.length', 2);
  });
});
