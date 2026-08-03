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

type PanPoint3D = { x: number; y: number; z: number };

const dedupeFootprintRing = (points: number[][]): PanPoint3D[] => {
  const mapped = points.map(([x, y, z]) => ({ x, y, z }));
  const deduped = mapped.filter((point, index) => index === 0 || point.x !== mapped[index - 1].x || point.y !== mapped[index - 1].y);
  while (deduped.length > 1 && deduped[0].x === deduped[deduped.length - 1].x && deduped[0].y === deduped[deduped.length - 1].y) deduped.pop();
  return deduped;
};

const edge3DLength = (a: PanPoint3D, b: PanPoint3D) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);

const rescaleRingToLengths = (points: PanPoint[], lengths: number[]): PanPoint[] => {
  if (points.length < 2) return points;
  const result: PanPoint[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const target = lengths[i] ?? distance;
    const last = result[result.length - 1];
    result.push({ x: +(last.x + (dx / distance) * target).toFixed(2), y: +(last.y + (dy / distance) * target).toFixed(2) });
  }
  return result;
};

const ceilPointsToTwoDecimals = (points: PanPoint[]): PanPoint[] => points.map(({ x, y }) => ({ x: Math.ceil(x * 100) / 100, y: Math.ceil(y * 100) / 100 }));

const shiftPointsToPositive = (points: PanPoint[]): PanPoint[] => {
  if (!points.length) return points;
  const offsetX = Math.max(0, -Math.min(...points.map(({ x }) => x)));
  const offsetY = Math.max(0, -Math.min(...points.map(({ y }) => y)));
  if (!offsetX && !offsetY) return points;
  return points.map(({ x, y }) => ({ x: x + offsetX, y: y + offsetY }));
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
    return { x: cx + dx * cos - dy * sin, y: cy - (dx * sin + dy * cos) };
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

const facadePolygonPoints = (points3D: number[][]): PanPoint[] => {
  const horizontal = points3D.map(([x, y]) => ({ x, y }));
  let direction = { x: 1, y: 0 };
  let maxDistance = 0;
  for (let i = 0; i < horizontal.length; i++) {
    for (let j = i + 1; j < horizontal.length; j++) {
      const dx = horizontal[j].x - horizontal[i].x;
      const dy = horizontal[j].y - horizontal[i].y;
      const distance = dx * dx + dy * dy;
      if (distance > maxDistance) {
        maxDistance = distance;
        direction = { x: dx, y: dy };
      }
    }
  }
  const length = Math.hypot(direction.x, direction.y) || 1;
  const unit = { x: direction.x / length, y: direction.y / length };
  const origin = horizontal[0] ?? { x: 0, y: 0 };
  return points3D.map(([x, y, z]) => ({ x: (x - origin.x) * unit.x + (y - origin.y) * unit.y, y: z }));
};

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

    const ring3D = dedupeFootprintRing(points3D);
    const footprintPoints = ring3D.map(({ x, y }) => ({ x, y }));
    const footprintLengths = ring3D.map((point, i) => edge3DLength(point, ring3D[(i + 1) % ring3D.length]));
    const rescaledPoints = rescaleRingToLengths(footprintPoints, footprintLengths);

    const closedRing = closeRingWithoutSuperposition(rescaledPoints);

    const polygon: ExportAreaPictureAnnotation3DPan['polygon'] = {
      points: ceilPointsToTwoDecimals(closedRing),
    };
    const orientedPolygon: ExportAreaPictureAnnotation3DPan['orientedPolygon'] = {
      points: ceilPointsToTwoDecimals(shiftPointsToPositive(rotatePointsAroundCentroid(closedRing, angle))),
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
      orientedPolygon,
      measurements,
      infos,
      name,
    };
  },

  toFacade: (
    _boundary: number[],
    cityJson: CityJSON,
    area: number,
    height: number,
    index: number,
    polygonPoints?: PanPoint[]
  ): ExportAreaPictureAnnotation3DPan => {
    const points = polygonPoints?.length ? polygonPoints : facadePolygonPoints(_boundary.map(vIndex => cityJson.vertices[vIndex].map(value => value * 0.001)));

    const polygon: ExportAreaPictureAnnotation3DPan['polygon'] = {
      points: ceilPointsToTwoDecimals(shiftPointsToPositive(closeRingWithoutSuperposition(points))),
    };

    const faceEdges = computeFaceEdges(_boundary, cityJson as unknown as CityJsonData);
    const measurements: ExportAreaPictureAnnotation3DPan['measurements'] = faceEdges.map(edge => ({
      isInvisible: false,
      unit: 'm',
      value: edge.distanceMeters,
    }));

    const infos: ExportAreaPictureAnnotation3DPan['infos'] = [
      { label: 'Surface', value: `${+area.toFixed(2)}m²` },
      { label: 'Hauteur', value: `${+height.toFixed(2)}m` },
    ];
    const name = addAlphabet('Façade', index);

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

interface WallBoundary {
  boundary: number[];
  area: number;
  height: number;
}

const ringHeight = (ring: number[], cityJson: CityJSON): number => {
  const zValues = ring.map(vIndex => (cityJson.vertices[vIndex]?.[2] ?? 0) * 0.001);
  if (!zValues.length) return 0;
  return Math.max(...zValues) - Math.min(...zValues);
};

export const collectWallBoundaries = (cityJson: CityJSON): WallBoundary[] => {
  const wallBoundaries: WallBoundary[] = [];

  Object.values((cityJson as any)?.CityObjects ?? {}).forEach((cityObject: any) => {
    if (Array.isArray(cityObject?.children)) return;

    (cityObject?.geometry ?? []).forEach((geometry: any) => {
      const surfaces = geometry?.semantics?.surfaces ?? [];

      flattenGeometrySurfaces(geometry).forEach(({ boundary, semanticIndex }) => {
        const currentSurface = semanticIndex != null ? surfaces[semanticIndex] : undefined;
        const ring = Array.isArray(boundary) && Array.isArray(boundary[0]) ? boundary[0] : boundary;

        if (currentSurface?.type !== 'WallSurface') return;
        if (!Array.isArray(ring) || ring.length < 3 || !ring.every((vertex: any) => typeof vertex === 'number')) return;

        const area = computeFaceArea(ring, cityJson as unknown as CityJsonData);
        const height = typeof currentSurface.height_in_meters === 'number' ? currentSurface.height_in_meters : ringHeight(ring, cityJson);
        wallBoundaries.push({ boundary: ring, area, height });
      });
    });
  });

  return wallBoundaries;
};

export const cityJsonMapper = {
  toExportAreaPictureAnnotation3D: (
    cityJson: CityJSON,
    panImageIds: string[] = [],
    panNames: Record<number, string> = {},
    edgeTypes: Record<number, Record<number, string>> = {},
    panAngles: number[] = [],
    facadeImageIds: string[] = [],
    facadePolygons: PanPoint[][] = []
  ) => {
    const { roofBoundaries, totalArea } = collectRoofBoundaries(cityJson);
    const wallBoundaries = collectWallBoundaries(cityJson);

    const pans = roofBoundaries.map(({ boundary, area, slope }, index) => {
      const pan = boundaryMapper.toPan(boundary, cityJson, area, slope, index, edgeTypes[index] ?? {}, panAngles[index] ?? 0);
      const customName = panNames[index]?.trim();
      const named = customName ? { ...pan, name: customName } : pan;
      return panImageIds[index] ? { ...named, imageUri: panImageIds[index] } : named;
    });

    if (pans.length > 0) {
      pans[0] = { ...pans[0], infos: [{ label: 'Surface totale réelle', value: `${+totalArea.toFixed(2)}m²` }, ...pans[0].infos] };
    }

    const facades = wallBoundaries.map(({ boundary, area, height }, index) => {
      const facade = boundaryMapper.toFacade(boundary, cityJson, area, height, index, facadePolygons[index]);
      return facadeImageIds[index] ? { ...facade, imageUri: facadeImageIds[index] } : facade;
    });

    const result: ExportAreaPictureAnnotation3D = { pans };
    if (facades.length) result.facades = facades;

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
