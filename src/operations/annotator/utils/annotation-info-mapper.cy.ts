import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { createDefaultAnnotationInfo, mapAreaAnnotationInstanceToAnnotationInfo } from './annotation-info-mapper';

const buildInstance = (metadata: Record<string, unknown>): AreaPictureAnnotationInstance =>
  ({
    id: 'polygon-1',
    labelName: 'Toit',
    labelType: 'roof',
    metadata,
  }) as unknown as AreaPictureAnnotationInstance;

describe('mapAreaAnnotationInstanceToAnnotationInfo — mutation/fireRisk', () => {
  it('reads mutation and fireRisk from metadata when present', () => {
    const info = mapAreaAnnotationInstanceToAnnotationInfo(buildInstance({ mutation: 'deterioration', fireRisk: 'ELEVE' }));

    expect(info.mutation).to.eq('deterioration');
    expect(info.fireRisk).to.eq('ELEVE');
  });

  it('defaults mutation and fireRisk to "Inconnu" when metadata omits them (e.g. annotations saved before these fields existed)', () => {
    const info = mapAreaAnnotationInstanceToAnnotationInfo(buildInstance({}));

    expect(info.mutation).to.eq('unknown');
    expect(info.fireRisk).to.eq('UNKNOWN');
  });
});

describe('createDefaultAnnotationInfo — mutation/fireRisk', () => {
  it('defaults a brand-new manually-drawn polygon to "Inconnu" for both fields', () => {
    const polygon = { id: 'polygon-1', points: [] } as unknown as Polygon;

    const info = createDefaultAnnotationInfo(polygon, 0);

    expect(info.mutation).to.eq('unknown');
    expect(info.fireRisk).to.eq('UNKNOWN');
  });
});
