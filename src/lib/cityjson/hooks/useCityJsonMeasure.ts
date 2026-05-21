import * as THREE from 'three';
import { CityJsonData } from '../types';

const EDGE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

export interface EdgeMeasure {
  midpoint: THREE.Vector3;
  start: THREE.Vector3;
  end: THREE.Vector3;
  distanceMeters: number;
  color: string;
}

export interface UseCityJsonMeasureReturn {
  edges: EdgeMeasure[];
  area: number;
  centroid: THREE.Vector3;
}

const applyTransform = (vertex: number[], transform?: { scale: number[]; translate: number[] }): number[] => {
  if (!transform) return vertex;
  const { scale, translate } = transform;
  return [vertex[0] * scale[0] + translate[0], vertex[1] * scale[1] + translate[1], vertex[2] * scale[2] + translate[2]];
};

const computeArea = (indices: number[], vertices3D: THREE.Vector3[]): number => {
  let area = 0;
  const n = indices.length;
  for (let i = 1; i < n - 1; i++) {
    const a = vertices3D[indices[0]];
    const b = vertices3D[indices[i]];
    const c = vertices3D[indices[i + 1]];
    const ab = b.clone().sub(a);
    const ac = c.clone().sub(a);
    area += ab.cross(ac).length() / 2;
  }
  return Math.round(area * 100) / 100;
};

export interface FaceEdgeMeasure {
  distanceMeters: number;
  slopeDegrees: number;
  color: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const computeFaceEdges = (faceVertexIndices: number[], cityJson: CityJsonData): FaceEdgeMeasure[] => {
  const rawVertices = cityJson.vertices as number[][];
  const transform = (cityJson as any).transform;
  const realVertices = rawVertices.map(v => applyTransform(v, transform));

  const indices = faceVertexIndices[0] === faceVertexIndices[faceVertexIndices.length - 1] ? faceVertexIndices.slice(0, -1) : faceVertexIndices;

  const result: FaceEdgeMeasure[] = [];
  for (let i = 0; i < indices.length; i++) {
    const realA = realVertices[indices[i]];
    const realB = realVertices[indices[(i + 1) % indices.length]];
    if (!realA || !realB) continue;
    const dx = realB[0] - realA[0];
    const dy = realB[1] - realA[1];
    const dz = realB[2] - realA[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.01) continue;
    const horizontal = Math.sqrt(dx * dx + dy * dy);
    const slopeRad = horizontal < 1e-9 ? Math.PI / 2 : Math.atan2(Math.abs(dz), horizontal);
    result.push({
      distanceMeters: Math.round(dist * 100) / 100,
      slopeDegrees: round1((slopeRad * 180) / Math.PI),
      color: EDGE_COLORS[i % EDGE_COLORS.length],
    });
  }
  return result;
};

export const computeFaceSlope = (faceVertexIndices: number[], cityJson: CityJsonData): number => {
  const rawVertices = cityJson.vertices as number[][];
  const transform = (cityJson as any).transform;
  const realVertices = rawVertices.map(v => applyTransform(v, transform));

  const indices = faceVertexIndices[0] === faceVertexIndices[faceVertexIndices.length - 1] ? faceVertexIndices.slice(0, -1) : faceVertexIndices;
  if (indices.length < 3) return 0;

  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < indices.length; i++) {
    const c = realVertices[indices[i]];
    const n = realVertices[indices[(i + 1) % indices.length]];
    nx += (c[1] - n[1]) * (c[2] + n[2]);
    ny += (c[2] - n[2]) * (c[0] + n[0]);
    nz += (c[0] - n[0]) * (c[1] + n[1]);
  }
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len < 1e-9) return 0;

  const cosAngle = Math.min(1, Math.abs(nz) / len);
  return round1((Math.acos(cosAngle) * 180) / Math.PI);
};

export const computeFaceArea = (faceVertexIndices: number[], cityJson: CityJsonData): number => {
  const rawVertices = cityJson.vertices as number[][];
  const transform = (cityJson as any).transform;
  const realVertices = rawVertices.map(v => applyTransform(v, transform));

  const indices = faceVertexIndices[0] === faceVertexIndices[faceVertexIndices.length - 1] ? faceVertexIndices.slice(0, -1) : faceVertexIndices;

  const points = indices.map(i => {
    const v = realVertices[i];
    return new THREE.Vector3(v[0], v[1], v[2]);
  });

  return computeArea(
    points.map((_, i) => i),
    points
  );
};

export const useCityJsonMeasure = (mesh: THREE.Mesh | null, cityJson: CityJsonData | null): UseCityJsonMeasureReturn => {
  if (!mesh || !cityJson) return { edges: [], area: 0, centroid: new THREE.Vector3() };

  const rawVertices = cityJson.vertices as number[][];
  const transform = (cityJson as any).transform;

  const realVertices = rawVertices.map(v => applyTransform(v, transform));

  const sum = realVertices.reduce((acc, [x, y, z]) => [acc[0] + x, acc[1] + y, acc[2] + z], [0, 0, 0]);
  const center = sum.map(v => v / realVertices.length);

  const toThreeSpace = (realVertex: number[]): THREE.Vector3 =>
    new THREE.Vector3(realVertex[0] - center[0], realVertex[2] - center[2], -(realVertex[1] - center[1]));

  const faceVertexIndices = mesh.userData.faceVertexIndices as number[] | undefined;

  if (!faceVertexIndices) return { edges: [], area: 0, centroid: new THREE.Vector3() };

  // remove duplicate closing vertex if present (CityJSON closed ring)
  const indices = faceVertexIndices[0] === faceVertexIndices[faceVertexIndices.length - 1] ? faceVertexIndices.slice(0, -1) : faceVertexIndices;

  const edges: EdgeMeasure[] = [];

  for (let i = 0; i < indices.length; i++) {
    const idxA = indices[i];
    const idxB = indices[(i + 1) % indices.length];

    const realA = realVertices[idxA];
    const realB = realVertices[idxB];

    if (!realA || !realB) continue;

    const dist = Math.sqrt(Math.pow(realB[0] - realA[0], 2) + Math.pow(realB[1] - realA[1], 2) + Math.pow(realB[2] - realA[2], 2));

    if (dist < 0.01) continue;

    const threeA = toThreeSpace(realA);
    const threeB = toThreeSpace(realB);
    const midpoint = threeA.clone().add(threeB).multiplyScalar(0.5);

    edges.push({
      start: threeA,
      end: threeB,
      midpoint,
      distanceMeters: Math.round(dist * 100) / 100,
      color: EDGE_COLORS[i % EDGE_COLORS.length],
    });
  }

  const threeVertices = indices.map(idx => toThreeSpace(realVertices[idx]));
  const area = computeArea(
    indices.map((_, i) => i),
    threeVertices
  );

  const centroid = threeVertices.reduce((acc, v) => acc.add(v.clone()), new THREE.Vector3()).divideScalar(threeVertices.length);
  centroid.y += 1;

  return { edges, area, centroid };
};
