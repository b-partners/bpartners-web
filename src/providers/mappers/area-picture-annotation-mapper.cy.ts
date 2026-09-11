import { AreaPictureAnnotation } from '@bpartners/typescript-client';
import { areaPictureAnnotationToPolygonAndAreaPictureInfo } from './area-picture-annotation-mapper';

const buildAnnotation = (metadata: Record<string, unknown>): AreaPictureAnnotation =>
  ({
    id: 'annotation-1',
    idAreaPicture: 'picture-1',
    isDraft: false,
    annotations: [
      {
        id: 'polygon-1',
        labelName: 'Toit',
        labelType: 'roof',
        polygon: { points: [] },
        metadata,
      },
    ],
  }) as unknown as AreaPictureAnnotation;

describe('areaPictureAnnotationToPolygonAndAreaPictureInfo — mutation/fireRisk', () => {
  it('reads mutation and fireRisk from metadata when present', () => {
    const { annotationsInfos } = areaPictureAnnotationToPolygonAndAreaPictureInfo(buildAnnotation({ mutation: 'deterioration', fireRisk: 'ELEVE' }));

    expect(annotationsInfos[0].mutation).to.eq('deterioration');
    expect(annotationsInfos[0].fireRisk).to.eq('ELEVE');
  });

  it('defaults mutation and fireRisk to "Inconnu" when metadata omits them (e.g. reopening an annotation saved before these fields existed)', () => {
    const { annotationsInfos } = areaPictureAnnotationToPolygonAndAreaPictureInfo(buildAnnotation({}));

    expect(annotationsInfos[0].mutation).to.eq('unknown');
    expect(annotationsInfos[0].fireRisk).to.eq('UNKNOWN');
  });
});
