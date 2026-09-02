import { saveCropRegionDraft } from '@/common/fetcher/save-annotations';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { useRoofAnalyseGeneration } from '@/operations/annotator/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { areaPictures } from './mocks/responses';

const ROOF_ID = 'roof-2d-polygon';

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

const AutoRunHarness = () => {
  useRoofAnalyseGeneration();
  return <div data-cy='harness' />;
};

const mountHarness = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <AutoRunHarness />
    </QueryClientProvider>
  );
};

const interceptDetection = (delay = 0) => {
  cy.intercept('POST', '**/detections/*/sync', req => req.reply({ delay, body: detectionResponse })).as('processDetection');
};

const seedFreshRoof = () => {
  cy.clearAllLocalStorage();
  cy.intercept('POST', '**', req => {
    if (req.url.includes('/detections/')) return;
    req.reply(mercatorResponse);
  }).as('pointsToGeoPoints');
  cy.intercept('PUT', '**/city-jsons/*/process', {}).as('processCityJson');
  cy.then(() => {
    localStorage.setItem('bp_user_api_key', 'dummy');
    useAnnotatorComponentStore.getState().reset();
    annotatorStore.useAnnotatorStore.getState().reset();
    useAnnotatorScreenSwitch.getState().setScreen('roof-analyse');
    useAnnotatorComponentStore.getState().setAreaPictureDetails(areaPictureDetails);
    annotatorStore.useAnnotatorStore.getState().setAnnotations({ [ROOF_ID]: roofAnnotation });
  });
};

describe('useRoofAnalyseGeneration — le signal « déjà analysé » n’est pas pollué par l’image de base', () => {
  beforeEach(seedFreshRoof);

  it('déclenche l’auto-run une seule fois quand aucune analyse n’existe (analyseImageUrl null)', () => {
    interceptDetection();

    mountHarness();

    cy.wait('@processDetection');
    cy.wait(1500);
    cy.get('@processDetection.all').should('have.length', 1);
  });

  it('ne déclenche pas l’auto-run quand une vraie image d’analyse est déjà présente', () => {
    interceptDetection();
    cy.then(() => useAnnotatorComponentStore.getState().setAnalyseImageUrl('blob:analyse-image'));

    mountHarness();

    cy.wait(1500);
    cy.get('@processDetection.all').should('have.length', 0);
  });
});

describe('save-annotations — analyseImageGenerated ne reflète qu’une vraie analyse', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.then(() => {
      useAnnotatorComponentStore.getState().reset();
      annotatorStore.useAnnotatorStore.getState().reset();
      annotatorStore.useAnnotatorStore.getState().setRoofAnalyseId(undefined as any);
      useAnnotatorComponentStore.getState().setAnalyseImageUrl(null);
      useAnnotatorComponentStore.getState().setAreaPictureDetails(areaPictureDetails);
      annotatorStore.useAnnotatorStore.getState().setAnnotations({ [ROOF_ID]: roofAnnotation });
      useAnnotatorComponentStore.getState().setAnalyseImageFileId(`${ROOF_ID}__analyse`);
    });
  });

  it('persiste analyseImageGenerated=false pour une toiture seulement délimitée', () => {
    cy.then(() => {
      const save = cy.spy().as('save');
      saveCropRegionDraft('pic', save);
    });

    cy.get('@save')
      .its('firstCall.args')
      .then(args => {
        expect((args as any)[1].data.properties.analyseImageGenerated).to.eq(false);
      });
  });

  it('persiste analyseImageGenerated=true après une vraie analyse (roofAnalyseId défini)', () => {
    cy.then(() => {
      annotatorStore.useAnnotatorStore.getState().setRoofAnalyseId('detection-1');
      const save = cy.spy().as('save');
      saveCropRegionDraft('pic', save);
    });

    cy.get('@save')
      .its('firstCall.args')
      .then(args => {
        expect((args as any)[1].data.properties.analyseImageGenerated).to.eq(true);
      });
  });
});
