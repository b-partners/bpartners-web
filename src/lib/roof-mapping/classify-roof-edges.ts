import { CityJsonData } from '../cityjson';
import { DEFAULT_THRESHOLDS, RoofEdgeTypeId, RoofEdgeTypeMap, RoofMappingResult, RoofMappingThresholds } from './types';

interface Vertex3 {
  x: number;
  y: number;
  z: number;
}

interface Vector2 {
  x: number;
  y: number;
}

interface RoofPlane {
  faceVertexIndices: number[];
  azimuthDeg?: number;
  slopeDeg?: number;
  zMin?: number;
  zMax?: number;
}

interface EdgeOccurrence {
  roofIndex: number;
  edgeIndex: number;
  va: number;
  vb: number;
  pa: Vertex3;
  pb: Vertex3;
}

const applyTransform = (v: number[], t?: { scale: number[]; translate: number[] }): Vertex3 => {
  if (!t) return { x: v[0], y: v[1], z: v[2] };
  return {
    x: v[0] * t.scale[0] + t.translate[0],
    y: v[1] * t.scale[1] + t.translate[1],
    z: v[2] * t.scale[2] + t.translate[2],
  };
};

const edgeKey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

const dot2 = (a: Vector2, b: Vector2): number => a.x * b.x + a.y * b.y;

// Roofer rf_azimuth is the compass direction of steepest descent (clockwise from north).
// In EPSG:2154 (x=easting, y=northing) the downslope unit vector is (sin θ, cos θ).
const azimuthToDownslope = (azDeg: number): Vector2 => {
  const rad = (azDeg * Math.PI) / 180;
  return { x: Math.sin(rad), y: Math.cos(rad) };
};

const extractRoofPlanes = (cityJson: CityJsonData): RoofPlane[] => {
  const planes: RoofPlane[] = [];

  Object.values(cityJson.CityObjects).forEach((obj: any) => {
    if (Array.isArray(obj.children)) return;

    obj.geometry?.forEach((geom: any) => {
      const surfaces: any[] = geom.semantics?.surfaces ?? [];

      let normalizedBoundaries: any[];
      let normalizedValues: any[];
      if (geom.type === 'Solid') {
        normalizedBoundaries = [];
        normalizedValues = [];
        const shellValues = geom.semantics?.values ?? [];
        geom.boundaries.forEach((shell: any[], shellIdx: number) => {
          const sv = shellValues[shellIdx] ?? [];
          shell.forEach((surface: any, surfIdx: number) => {
            normalizedBoundaries.push(surface);
            normalizedValues.push(sv[surfIdx] ?? null);
          });
        });
      } else {
        normalizedBoundaries = geom.boundaries ?? [];
        normalizedValues = geom.semantics?.values ?? [];
      }

      normalizedBoundaries.forEach((boundary: any, bIdx: number) => {
        const surfaceIdx = normalizedValues[bIdx];
        const surface = surfaceIdx != null ? surfaces[surfaceIdx] : null;
        if (surface?.type !== 'RoofSurface') return;
        const face = Array.isArray(boundary) && Array.isArray(boundary[0]) ? boundary[0] : boundary;
        if (!Array.isArray(face) || face.length < 3 || !face.every((n: any) => typeof n === 'number')) return;

        planes.push({
          faceVertexIndices: face,
          azimuthDeg: surface.rf_azimuth ?? surface.azimuth,
          slopeDeg: surface.rf_slope ?? surface.slope_in_degrees,
          zMin: surface.rf_h_roof_min,
          zMax: surface.rf_h_roof_max,
        });
      });
    });
  });

  return planes;
};

const computeBuildingConfidence = (cityJson: CityJsonData): number => {
  let attrs: any = null;
  Object.values(cityJson.CityObjects).forEach((obj: any) => {
    if (attrs) return;
    if (obj.type === 'Building' && obj.attributes) attrs = obj.attributes;
  });
  if (!attrs) return 1;

  const density: number = attrs.rf_pt_density ?? 15;
  const rmse: number = attrs.rf_rmse_lod22 ?? 0;
  const nodata: number = attrs.rf_nodata_frac ?? 0;

  const cDensity = Math.min(density / 15, 1);
  const cRmse = 1 - Math.min(rmse / 1.5, 1);
  const cGap = 1 - Math.min(nodata, 1);

  return Math.max(0, Math.min(1, cDensity * cRmse * cGap));
};

const buildPlaneEdges = (
  planes: RoofPlane[],
  rawVertices: number[][],
  transform: { scale: number[]; translate: number[] } | undefined,
  minLen: number
): { perPlane: EdgeOccurrence[][]; byKey: Map<string, EdgeOccurrence[]> } => {
  const perPlane: EdgeOccurrence[][] = [];
  const byKey = new Map<string, EdgeOccurrence[]>();

  planes.forEach((plane, roofIdx) => {
    const raw = plane.faceVertexIndices;
    const indices = raw[0] === raw[raw.length - 1] ? raw.slice(0, -1) : raw;

    const edges: EdgeOccurrence[] = [];
    let outIdx = 0;
    for (let i = 0; i < indices.length; i++) {
      const va = indices[i];
      const vb = indices[(i + 1) % indices.length];
      const pa = applyTransform(rawVertices[va], transform);
      const pb = applyTransform(rawVertices[vb], transform);

      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dz = pb.z - pa.z;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      // Mirror computeFaceEdges: degenerate edges are skipped so output indices line up with the UI list.
      if (len < minLen) continue;

      const occ: EdgeOccurrence = { roofIndex: roofIdx, edgeIndex: outIdx, va, vb, pa, pb };
      edges.push(occ);
      const k = edgeKey(va, vb);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k)!.push(occ);
      outIdx += 1;
    }
    perPlane.push(edges);
  });

  return { perPlane, byKey };
};

const horizontalCentroid = (edges: EdgeOccurrence[]): Vector2 => {
  if (edges.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  edges.forEach(e => {
    sx += e.pa.x;
    sy += e.pa.y;
  });
  return { x: sx / edges.length, y: sy / edges.length };
};

const edgeSlopeDeg = (occ: EdgeOccurrence): number => {
  const dx = occ.pb.x - occ.pa.x;
  const dy = occ.pb.y - occ.pa.y;
  const dz = occ.pb.z - occ.pa.z;
  const horiz = Math.sqrt(dx * dx + dy * dy);
  if (horiz < 1e-6) return 90;
  return (Math.atan2(Math.abs(dz), horiz) * 180) / Math.PI;
};

// Decide whether a shared-edge classification looks like a high line (faitage/arêtier) or a valley (noue),
// based on water flow: if both planes' downslope vectors point AWAY from the edge, water flows down both
// sides → high line. If both point TOWARD the edge, water converges → valley.
const classifyConvexity = (occ: EdgeOccurrence, otherOcc: EdgeOccurrence, planes: RoofPlane[], centroids: Vector2[]): 'high' | 'valley' | 'ambiguous' => {
  const plane = planes[occ.roofIndex];
  const other = planes[otherOcc.roofIndex];
  if (plane.azimuthDeg == null || other.azimuthDeg == null) return 'ambiguous';

  const mid: Vector2 = { x: (occ.pa.x + occ.pb.x) / 2, y: (occ.pa.y + occ.pb.y) / 2 };
  const toThis: Vector2 = { x: centroids[occ.roofIndex].x - mid.x, y: centroids[occ.roofIndex].y - mid.y };
  const toOther: Vector2 = { x: centroids[otherOcc.roofIndex].x - mid.x, y: centroids[otherOcc.roofIndex].y - mid.y };

  const dsThis = azimuthToDownslope(plane.azimuthDeg);
  const dsOther = azimuthToDownslope(other.azimuthDeg);

  const awayThis = dot2(dsThis, toThis) > 0;
  const awayOther = dot2(dsOther, toOther) > 0;

  if (awayThis && awayOther) return 'high';
  if (!awayThis && !awayOther) return 'valley';
  return 'ambiguous';
};

const classifyEdge = (
  occ: EdgeOccurrence,
  occurrences: EdgeOccurrence[],
  planes: RoofPlane[],
  centroids: Vector2[],
  planeZMax: number[],
  thresholds: RoofMappingThresholds
): RoofEdgeTypeId => {
  const slope = edgeSlopeDeg(occ);
  const isHorizontal = slope < thresholds.horizontalSlopeDeg;
  const otherOcc = occurrences.find(o => o.roofIndex !== occ.roofIndex);

  if (!otherOcc) {
    return isHorizontal ? 'egout' : 'rive';
  }

  if (isHorizontal) return 'faitage';

  const convexity = classifyConvexity(occ, otherOcc, planes, centroids);
  if (convexity === 'high') return 'aretier';
  if (convexity === 'valley') return 'noue';

  const zMid = (occ.pa.z + occ.pb.z) / 2;
  const topAltitude = Math.min(planeZMax[occ.roofIndex], planeZMax[otherOcc.roofIndex]);
  return zMid >= topAltitude - thresholds.ridgeAltitudeToleranceMeters ? 'aretier' : 'noue';
};

export const classifyRoofEdges = (cityJson: CityJsonData | null | undefined, options: Partial<RoofMappingThresholds> = {}): RoofMappingResult => {
  if (!cityJson || !cityJson.vertices) return { edgeTypes: {}, buildingConfidence: 0 };

  const thresholds: RoofMappingThresholds = { ...DEFAULT_THRESHOLDS, ...options };
  const planes = extractRoofPlanes(cityJson);
  if (planes.length === 0) return { edgeTypes: {}, buildingConfidence: 0 };

  const rawVertices = cityJson.vertices as unknown as number[][];
  const transform = (cityJson as any).transform;

  const { perPlane, byKey } = buildPlaneEdges(planes, rawVertices, transform, thresholds.minEdgeLengthMeters);
  const centroids = perPlane.map(horizontalCentroid);
  const planeZMax = planes.map((p, i) => (p.zMax != null ? p.zMax : Math.max(...perPlane[i].map(e => Math.max(e.pa.z, e.pb.z)), -Infinity)));

  const edgeTypes: RoofEdgeTypeMap = {};

  perPlane.forEach((edges, roofIdx) => {
    const perEdge: Record<number, string> = {};
    edges.forEach(occ => {
      const occurrences = byKey.get(edgeKey(occ.va, occ.vb)) ?? [];
      perEdge[occ.edgeIndex] = classifyEdge(occ, occurrences, planes, centroids, planeZMax, thresholds);
    });
    edgeTypes[roofIdx] = perEdge;
  });

  return { edgeTypes, buildingConfidence: computeBuildingConfidence(cityJson) };
};
