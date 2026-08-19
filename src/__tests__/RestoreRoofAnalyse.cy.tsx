import { useRestoreRoofAnalyse } from '@/common/fetcher';
import { useAnnotatorComponentStore } from '@/common/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';

const DETECTION_ID = 'roof-analyse-123';
const VGG_URL = 'https://s3.example.com/detections/vgg-result.json';
const ORIGINAL_IMAGE_URL = 'https://s3.example.com/detections/original.png';

const detection = {
  creationDatetime: '2026-01-10T10:00:00.000Z',
  geoJsonZone: [{ properties: { vgg_file_url: VGG_URL, original_image_url: ORIGINAL_IMAGE_URL } }],
  roofDelimiter: { polygon: [] as number[][] },
  imageTileInfoOrigin: { coordinates: { x: 0, y: 0 }, size: { width: 1024 } },
};

interface HarnessProps {
  roofAnalyseId?: string;
  enabled: boolean;
}

const Harness: FC<HarnessProps> = ({ roofAnalyseId, enabled }) => {
  useRestoreRoofAnalyse(roofAnalyseId, enabled);
  const geoJsonResultUrl = useAnnotatorComponentStore(state => state.geoJsonResultUrl);
  const imageUrl = useAnnotatorComponentStore(state => state.imageUrl);
  return (
    <div>
      <div data-cy='geojson-url'>{geoJsonResultUrl || ''}</div>
      <div data-cy='image-url'>{imageUrl || ''}</div>
    </div>
  );
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

  it('appelle GET /detections/{roofAnalyseId} et récupère le VGG + original_image_url', () => {
    cy.intercept('GET', `**/detections/${DETECTION_ID}`, detection).as('getDetection');

    mountHarness({ roofAnalyseId: DETECTION_ID, enabled: true });

    cy.wait('@getDetection')
      .its('request.url')
      .should('match', new RegExp(`/detections/${DETECTION_ID}$`));
    cy.get('[data-cy=geojson-url]').should('have.text', VGG_URL);
    cy.get('[data-cy=image-url]').should('have.text', ORIGINAL_IMAGE_URL);
  });

  it('ne déclenche pas GET /detections quand les régions sont déjà persistées (enabled=false)', () => {
    cy.intercept('GET', `**/detections/${DETECTION_ID}`, detection).as('getDetection');

    mountHarness({ roofAnalyseId: DETECTION_ID, enabled: false });

    cy.wait(500);
    cy.get('@getDetection.all').should('have.length', 0);
    cy.get('[data-cy=geojson-url]').should('have.text', '');
  });

  it('ne déclenche pas GET /detections en l’absence de roofAnalyseId', () => {
    cy.intercept('GET', '**/detections/**', detection).as('getDetection');

    mountHarness({ roofAnalyseId: undefined, enabled: true });

    cy.wait(500);
    cy.get('@getDetection.all').should('have.length', 0);
    cy.get('[data-cy=geojson-url]').should('have.text', '');
  });
});
