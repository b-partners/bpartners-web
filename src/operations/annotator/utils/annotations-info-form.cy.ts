import { RoofAnalyseProperties } from '@/common/store';
import { createAnnotationInfoFromRoofAnalyseProperties } from './annotations-info-form';

const baseProperties = (overrides: Partial<RoofAnalyseProperties> = {}): RoofAnalyseProperties => ({
  obstacle: false,
  usure_rate: 5,
  global_rate_value: 1,
  global_rate_type: 'A',
  moisissure_rate: 2,
  humidite_rate: 3,
  revetement_1: 'ROOF_TUILES',
  revetement_2: null,
  roof_area_in_m2: 42,
  ...overrides,
});

describe('createAnnotationInfoFromRoofAnalyseProperties — mutation', () => {
  it('defaults mutation to "unknown" when the backend did not return one', () => {
    const info = createAnnotationInfoFromRoofAnalyseProperties('polygon-1', baseProperties(), 0, 0);

    expect(info?.mutation).to.eq('unknown');
  });

  it('passes through the backend mutation value when present', () => {
    const info = createAnnotationInfoFromRoofAnalyseProperties('polygon-1', baseProperties({ mutation: 'deterioration' }), 0, 0);

    expect(info?.mutation).to.eq('deterioration');
  });

  it('passes through the fire risk value as-is', () => {
    const info = createAnnotationInfoFromRoofAnalyseProperties('polygon-1', baseProperties({ fire_risk: 'ELEVE' }), 0, 0);

    expect(info?.fireRisk).to.eq('ELEVE');
  });
});
