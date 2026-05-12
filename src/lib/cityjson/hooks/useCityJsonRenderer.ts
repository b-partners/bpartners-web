import * as THREE from 'three';
import { Earcut } from 'three/src/extras/Earcut.js';
import { CityJsonData, CityJsonRendererOptions, DEFAULT_SURFACE_COLORS, SurfaceType } from '../types';

const triangulatePolygon = (faceIndices: number[], vertices: number[][]): number[][] => {
  if (faceIndices.length === 3) {
    return [[faceIndices[0], faceIndices[1], faceIndices[2]]];
  }

  const pts = faceIndices.map(idx => new THREE.Vector3(...(vertices[idx] as [number, number, number])));

  // Newell's method: accumulates all edges so collinear first-3-vertices (common on
  // roof ridge/hip lines) never produce a zero/NaN normal.
  const normal = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    normal.x += (curr.y - next.y) * (curr.z + next.z);
    normal.y += (curr.z - next.z) * (curr.x + next.x);
    normal.z += (curr.x - next.x) * (curr.y + next.y);
  }
  normal.normalize();

  // Degenerate polygon (all points collinear) — nothing to render.
  if (normal.lengthSq() < 0.5) return [];

  // build local 2D axes on the polygon plane; find the first non-zero edge for axisX
  // so duplicate adjacent vertices don't break the projection either.
  let axisX = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < pts.length; i++) {
    const candidate = pts[(i + 1) % pts.length].clone().sub(pts[i]).normalize();
    if (candidate.lengthSq() > 0.5) {
      axisX = candidate;
      break;
    }
  }
  const axisY = normal.clone().cross(axisX).normalize();
  const v0 = pts[0];

  // project all vertices onto local 2D plane
  const coords: number[] = [];
  pts.forEach(p => {
    const local = p.clone().sub(v0);
    coords.push(local.dot(axisX), local.dot(axisY));
  });

  const result = Earcut.triangulate(coords, undefined, 2);
  const triangles: number[][] = [];

  for (let i = 0; i < result.length; i += 3) {
    triangles.push([faceIndices[result[i]], faceIndices[result[i + 1]], faceIndices[result[i + 2]]]);
  }

  return triangles;
};

const buildGeometry = (faces: number[][], vertices: number[][], faceUVs: Array<Array<[number, number]> | null>): THREE.BufferGeometry => {
  const positions: number[] = [];
  const uvs: number[] = [];

  faces.forEach((face, faceIdx) => {
    const triangles = triangulatePolygon(face, vertices); // ← pass vertices
    const faceUV = faceUVs[faceIdx];

    triangles.forEach(([a, b, c]) => {
      [a, b, c].forEach((vIdx, localIdx) => {
        const [x, y, z] = vertices[vIdx];
        positions.push(x, y, z);

        if (faceUV) {
          const uvIndex = face.indexOf([a, b, c][localIdx]);
          const uv = faceUV[uvIndex] ?? [0, 0];
          uvs.push(uv[0], uv[1]);
        } else {
          uvs.push(0, 0);
        }
      });
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();

  return geometry;
};
const applyTransform = (vertices: number[][], transform?: { scale: number[]; translate: number[] }): number[][] => {
  if (!transform) return vertices;
  const { scale, translate } = transform;
  return vertices.map(([x, y, z]) => [x * scale[0] + translate[0], y * scale[1] + translate[1], z * scale[2] + translate[2]]);
};

const parseCityJson = (cityJson: CityJsonData) => {
  const textureVertices: Array<[number, number]> = cityJson.appearance?.['vertices-texture'] ?? [];
  const textureUrl: string = cityJson.appearance?.textures?.[0]?.image ?? '';

  const realVertices = applyTransform(cityJson.vertices as number[][], (cityJson as any).transform);

  const sum = realVertices.reduce((acc, [x, y, z]) => [acc[0] + x, acc[1] + y, acc[2] + z], [0, 0, 0]);
  const center = sum.map(v => v / realVertices.length);

  const globalVertices = realVertices.map(([x, y, z]) => [x - center[0], z - center[2], -(y - center[1])]);

  const surfaceFaces: Record<string, number[][]> = {};
  const surfaceUVs: Record<string, Array<Array<[number, number]> | null>> = {};

  Object.values(cityJson.CityObjects).forEach(obj => {
    if (Array.isArray(obj.children)) return;

    obj.geometry?.forEach((geom: any) => {
      const surfaces: Array<{ type: string }> = geom.semantics?.surfaces ?? [];
      const texValues: Array<number[][] | null> = geom.appearance?.texture?.default?.values ?? [];

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
        const surfaceType = surfaceIdx != null ? surfaces[surfaceIdx]?.type ?? 'Unknown' : 'Unknown';
        const face = Array.isArray(boundary) && Array.isArray(boundary[0]) ? boundary[0] : boundary;

        if (!Array.isArray(face) || face.length < 3 || !face.every((v: any) => typeof v === 'number')) return;

        if (!surfaceFaces[surfaceType]) {
          surfaceFaces[surfaceType] = [];
          surfaceUVs[surfaceType] = [];
        }

        const texIndices = texValues[bIdx]?.[0] ?? null;
        const faceUV = texIndices ? texIndices.map((i: number) => textureVertices[i] as [number, number]) : null;

        surfaceFaces[surfaceType].push(face as any);
        surfaceUVs[surfaceType].push(faceUV);
      });
    });
  });

  return { globalVertices, surfaceFaces, surfaceUVs, textureUrl };
};

export const useCityJsonRenderer = (options: CityJsonRendererOptions = {}) => {
  const buildSceneGroup = (cityJson: CityJsonData): THREE.Group => {
    if (!cityJson || !cityJson.vertices) return new THREE.Group();

    const { globalVertices, surfaceFaces, surfaceUVs, textureUrl } = parseCityJson(cityJson);
    const colors = { ...DEFAULT_SURFACE_COLORS, ...options.colors };
    const enableTexture = options.enableTexture ?? true;
    const group = new THREE.Group();

    const texture =
      textureUrl && enableTexture
        ? (() => {
            const t = new THREE.TextureLoader().load(textureUrl);
            t.minFilter = THREE.LinearFilter;
            t.colorSpace = THREE.SRGBColorSpace;
            return t;
          })()
        : null;

    Object.entries(surfaceFaces).forEach(([surfaceType, faces]) => {
      faces.forEach((face, i) => {
        const geometry = buildGeometry([face], globalVertices, [surfaceUVs[surfaceType][i]]);

        const material = new THREE.MeshStandardMaterial({
          ...(texture && surfaceType === 'RoofSurface'
            ? { map: texture }
            : {
                color: new THREE.Color(colors[surfaceType as SurfaceType] ?? '#ffffff'),
              }),
          roughness: 0.8,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = surfaceType;
        mesh.userData.surfaceType = surfaceType;
        mesh.userData.faceVertexIndices = face;
        group.add(mesh);
      });
    });

    return group;
  };

  return { buildSceneGroup };
};
