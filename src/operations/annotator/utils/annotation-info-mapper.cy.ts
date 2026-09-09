import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { mapAreaAnnotationInstanceToAnnotationInfo } from './annotation-info-mapper';

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

  it('defaults mutation and fireRisk to empty string when metadata omits them', () => {
    const info = mapAreaAnnotationInstanceToAnnotationInfo(buildInstance({}));

    expect(info.mutation).to.eq('');
    expect(info.fireRisk).to.eq('');
  });
});
