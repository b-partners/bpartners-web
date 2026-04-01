import { ExportAreaPictureAnnotation3D, ExportAreaPictureAnnotation3DPan } from '@bpartners/typescript-client';
import { degToRad } from 'three/src/math/MathUtils.js';
import { CityJSON } from '../city-json-type';
import { getDistance2D } from './segment-utilities';

export const addAlphabet = (name: string, index: number) => {
  const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  const base = alphabet.length;
  const letter = alphabet[index % base];
  const cycle = Math.floor(index / base);
  const suffix = cycle === 0 ? letter : `${letter}${cycle}`;
  return `${name} ${suffix}`;
};

const boundaryMapper = {
  toPan: (
    _boundary: number[],
    vertices: number[][],
    area: number,
    slope: number,
    distance_2d_scale: number,
    index: number
  ): ExportAreaPictureAnnotation3DPan => {
    const boundary = _boundary.slice();
    boundary.push(boundary[0]);

    const points3D = boundary.map(vIndex => vertices[vIndex].map(value => value * 0.001));

    const polygon: ExportAreaPictureAnnotation3DPan['polygon'] = { points: points3D.map(([x, y]) => ({ x, y })) };
    const measurements: ExportAreaPictureAnnotation3DPan['measurements'] = [];
    const infos: ExportAreaPictureAnnotation3DPan['infos'] = [
      { label: 'Surface rampant', value: `${area}m²` },
      { label: 'Pente', value: `${slope}°` },
    ];
    const name = addAlphabet('Pan', index);

    for (let index = 1; index < points3D.length; index++) {
      const current3DPoint = points3D[index];
      const prev3DPoint = points3D[index - 1];

      const angle = prev3DPoint[2] === current3DPoint[2] ? 0 : degToRad(slope);

      const distance = +((getDistance2D(prev3DPoint, current3DPoint) * distance_2d_scale) / Math.cos(angle)).toFixed(2);

      measurements.push({ isInvisible: false, unit: 'm', value: distance });
    }

    return {
      polygon,
      measurements,
      infos,
      name,
    };
  },
};

export const cityJsonMapper = {
  toExportAreaPictureAnnotation3D: (cityJson: CityJSON) => {
    const cityObject = Object.values(cityJson.CityObjects)[0];
    const geometry = cityObject.geometry[0];
    const surfaces = geometry.semantics.surfaces;
    const boundaries = geometry.boundaries;
    const roofBoundaries: { boundary: number[]; area: number; slope: number; distance_2d_scale: number }[] = [];
    const vertices = cityJson.vertices;

    let totalArea = 0;

    for (let index = 0; index < surfaces.length; index++) {
      const currentSurface = surfaces[index];
      if (currentSurface.type === 'RoofSurface' && boundaries[index][0].length > 3) {
        totalArea += currentSurface.area_in_square_meters;
        roofBoundaries.push({
          boundary: boundaries[index][0],
          area: currentSurface.area_in_square_meters,
          slope: currentSurface.slope_in_degrees,
          distance_2d_scale: currentSurface.distance_2d_scale,
        });
      }
    }

    const pans = roofBoundaries.map(({ boundary, area, slope, distance_2d_scale }, index) =>
      boundaryMapper.toPan(boundary, vertices, area, slope, distance_2d_scale, index)
    );

    pans[0] = { ...pans[0], infos: [{ label: 'Surface totale réelle', value: `${totalArea}m²` }, ...pans[0].infos] };

    const result: ExportAreaPictureAnnotation3D = { pans };

    return result;
  },
};
