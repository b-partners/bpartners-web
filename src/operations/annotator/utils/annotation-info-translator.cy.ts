import { AnnotationInfo } from '../types';
import { translateAnnotationInfo } from './annotation-info-translator';

const baseInfo = (overrides: Partial<AnnotationInfo> = {}): AnnotationInfo & { area: number } =>
  ({
    polygonId: 'polygon-1',
    area: 12,
    ...overrides,
  }) as AnnotationInfo & { area: number };

const findLabelValue = (result: { label: string; value: string }[], label: string) => result.find(entry => entry.label === label)?.value;

describe('translateAnnotationInfo — mutation label', () => {
  // Keys match geo-jobs' MutationType @JsonProperty wire values, not the Java enum constant
  // names (see src/constants/annotator.ts) - this is exactly what would have silently broken
  // if that casing mismatch had shipped.
  const mutationCases: [string, string][] = [
    ['improvement', 'Réparation'],
    ['deterioration', 'Dégradation'],
    ['RAS', 'Rien à signaler'],
    ['none', 'Néant'],
    ['background', 'Arrière-plan'],
    ['unknown', 'Inconnu'],
  ];

  mutationCases.forEach(([wireValue, expectedLabel]) => {
    it(`translates "${wireValue}" to "${expectedLabel}"`, () => {
      const result = translateAnnotationInfo(baseInfo({ mutation: wireValue as AnnotationInfo['mutation'] }));

      expect(findLabelValue(result, 'Mutation')).to.eq(expectedLabel);
    });
  });

  it('falls back to "Non renseigné" when mutation is absent', () => {
    const result = translateAnnotationInfo(baseInfo());

    expect(findLabelValue(result, 'Mutation')).to.eq('Non renseigné');
  });
});

describe('translateAnnotationInfo — fire risk label', () => {
  it('translates a fire risk level to its French label', () => {
    const result = translateAnnotationInfo(baseInfo({ fireRisk: 'ELEVE' as AnnotationInfo['fireRisk'] }));

    expect(findLabelValue(result, 'Risque vegetation / feu')).to.eq('Élevé');
  });

  it('falls back to "Non renseigné" when fire risk is absent', () => {
    const result = translateAnnotationInfo(baseInfo());

    expect(findLabelValue(result, 'Risque vegetation / feu')).to.eq('Non renseigné');
  });
});
