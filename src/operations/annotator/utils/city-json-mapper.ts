import { SavedLineMeasure, SavedPolygonMeasure, Vec3Tuple } from '@/common/store';
import { ExportAreaPictureAnnotation3D, ExportAreaPictureAnnotation3DPan } from '@bpartners/typescript-client';
import { degToRad } from 'three/src/math/MathUtils.js';
import { CityJSON } from '../city-json-type';
import { getDistance2D } from './segment-utilities';

const toFootprintPoint = ([x, , z]: Vec3Tuple) => ({ x, y: z });

const toLengthMeasurement = (value: number) => ({ isInvisible: false, unit: 'm', value: +value.toFixed(2) });

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

export const findSurfaceGeometry = (cityJson: CityJSON) =>
  Object.values(cityJson?.CityObjects ?? {})
    .flatMap(cityObject => cityObject?.geometry ?? [])
    .find(geometry => Boolean(geometry?.semantics?.surfaces?.length));

export const cityJsonMapper = {
  toExportAreaPictureAnnotation3D: (cityJson: CityJSON, panImageIds: string[] = []) => {
    const geometry = findSurfaceGeometry(cityJson);

    if (!geometry?.semantics?.surfaces?.length) {
      return { pans: [] } as ExportAreaPictureAnnotation3D;
    }

    const surfaces = geometry.semantics.surfaces;
    const isSolid = geometry.type === 'Solid';
    const surfaceBoundaries = (isSolid ? geometry.boundaries[0] : geometry.boundaries) as number[][][];
    const surfaceValues = (isSolid ? geometry.semantics.values[0] : geometry.semantics.values) as number[];
    const roofBoundaries: { boundary: number[]; area: number; slope: number; distance_2d_scale: number }[] = [];
    const vertices = cityJson.vertices;

    let totalArea = 0;

    for (let index = 0; index < surfaceBoundaries.length; index++) {
      const semanticIndex = surfaceValues ? surfaceValues[index] : index;
      const currentSurface = surfaces[semanticIndex];
      const ring = surfaceBoundaries[index]?.[0] ?? [];

      if (currentSurface?.type === 'RoofSurface' && ring.length > 3) {
        totalArea += currentSurface.area_in_square_meters;
        roofBoundaries.push({
          boundary: ring,
          area: currentSurface.area_in_square_meters,
          slope: currentSurface.slope_in_degrees,
          distance_2d_scale: currentSurface.distance_2d_scale ?? 1,
        });
      }
    }

    const pans = roofBoundaries.map(({ boundary, area, slope, distance_2d_scale }, index) => {
      const pan = boundaryMapper.toPan(boundary, vertices, area, slope, distance_2d_scale, index);
      return panImageIds[index] ? { ...pan, imageUri: panImageIds[index] } : pan;
    });

    if (pans.length > 0) {
      pans[0] = { ...pans[0], infos: [{ label: 'Surface totale réelle', value: `${totalArea}m²` }, ...pans[0].infos] };
    }

    const result: ExportAreaPictureAnnotation3D = { pans };

    return result;
  },

  userPolygonToPan: (polygon: SavedPolygonMeasure, imageUri?: string): ExportAreaPictureAnnotation3DPan => {
    const ring = polygon.points.length ? [...polygon.points, polygon.points[0]] : [];
    const pan: ExportAreaPictureAnnotation3DPan = {
      name: polygon.name,
      polygon: { points: ring.map(toFootprintPoint) },
      measurements: polygon.edges.map(edge => toLengthMeasurement(edge.distanceSlope)),
      infos: [{ label: 'Surface', value: `${+polygon.area.toFixed(2)}m²` }],
    };
    return imageUri ? { ...pan, imageUri } : pan;
  },

  userLineToPan: (line: SavedLineMeasure, imageUri?: string): ExportAreaPictureAnnotation3DPan => {
    const pan: ExportAreaPictureAnnotation3DPan = {
      name: line.name,
      polygon: { points: [line.pointA, line.pointB].map(toFootprintPoint) },
      measurements: [toLengthMeasurement(line.distanceSlope)],
      infos: [
        { label: 'Distance', value: `${+line.distanceSlope.toFixed(2)}m` },
        { label: 'Pente', value: `${line.slopeAngle}°` },
      ],
    };
    return imageUri ? { ...pan, imageUri } : pan;
  },
};
