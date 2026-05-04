import { useRef, useState } from "react";
import * as THREE from "three";

export interface PolygonEdge {
  pointA: THREE.Vector3;
  pointB: THREE.Vector3;
  distanceSlope: number;
  slopeAngle: number;
}

export interface PolygonMeasureResult {
  points: THREE.Vector3[];
  edges: PolygonEdge[];
  area: number;
  centroid: THREE.Vector3;
}

const CLOSE_THRESHOLD = 0.5;

const raycast = (
  e: MouseEvent,
  camera: THREE.Camera,
  domElement: HTMLElement,
  group: THREE.Group,
): THREE.Vector3 | null => {
  const rect = domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(group.children, true);
  return intersects.length ? intersects[0].point.clone() : null;
};

const computeEdges = (points: THREE.Vector3[]): PolygonEdge[] =>
  points.map((a, i) => {
    const b = points[(i + 1) % points.length];
    const distanceSlope = Math.round(a.distanceTo(b) * 100) / 100;
    const flatX = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.z - a.z, 2));
    const slopeAngle =
      Math.round(
        Math.atan2(Math.abs(b.y - a.y), flatX) * (180 / Math.PI) * 100,
      ) / 100;
    return { pointA: a, pointB: b, distanceSlope, slopeAngle };
  });

const computeArea = (points: THREE.Vector3[]): number => {
  let area = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const ab = points[i].clone().sub(points[0]);
    const ac = points[i + 1].clone().sub(points[0]);
    area += ab.cross(ac).length() / 2;
  }
  return Math.round(area * 100) / 100;
};

const computeCentroid = (points: THREE.Vector3[]): THREE.Vector3 =>
  points
    .reduce((acc, v) => acc.add(v.clone()), new THREE.Vector3())
    .divideScalar(points.length);

export const useCityJsonPolygonMeasure = (group: THREE.Group | null) => {
  const [result, setResult] = useState<PolygonMeasureResult | null>(null);
  const [previewPoint, setPreviewPoint] = useState<THREE.Vector3 | null>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  const pointsRef = useRef<THREE.Vector3[]>([]);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  const reset = () => {
    setResult(null);
    setPoints([]);
    setPreviewPoint(null);
    pointsRef.current = [];
  };

  const closePolygon = (pts: THREE.Vector3[]) => {
    if (pts.length < 3) return;
    const edges = computeEdges(pts);
    const area = computeArea(pts);
    const centroid = computeCentroid(pts);
    centroid.y += 1;
    setResult({ points: pts, edges, area, centroid });
    pointsRef.current = [];
    setPoints([]);
    setPreviewPoint(null);
  };

  const onMouseDown = (e: MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (
    e: MouseEvent,
    camera: THREE.Camera,
    domElement: HTMLElement,
  ) => {
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    if (dx > 4 || dy > 4 || !group) return;

    const point = raycast(e, camera, domElement, group);
    if (!point) return;

    const current = pointsRef.current;

    if (current.length >= 3 && point.distanceTo(current[0]) < CLOSE_THRESHOLD) {
      closePolygon(current);
      return;
    }

    const updated = [...current, point];
    pointsRef.current = updated;
    setPoints([...updated]);
    setResult(null);
  };

  const onMouseMove = (
    e: MouseEvent,
    camera: THREE.Camera,
    domElement: HTMLElement,
  ) => {
    if (!group || pointsRef.current.length === 0) return;
    const point = raycast(e, camera, domElement, group);
    if (point) setPreviewPoint(point);
  };

  const onDoubleClick = () => {
    closePolygon(pointsRef.current);
  };

  return {
    result,
    points,
    previewPoint,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onDoubleClick,
    reset,
  };
};
