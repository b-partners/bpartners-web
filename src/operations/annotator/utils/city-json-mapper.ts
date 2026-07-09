import { SavedLineMeasure, SavedPolygonMeasure, Vec3Tuple } from '@/common/store';
import { CityJsonData, computeFaceArea, computeFaceEdges } from '@/lib/cityjson';
import { ExportAreaPictureAnnotation3D, ExportAreaPictureAnnotation3DPan } from '@bpartners/typescript-client';
import { CityJSON } from '../city-json-type';

const toFootprintPoint = ([x, , z]: Vec3Tuple) => ({ x, y: z });

const toLengthMeasurement = (value: number) => ({ isInvisible: false, unit: 'm', value: +value.toFixed(2) });

type PanPoint = { x: number; y: number };

const arePanPointsEqual = (a: PanPoint, b: PanPoint) => a.x === b.x && a.y === b.y;

const closeRingWithoutSuperposition = (points: PanPoint[]): PanPoint[] => {
  if (!points.length) return [];
  const deduped = points.filter((point, index) => index === 0 || !arePanPointsEqual(point, points[index - 1]));
  while (deduped.length > 1 && arePanPointsEqual(deduped[0], deduped[deduped.length - 1])) deduped.pop();
  return [...deduped, deduped[0]];
};

const rotatePointsAroundCentroid = (points: PanPoint[], angle: number): PanPoint[] => {
  if (!angle || points.length === 0) return points;
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(({ x, y }) => {
    const dx = x - cx;
    const dy = y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  });
};

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
    panEdgeTypes: Record<number, string> = {},
    angle = 0
  ): ExportAreaPictureAnnotation3DPan => {
    const points3D = _boundary.map(vIndex => cityJson.vertices[vIndex].map(value => value * 0.001));

    const polygon: ExportAreaPictureAnnotation3DPan['polygon'] = {
      points: rotatePointsAroundCentroid(closeRingWithoutSuperposition(points3D.map(([x, y]) => ({ x, y }))), angle),
    };

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

interface RoofBoundary {
  boundary: number[];
  area: number;
  slope: number;
}

const flattenGeometrySurfaces = (geometry: any): { boundary: any; semanticIndex: number | null }[] => {
  if (geometry?.type === 'Solid') {
    const shellValues = geometry?.semantics?.values ?? [];
    return (geometry?.boundaries ?? []).flatMap((shell: any[], shellIdx: number) => {
      const values = shellValues[shellIdx] ?? [];
      return shell.map((boundary: any, surfaceIdx: number) => ({ boundary, semanticIndex: values[surfaceIdx] ?? null }));
    });
  }
  const values = geometry?.semantics?.values ?? [];
  return (geometry?.boundaries ?? []).map((boundary: any, index: number) => ({ boundary, semanticIndex: values[index] ?? null }));
};

export const collectRoofBoundaries = (cityJson: CityJSON): { roofBoundaries: RoofBoundary[]; totalArea: number } => {
  const roofBoundaries: RoofBoundary[] = [];
  let totalArea = 0;

  Object.values((cityJson as any)?.CityObjects ?? {}).forEach((cityObject: any) => {
    if (Array.isArray(cityObject?.children)) return;

    (cityObject?.geometry ?? []).forEach((geometry: any) => {
      const surfaces = geometry?.semantics?.surfaces ?? [];

      flattenGeometrySurfaces(geometry).forEach(({ boundary, semanticIndex }) => {
        const currentSurface = semanticIndex != null ? surfaces[semanticIndex] : undefined;
        const ring = Array.isArray(boundary) && Array.isArray(boundary[0]) ? boundary[0] : boundary;

        if (currentSurface?.type !== 'RoofSurface') return;
        if (!Array.isArray(ring) || ring.length < 3 || !ring.every((vertex: any) => typeof vertex === 'number')) return;

        const area = computeFaceArea(ring, cityJson as unknown as CityJsonData);
        totalArea += area;
        roofBoundaries.push({ boundary: ring, area, slope: currentSurface.slope_in_degrees });
      });
    });
  });

  return { roofBoundaries, totalArea };
};

export const cityJsonMapper = {
  toExportAreaPictureAnnotation3D: (
    cityJson: CityJSON,
    panImageIds: string[] = [],
    panNames: Record<number, string> = {},
    edgeTypes: Record<number, Record<number, string>> = {},
    panAngles: number[] = []
  ) => {
    const { roofBoundaries, totalArea } = collectRoofBoundaries(cityJson);

    if (!roofBoundaries.length) {
      return { pans: [] } as ExportAreaPictureAnnotation3D;
    }

    const pans = roofBoundaries.map(({ boundary, area, slope }, index) => {
      const pan = boundaryMapper.toPan(boundary, cityJson, area, slope, index, edgeTypes[index] ?? {}, panAngles[index] ?? 0);
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

  userPolygonToPan: (polygon: SavedPolygonMeasure, imageUri?: string, angle = 0): ExportAreaPictureAnnotation3DPan => {
    const pan: ExportAreaPictureAnnotation3DPan = {
      name: polygon.name,
      polygon: { points: rotatePointsAroundCentroid(closeRingWithoutSuperposition(polygon.points.map(toFootprintPoint)), angle) },
      measurements: polygon.edges.map(edge => toLengthMeasurement(edge.distanceSlope)),
      infos: [{ label: 'Surface', value: `${+polygon.area.toFixed(2)}m²` }],
    };
    return imageUri ? { ...pan, imageUri } : pan;
  },

  userLineToPan: (line: SavedLineMeasure, imageUri?: string, angle = 0): ExportAreaPictureAnnotation3DPan => {
    const pan: ExportAreaPictureAnnotation3DPan = {
      name: line.name,
      polygon: { points: rotatePointsAroundCentroid([line.pointA, line.pointB].map(toFootprintPoint), angle) },
      measurements: [toLengthMeasurement(line.distanceSlope)],
      infos: [
        { label: 'Distance', value: `${+line.distanceSlope.toFixed(2)}m` },
        { label: 'Pente', value: `${line.slopeAngle}°` },
      ],
    };
    return imageUri ? { ...pan, imageUri } : pan;
  },
};
