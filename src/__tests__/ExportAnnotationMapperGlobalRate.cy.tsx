import { exportAnnotationMapper } from '@/operations/annotator/utils';

const POLYGON_ID = 'roof-polygon___abc';

const baseArgs = {
  imageUrl: 'https://example.com/image.png',
  address: '1 rue de test',
  polygons: [{ id: POLYGON_ID, points: [{ x: 0, y: 0 }], fillColor: '', strokeColor: '' }] as any,
  annotationInfos: [{ polygonId: POLYGON_ID, labelType: 'roof' }] as any,
};

describe('exportAnnotationMapper — global rate passthrough', () => {
  it('forwards a null globalRateType and globalRateValue when no roof analysis exists', () => {
    cy.wrap(exportAnnotationMapper({ ...baseArgs, globalRateType: null, globalRateValue: null })).then(result => {
      expect(result.globalRateType).to.be.null;
      expect(result.globalRateValue).to.be.null;
    });
  });

  it('forwards the computed globalRateType and globalRateValue unchanged when a roof analysis exists', () => {
    cy.wrap(exportAnnotationMapper({ ...baseArgs, globalRateType: 'B', globalRateValue: 10 })).then(result => {
      expect(result.globalRateType).to.equal('B');
      expect(result.globalRateValue).to.equal(10);
    });
  });
});
