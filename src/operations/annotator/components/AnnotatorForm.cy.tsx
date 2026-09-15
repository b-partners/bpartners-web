import { annotatorStore, RoofAnalyseProperties } from '@/common/store';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { AnnotationInfo } from '../types';
import AnnotatorForm from './AnnotatorForm';

const roofPolygonId = `roof-1__${roofGlobalIdRef}`;

const seedRoofAnnotation = (overrides: Partial<AnnotationInfo> = {}) => {
  const polygon = { id: roofPolygonId, points: [] } as unknown as Polygon;
  const annotationInfo: AnnotationInfo = {
    polygonId: roofPolygonId,
    labelType: 'roof',
    labelName: 'Toit',
    mutation: 'unknown',
    fireRisk: 'UNKNOWN',
    ...overrides,
  };
  annotatorStore.useAnnotatorStore.getState().replaceAnnotations([polygon], [annotationInfo]);
};

const mountForm = (roofAnalyseProperties?: Partial<RoofAnalyseProperties>) =>
  cy.mount(
    <AnnotatorForm
      polygonId={roofPolygonId}
      slopeAndHeightState={null}
      isSlopeAndHeightPending={false}
      roofAnalyseProperties={roofAnalyseProperties as RoofAnalyseProperties}
    />
  );

describe('AnnotatorForm — mutation/fireRisk fields', () => {
  it('shows the translated mutation and fire risk values', () => {
    seedRoofAnnotation({ mutation: 'deterioration', fireRisk: 'ELEVE' });

    mountForm();

    cy.get('[data-testid="mutation"]').should('contain.text', 'Dégradation');
    cy.get('[data-testid="fire-risk"]').should('contain.text', 'Élevé');
  });

  it('shows no comparison caption when the backend returned no mutation image dates', () => {
    seedRoofAnnotation();

    mountForm();

    cy.get('[data-testid="mutation-image-caption"]').should('not.exist');
  });

  it('shows the compared years as links when the backend returned image urls', () => {
    seedRoofAnnotation();

    mountForm({
      mutation_older_image_url: 'https://geodata.test/old.jpg',
      mutation_older_image_date: 2022,
      mutation_recent_image_url: 'https://geodata.test/new.jpg',
      mutation_recent_image_date: 2024,
    });

    cy.get('[data-testid="mutation-image-caption"]').should('contain.text', '2022').and('contain.text', '2024');
    cy.get('[data-testid="mutation-image-caption"] a').should('have.length', 2);
  });

  it('shows only the year, without a link, when the image url is missing', () => {
    seedRoofAnnotation();

    mountForm({ mutation_older_image_date: 2022, mutation_recent_image_date: 2024 });

    cy.get('[data-testid="mutation-image-caption"]').should('contain.text', '2022').and('contain.text', '2024');
    cy.get('[data-testid="mutation-image-caption"] a').should('have.length', 0);
  });
});
