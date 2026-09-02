import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useRoofAnalyseGeneration } from '@/operations/annotator/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { areaPictures } from './mocks/responses';

const ROOF_ID = 'roof-2d-polygon';
const VGG_URL = 'https://s3.example.com/detections/vgg-result.json';
const ORIGINAL_IMAGE_URL = 'https://s3.example.com/detections/original.png';

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
  geoJsonZone: [{ properties: { vgg_file_url: VGG_URL, original_image_url: ORIGINAL_IMAGE_URL } }],
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

const interceptDetection = (delay = 0) => {
  cy.intercept('POST', '**/detections/*/sync', req => req.reply({ delay, body: detectionResponse })).as('processDetection');
};

describe('useRoofAnalyseGeneration — un seul débit de crédit par analyse', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.intercept('POST', '**/mercator**', mercatorResponse).as('pointsToGeoPoints');
    cy.intercept('PUT', '**/city-jsons/*/process', {}).as('processCityJson');
    cy.then(() => {
      localStorage.setItem('bp_user_api_key', 'dummy');
      useAnnotatorComponentStore.getState().reset();
      annotatorStore.useAnnotatorStore.getState().reset();
      useAnnotatorScreenSwitch.getState().setScreen('roof-analyse');
      useAnnotatorComponentStore.getState().setAreaPictureDetails(areaPictureDetails);
      useAnnotatorComponentStore.getState().setAnalyseImageUrl('blob:analyse-image');
      annotatorStore.useAnnotatorStore.getState().setAnnotations({ [ROOF_ID]: roofAnnotation });
    });
  });

  it('ne relance pas une détection après le succès de l’analyse lancée manuellement', () => {
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@processDetection');
    cy.wait(1500);
    cy.get('@processDetection.all').should('have.length', 1);
  });

  it('ignore un second déclenchement pendant qu’une détection est en vol', () => {
    interceptDetection(1000);

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@processDetection');
    cy.wait(1500);
    cy.get('@processDetection.all').should('have.length', 1);
  });

  it('poste sur l’identifiant de détection qu’elle vient de générer', () => {
    interceptDetection();

    mountHarness();
    cy.get('[data-cy=run-analyse]').click();

    cy.wait('@processDetection').then(({ request }) => {
      const postedId = request.url.split('/detections/')[1].replace('/sync', '');
      expect(postedId).to.eq(localStorage.getItem('bp_roof_analyse_id'));
    });
  });
});
