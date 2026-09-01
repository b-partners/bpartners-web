import { annotatorStore, roof3DStore, useAnnotator3DStore, useAnnotatorComponentStore } from '@/common/store';
import { CityJSON } from '@/operations/annotator/city-json-type';
import { LlmResult } from '@/operations/annotator/components/llm-result';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const ANNOTATION_ID = 'roof-1';

const seedAnnotation = () => {
  annotatorStore.useAnnotatorStore.setState({
    annotations: {
      [ANNOTATION_ID]: {
        isFirst: true,
        screen: 'roof-analyse',
        polygon: { id: ANNOTATION_ID, points: [], surface: 42 } as any,
        annotationInfos: {
          polygonId: ANNOTATION_ID,
          labelType: 'roof',
          covering: 'ROOF_TUILES',
          wear: 'PARTIAL',
          wearLevel: 10,
          moldRate: 5,
          humidityLevel: 2,
          comment: 'RAS',
          area: 42,
          slope: 25,
        },
      },
    },
  });
};

const seedAreaPictureDetails = () => {
  useAnnotatorComponentStore.getState().setAreaPictureDetails({
    address: '12 Rue Test',
    geoPositions: [{ latitude: 45.1, longitude: 5.2 }],
  } as AreaPictureDetails);
};

const cityJsonWithRoofAndWall: CityJSON = {
  type: 'CityJSON',
  version: '1.1',
  transform: { scale: [1, 1, 1], translate: [0, 0, 0] },
  vertices: [
    [0, 0, 0],
    [10, 0, 0],
    [10, 10, 0],
    [0, 10, 0],
  ],
  CityObjects: {
    building1: {
      type: 'Building',
      geometry: [
        {
          type: 'MultiSurface',
          boundaries: [[[0, 1, 2, 3]], [[0, 1, 2, 3]]],
          semantics: {
            surfaces: [
              { type: 'RoofSurface', slope_in_degrees: 30, area_in_square_meters: 100 },
              { type: 'WallSurface', height_in_meters: 8, area_in_square_meters: 100 },
            ],
            values: [0, 1],
          },
        },
      ],
    },
  },
};

const mountHarness = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <LlmResult width='100%' height='100%' />
    </QueryClientProvider>
  );
};

describe('useLlmResultQuery — payload sent to the toiture-report LLM endpoint', () => {
  beforeEach(() => {
    annotatorStore.useAnnotatorStore.getState().reset();
    useAnnotatorComponentStore.getState().reset();
    useAnnotator3DStore.getState().reset();
    roof3DStore.useRoof3DStore.getState().reset();
    seedAnnotation();
    seedAreaPictureDetails();
  });

  it('POSTs a JSON payload derived from the 2D annotation when no 3D model exists', () => {
    cy.intercept('POST', `${process.env.LLM_ANALYSE_RESULT}**`, req => {
      expect(req.body.adresse).to.eq('12 Rue Test');
      expect(req.body.gps).to.eq('45.1,5.2');
      expect(req.body.revetement).to.eq('Tuiles');
      expect(req.body.revetement2).to.be.undefined;
      expect(req.body.surfaceRampantM2).to.eq(42);
      expect(req.body.hauteurBatiment).to.be.undefined;
      expect(req.body.penteDeg).to.eq(25);
      expect(req.body.pansToiture3d).to.be.undefined;
      expect(req.body.niveauUsure).to.eq('Partielle');
      expect(req.body.tauxUsurePct).to.eq(10);
      expect(req.body.tauxMoisissurePct).to.eq(5);
      expect(req.body.tauxHumiditePct).to.eq(2);
      expect(req.body.commentaireCouvreur).to.eq('RAS');
      expect(req.body.etatApparent).to.eq('Entretien préventif');
      expect(req.body.scoreDegradationVisible).to.eq(10);
      req.reply({ headers: { 'content-type': 'text/html' }, body: '<html><head></head>ok</html>' });
    }).as('postLlmResult');

    mountHarness();

    cy.wait('@postLlmResult')
      .its('request')
      .then(request => {
        expect(request.method).to.eq('POST');
        expect(request.headers['content-type']).to.include('application/json');
      });
  });

  it('overrides area/slope with CityJSON-derived geometry and includes pansToiture3d when a 3D model exists', () => {
    useAnnotator3DStore.getState().setCityJsonModel(cityJsonWithRoofAndWall);

    cy.intercept('POST', `${process.env.LLM_ANALYSE_RESULT}**`, req => {
      expect(req.body.surfaceRampantM2).to.eq(100);
      expect(req.body.penteDeg).to.eq(30);
      expect(req.body.hauteurBatiment).to.eq(8);
      expect(req.body.pansToiture3d).to.be.an('array').with.length(1);
      req.reply({ headers: { 'content-type': 'text/html' }, body: '<html><head></head>ok</html>' });
    }).as('postLlmResult3d');

    mountHarness();

    cy.wait('@postLlmResult3d');
  });
});
