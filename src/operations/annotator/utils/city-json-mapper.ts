import { SavedLineMeasure, SavedPolygonMeasure, Vec3Tuple } from '@/common/store';
import { CityJsonData, computeFaceArea, computeFaceEdges } from '@/lib/cityjson';
import { ExportAreaPictureAnnotation3D, ExportAreaPictureAnnotation3DPan } from '@bpartners/typescript-client';
import { CityJSON } from '../city-json-type';

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

const EDGE_TYPE_UNKNOWN_ID = 'unknown';

const boundaryMapper = {
  toPan: (
    _boundary: number[],
    cityJson: CityJSON,
    area: number,
    slope: number,
    index: number,
    panEdgeTypes: Record<number, string> = {}
  ): ExportAreaPictureAnnotation3DPan => {
    const boundary = _boundary.slice();
    boundary.push(boundary[0]);

    const points3D = boundary.map(vIndex => cityJson.vertices[vIndex].map(value => value * 0.001));

    const polygon: ExportAreaPictureAnnotation3DPan['polygon'] = { points: points3D.map(([x, y]) => ({ x, y })) };

    const faceEdges = computeFaceEdges(_boundary, cityJson as unknown as CityJsonData);
    const measurements: ExportAreaPictureAnnotation3DPan['measurements'] = faceEdges.map(edge => ({
      isInvisible: false,
      unit: 'm',
      value: edge.distanceMeters,
    }));
    const edgeTypeNames = faceEdges.map((_edge, edgeIndex) => panEdgeTypes[edgeIndex] ?? EDGE_TYPE_UNKNOWN_ID);

    const infos: ExportAreaPictureAnnotation3DPan['infos'] = [
      { label: 'Surface rampant', value: `${area}m²` },
      { label: 'Pente', value: `${slope}°` },
      { label: 'edgeTypes', value: JSON.stringify(edgeTypeNames) },
    ];
    const name = addAlphabet('Pan', index);

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
  toExportAreaPictureAnnotation3D: (
    cityJson: CityJSON,
    panImageIds: string[] = [],
    panNames: Record<number, string> = {},
    edgeTypes: Record<number, Record<number, string>> = {}
  ) => {
    const geometry = findSurfaceGeometry(cityJson);

    if (!geometry?.semantics?.surfaces?.length) {
      return { pans: [] } as ExportAreaPictureAnnotation3D;
    }

    const surfaces = geometry.semantics.surfaces;
    const isSolid = geometry.type === 'Solid';
    const surfaceBoundaries = (isSolid ? geometry.boundaries[0] : geometry.boundaries) as number[][][];
    const surfaceValues = (isSolid ? geometry.semantics.values[0] : geometry.semantics.values) as number[];
    const roofBoundaries: { boundary: number[]; area: number; slope: number }[] = [];

    let totalArea = 0;

    for (let index = 0; index < surfaceBoundaries.length; index++) {
      const semanticIndex = surfaceValues ? surfaceValues[index] : index;
      const currentSurface = surfaces[semanticIndex];
      const ring = surfaceBoundaries[index]?.[0] ?? [];

      if (currentSurface?.type === 'RoofSurface' && ring.length > 3) {
        const area = computeFaceArea(ring, cityJson as unknown as CityJsonData);
        totalArea += area;
        roofBoundaries.push({
          boundary: ring,
          area,
          slope: currentSurface.slope_in_degrees,
        });
      }
    }

    const pans = roofBoundaries.map(({ boundary, area, slope }, index) => {
      const pan = boundaryMapper.toPan(boundary, cityJson, area, slope, index, edgeTypes[index] ?? {});
      const customName = panNames[index]?.trim();
      const named = customName ? { ...pan, name: customName } : pan;
      return panImageIds[index] ? { ...named, imageUri: panImageIds[index] } : named;
    });

    if (pans.length > 0) {
      pans[0] = { ...pans[0], infos: [{ label: 'Surface totale réelle', value: `${+totalArea.toFixed(2)}m²` }, ...pans[0].infos] };
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
