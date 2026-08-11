import { useRestoreRoofAnalyse } from '@/common/fetcher';
import { useAnnotatorComponentStore } from '@/common/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';

const DETECTION_ID = 'roof-analyse-123';
const VGG_URL = 'https://s3.example.com/detections/vgg-result.json';
const ORIGINAL_IMAGE_URL = 'https://s3.example.com/detections/original.png';

const detectionResult = [
  {
    creationDatetime: '2026-01-10T10:00:00.000Z',
    geoJsonZone: [{ properties: { vgg_file_url: VGG_URL, original_image_url: ORIGINAL_IMAGE_URL } }],
    roofDelimiter: { polygon: [] as number[][] },
    imageTileInfoOrigin: { coordinates: { x: 0, y: 0 }, size: { width: 1024 } },
  },
];

interface HarnessProps {
  roofAnalyseId?: string;
  enabled: boolean;
}

const Harness: FC<HarnessProps> = ({ roofAnalyseId, enabled }) => {
  useRestoreRoofAnalyse(roofAnalyseId, enabled);
  const geoJsonResultUrl = useAnnotatorComponentStore(state => state.geoJsonResultUrl);
  return <div data-cy='geojson-url'>{geoJsonResultUrl || ''}</div>;
};

const mountHarness = (props: HarnessProps) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <Harness {...props} />
    </QueryClientProvider>
  );
};

describe('useRestoreRoofAnalyse — ré-hydratation des résultats de détection', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.then(() => {
      localStorage.setItem('bp_user_api_key', 'dummy');
      useAnnotatorComponentStore.getState().reset();
    });
  });

  it('récupère le VGG via GET /detections/{roofAnalyseId} quand aucune région n’est persistée', () => {
    cy.intercept('GET', `**/detections/${DETECTION_ID}`, detectionResult).as('getDetection');

    mountHarness({ roofAnalyseId: DETECTION_ID, enabled: true });

    cy.wait('@getDetection');
    cy.get('[data-cy=geojson-url]').should('have.text', VGG_URL);
  });

  it('ne déclenche pas GET /detections quand les régions sont déjà persistées (enabled=false)', () => {
    cy.intercept('GET', `**/detections/${DETECTION_ID}`, detectionResult).as('getDetection');

    mountHarness({ roofAnalyseId: DETECTION_ID, enabled: false });

    cy.wait(500);
    cy.get('@getDetection.all').should('have.length', 0);
    cy.get('[data-cy=geojson-url]').should('have.text', '');
  });

  it('ne déclenche pas GET /detections en l’absence de roofAnalyseId', () => {
    cy.intercept('GET', '**/detections/**', detectionResult).as('getDetection');

    mountHarness({ roofAnalyseId: undefined, enabled: true });

    cy.wait(500);
    cy.get('@getDetection.all').should('have.length', 0);
    cy.get('[data-cy=geojson-url]').should('have.text', '');
  });
});
