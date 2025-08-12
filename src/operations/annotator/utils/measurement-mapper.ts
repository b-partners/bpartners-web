import { MEASUREMENT_MAP_ON_EXTENDED_AREA, MEASUREMENT_MAP_ON_EXTENDED_LENGTH } from '@/constants';
import { Measurement, Polygon } from '@bpartners/annotator-component';

/**
 * Function that returns another function to map all measurement values
 * in the <AnnotatorCanvas measurementMapper={} /> component.
 *
 * @param isExtended - Indicates if the area picture details are extended.
 * @returns Callback function.
 * @example <AnnotatorCanvas measurementMapper={measurementMapper(isExtended)} />
 */
export const measurementMapper =
  (isExtended: boolean) =>
  (measurement: Measurement, currentPolygons: Polygon[] = []): Measurement => {
    const firstPolygon = currentPolygons[0];
    const isInvisible = firstPolygon?.id !== measurement.polygonId;
    if (!isExtended) return { ...measurement, isInvisible };
    return {
      ...measurement,
      isInvisible,
      value: measurement.value * (measurement.unity === 'm²' ? MEASUREMENT_MAP_ON_EXTENDED_AREA : MEASUREMENT_MAP_ON_EXTENDED_LENGTH),
    };
  };
