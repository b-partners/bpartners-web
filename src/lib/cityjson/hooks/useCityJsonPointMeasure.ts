import { useRef, useState } from "react";
import * as THREE from "three";

export interface PointMeasureResult {
  pointA: THREE.Vector3;
  pointB: THREE.Vector3;
  distanceSlope: number;
  slopeAngle: number;
}

export const useCityJsonPointMeasure = (group: THREE.Group | null) => {
  const [result, setResult] = useState<PointMeasureResult | null>(null);
  const [pendingPoint, setPendingPoint] = useState<THREE.Vector3 | null>(null);
  const pendingPointRef = useRef<THREE.Vector3 | null>(null);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  const reset = () => {
    setResult(null);
    setPendingPoint(null);
    pendingPointRef.current = null;
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
    if (dx > 4 || dy > 4) return;

    if (!group) return;

    const rect = domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(group.children, true);
    if (!intersects.length) return;

    const point = intersects[0].point.clone();

    if (!pendingPointRef.current) {
      pendingPointRef.current = point;
      setPendingPoint(point);
      setResult(null);
      return;
    }

    const a = pendingPointRef.current;
    const b = point;

    const distanceSlope = Math.round(a.distanceTo(b) * 100) / 100;
    const flatX = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.z - a.z, 2));
    const slopeAngle =
      Math.round(
        Math.atan2(Math.abs(b.y - a.y), flatX) * (180 / Math.PI) * 100,
      ) / 100;

    setResult({ pointA: a, pointB: b, distanceSlope, slopeAngle });
    pendingPointRef.current = null;
    setPendingPoint(null);
  };

  return { result, pendingPoint, onMouseDown, onMouseUp, reset };
};
