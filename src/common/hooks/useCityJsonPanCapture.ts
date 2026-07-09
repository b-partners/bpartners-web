import { roof3DStore, Vec3Tuple } from '@/common/store';
import { getFaceMeasure } from '@/lib/cityjson';
import { useThree } from '@react-three/fiber';
import { MutableRefObject, useEffect } from 'react';
import * as THREE from 'three';
import { create } from 'zustand';

export type PanCaptureKind = 'pan' | 'polygon' | 'line';

export interface PanCapture {
  index: number;
  dataUrl: string;
  label: string;
  kind: PanCaptureKind;
  angle: number;
}

interface PanCaptureStore {
  nonce: number;
  captures: PanCapture[];
  isCapturing: boolean;
  captureMode: boolean;
  isMounted: boolean;
  triggerCapture: () => void;
  setCaptures: (captures: PanCapture[]) => void;
  setIsCapturing: (value: boolean) => void;
  setCaptureMode: (value: boolean) => void;
  setMounted: (value: boolean) => void;
  clear: () => void;
}

export const useCityJsonPanCaptureStore = create<PanCaptureStore>(set => ({
  nonce: 0,
  captures: [],
  isCapturing: false,
  captureMode: false,
  isMounted: false,
  triggerCapture: () => set(state => ({ nonce: state.nonce + 1, captures: [], isCapturing: true })),
  setCaptures: captures => set({ captures }),
  setIsCapturing: isCapturing => set({ isCapturing }),
  setCaptureMode: captureMode => set({ captureMode }),
  setMounted: isMounted => set({ isMounted }),
  clear: () => set({ captures: [], isCapturing: false, captureMode: false }),
}));

const HIGHLIGHT_COLOR = new THREE.Color('#fabb56');
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const MIN_ELEVATION_RAD = (35 * Math.PI) / 180;
const FRAME_PADDING = 1.2;
const EDGE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];
const LABEL_WHITE = '#ffffff';

interface MeasureLabel {
  position: THREE.Vector3;
  texts: string[];
  color: string;
}

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

const footprintUpAngle = (cameraDir: THREE.Vector3, footprintZSign: number): number => {
  const camX = new THREE.Vector3().crossVectors(WORLD_UP, cameraDir);
  if (camX.lengthSq() < 1e-8) return 0;
  camX.normalize();
  const camY = new THREE.Vector3().crossVectors(cameraDir, camX).normalize();
  return Math.PI / 2 - Math.atan2(footprintZSign * camY.z, camY.x);
};

const projectToScreen = (point: THREE.Vector3, camera: THREE.Camera, width: number, height: number) => {
  const projected = point.clone().project(camera);
  return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height, visible: projected.z < 1 };
};

const readTargetToCanvas = (gl: THREE.WebGLRenderer, renderTarget: THREE.WebGLRenderTarget, width: number, height: number): HTMLCanvasElement => {
  const buffer = new Uint8Array(width * height * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);

  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  source.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), 0, 0);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.translate(0, height);
    ctx.scale(1, -1);
    ctx.drawImage(source, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  return canvas;
};

const drawMeasureLabels = (canvas: HTMLCanvasElement, labels: MeasureLabel[], camera: THREE.Camera, width: number, height: number, ratio: number): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx || !labels.length) return canvas.toDataURL('image/png');

  const fontSize = 14 * ratio;
  const padX = 8 * ratio;
  const padY = 4 * ratio;
  const gap = 3 * ratio;
  const radius = 5 * ratio;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  labels.forEach(({ position, texts, color }) => {
    const { x, y, visible } = projectToScreen(position, camera, width, height);
    if (!visible) return;
    const pillHeight = fontSize + padY * 2;
    const totalHeight = pillHeight * texts.length + gap * (texts.length - 1);
    let pillY = y - totalHeight / 2;
    texts.forEach(text => {
      const pillWidth = ctx.measureText(text).width + padX * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.beginPath();
      ctx.roundRect(x - pillWidth / 2, pillY, pillWidth, pillHeight, radius);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(text, x, pillY + pillHeight / 2);
      pillY += pillHeight + gap;
    });
  });

  return canvas.toDataURL('image/png');
};

const panMeasureLabels = (mesh: THREE.Mesh, cityJson: any): MeasureLabel[] => {
  const { edges, area, centroid } = getFaceMeasure(mesh, cityJson);
  const labels: MeasureLabel[] = edges.map(edge => ({ position: edge.midpoint, texts: [`${edge.distanceMeters} m`], color: edge.color }));
  labels.push({ position: centroid, texts: [`${area} m²`], color: LABEL_WHITE });
  return labels;
};

const polygonMeasureLabels = (polygon: {
  points: Vec3Tuple[];
  centroid: Vec3Tuple;
  area: number;
  edges: { pointA: Vec3Tuple; pointB: Vec3Tuple; distanceSlope: number; slopeAngle: number }[];
}): MeasureLabel[] => {
  const labels: MeasureLabel[] = polygon.edges.map((edge, i) => {
    const a = new THREE.Vector3(...edge.pointA);
    const b = new THREE.Vector3(...edge.pointB);
    const mid = a.add(b).multiplyScalar(0.5);
    mid.y += 0.5;
    return { position: mid, texts: [`${edge.distanceSlope} m`, `${edge.slopeAngle}°`], color: EDGE_COLORS[i % EDGE_COLORS.length] };
  });
  labels.push({ position: new THREE.Vector3(...polygon.centroid), texts: [`${polygon.area} m²`], color: LABEL_WHITE });
  return labels;
};

const lineMeasureLabels = (line: { pointA: Vec3Tuple; pointB: Vec3Tuple; distanceSlope: number; slopeAngle: number }): MeasureLabel[] => {
  const mid = new THREE.Vector3(...line.pointA).add(new THREE.Vector3(...line.pointB)).multiplyScalar(0.5);
  return [{ position: mid, texts: [`${line.distanceSlope} m`, `${line.slopeAngle}°`], color: LABEL_WHITE }];
};

const computeMeshNormal = (mesh: THREE.Mesh): THREE.Vector3 => {
  const normalAttr = mesh.geometry.getAttribute('normal');
  if (!normalAttr) return WORLD_UP.clone();
  const sum = new THREE.Vector3();
  for (let i = 0; i < normalAttr.count; i++) {
    sum.x += normalAttr.getX(i);
    sum.y += normalAttr.getY(i);
    sum.z += normalAttr.getZ(i);
  }
  if (sum.lengthSq() < 1e-6) return WORLD_UP.clone();
  mesh.updateWorldMatrix(true, false);
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  return sum.applyMatrix3(normalMatrix).normalize();
};

const captureMesh = (
  mesh: THREE.Mesh,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  gl: THREE.WebGLRenderer,
  renderTarget: THREE.WebGLRenderTarget,
  width: number,
  height: number
): { canvas: HTMLCanvasElement; angle: number } => {
  if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
  const sphere = mesh.geometry.boundingSphere ?? new THREE.Sphere(new THREE.Vector3(), 1);
  const center = sphere.center.clone().applyMatrix4(mesh.matrixWorld);
  const radius = Math.max(sphere.radius, 0.5);

  const normal = computeMeshNormal(mesh);
  if (normal.y < 0) normal.negate();

  const cameraDir = normal.clone().normalize();
  const minY = Math.sin(MIN_ELEVATION_RAD);
  if (cameraDir.y < minY) {
    const horizontalNormal = new THREE.Vector3(cameraDir.x, 0, cameraDir.z);
    if (horizontalNormal.lengthSq() < 0.01) horizontalNormal.set(1, 0, 1);
    horizontalNormal.normalize();
    cameraDir.copy(horizontalNormal.multiplyScalar(Math.cos(MIN_ELEVATION_RAD)).add(WORLD_UP.clone().multiplyScalar(minY))).normalize();
  }

  const distance = (radius / Math.tan((camera.fov * Math.PI) / 360)) * FRAME_PADDING;

  camera.aspect = width / height;
  camera.position.copy(center).addScaledVector(cameraDir, distance);
  camera.up.copy(WORLD_UP);
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  const original = mesh.material as THREE.Material | THREE.Material[];
  const base = (Array.isArray(original) ? original[0] : original) as THREE.MeshStandardMaterial;
  const highlight = base.clone();
  highlight.color = HIGHLIGHT_COLOR;
  highlight.emissive = HIGHLIGHT_COLOR;
  highlight.emissiveIntensity = 0.15;
  mesh.material = highlight;

  gl.setRenderTarget(renderTarget);
  gl.render(scene, camera);
  gl.setRenderTarget(null);

  mesh.material = original;
  highlight.dispose();

  return { canvas: readTargetToCanvas(gl, renderTarget, width, height), angle: footprintUpAngle(cameraDir, -1) };
};

const boundsOfPoints = (points: Vec3Tuple[]): { center: THREE.Vector3; radius: number } => {
  const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const center = new THREE.Vector3();
  vectors.forEach(v => center.add(v));
  center.divideScalar(Math.max(vectors.length, 1));
  let radius = 0;
  vectors.forEach(v => (radius = Math.max(radius, v.distanceTo(center))));
  return { center, radius };
};

const captureBounds = (
  center: THREE.Vector3,
  radius: number,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  gl: THREE.WebGLRenderer,
  renderTarget: THREE.WebGLRenderTarget,
  width: number,
  height: number
): { canvas: HTMLCanvasElement; angle: number } => {
  const safeRadius = Math.max(radius, 0.5);
  const cameraDir = new THREE.Vector3(0.4, 1, 0.4).normalize();
  const distance = (safeRadius / Math.tan((camera.fov * Math.PI) / 360)) * FRAME_PADDING * 1.6;

  camera.aspect = width / height;
  camera.position.copy(center).addScaledVector(cameraDir, distance);
  camera.up.copy(WORLD_UP);
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  gl.setRenderTarget(renderTarget);
  gl.render(scene, camera);
  gl.setRenderTarget(null);

  return { canvas: readTargetToCanvas(gl, renderTarget, width, height), angle: footprintUpAngle(cameraDir, 1) };
};

export const useCityJsonPanCapture = (
  groupRef: MutableRefObject<THREE.Group | null>,
  _controlsRef: MutableRefObject<any>,
  setSelectedMesh: (mesh: THREE.Mesh | null) => void,
  cityJson: any
) => {
  const { gl, scene, camera, setFrameloop, invalidate } = useThree();
  const nonce = useCityJsonPanCaptureStore(state => state.nonce);
  const setCaptures = useCityJsonPanCaptureStore(state => state.setCaptures);
  const setIsCapturing = useCityJsonPanCaptureStore(state => state.setIsCapturing);
  const setMounted = useCityJsonPanCaptureStore(state => state.setMounted);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [setMounted]);

  useEffect(() => {
    if (nonce === 0) return;
    const group = groupRef.current;
    if (!group) {
      setIsCapturing(false);
      return;
    }

    setIsCapturing(true);

    const roofMeshes: THREE.Mesh[] = [];
    group.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.userData?.surfaceType === 'RoofSurface') roofMeshes.push(mesh);
    });

    const run = async () => {
      const persp = camera as THREE.PerspectiveCamera;
      const { savedPolygons, savedLines, selectedMeasureId: savedMeasureId, setSelectedMeasureId } = roof3DStore.useRoof3DStore.getState();

      const width = gl.domElement.width;
      const height = gl.domElement.height;
      const pixelRatio = gl.getPixelRatio();

      const renderTarget = new THREE.WebGLRenderTarget(width, height, { samples: 4 });
      renderTarget.texture.colorSpace = THREE.SRGBColorSpace;

      const captureCamera = new THREE.PerspectiveCamera(persp.fov, width / height, persp.near, persp.far);

      setFrameloop('never');

      const captures: PanCapture[] = [];

      try {
        if (roofMeshes.length) {
          setSelectedMeasureId(null);

          for (let i = 0; i < roofMeshes.length; i++) {
            const mesh = roofMeshes[i];
            setSelectedMesh(mesh);
            await nextFrame();
            await nextFrame();

            const { canvas, angle } = captureMesh(mesh, scene, captureCamera, gl, renderTarget, width, height);
            const dataUrl = drawMeasureLabels(canvas, panMeasureLabels(mesh, cityJson), captureCamera, width, height, pixelRatio);
            captures.push({ index: i + 1, dataUrl, label: `Pan ${i + 1}`, kind: 'pan', angle });
          }

          setSelectedMesh(null);
        }

        for (let i = 0; i < savedPolygons.length; i++) {
          const polygon = savedPolygons[i];
          setSelectedMeasureId(polygon.id);
          await nextFrame();
          await nextFrame();

          const { center, radius } = boundsOfPoints(polygon.points);
          const { canvas, angle } = captureBounds(center, radius, scene, captureCamera, gl, renderTarget, width, height);
          const dataUrl = drawMeasureLabels(canvas, polygonMeasureLabels(polygon), captureCamera, width, height, pixelRatio);
          captures.push({ index: i + 1, dataUrl, label: polygon.name, kind: 'polygon', angle });
        }

        for (let i = 0; i < savedLines.length; i++) {
          const line = savedLines[i];
          setSelectedMeasureId(line.id);
          await nextFrame();
          await nextFrame();

          const { center, radius } = boundsOfPoints([line.pointA, line.pointB]);
          const { canvas, angle } = captureBounds(center, radius, scene, captureCamera, gl, renderTarget, width, height);
          const dataUrl = drawMeasureLabels(canvas, lineMeasureLabels(line), captureCamera, width, height, pixelRatio);
          captures.push({ index: i + 1, dataUrl, label: line.name, kind: 'line', angle });
        }

        setSelectedMeasureId(savedMeasureId);
      } finally {
        gl.setRenderTarget(null);
        renderTarget.dispose();
        setFrameloop('always');
        invalidate();
        setCaptures(captures);
        setIsCapturing(false);
      }
    };

    run();
  }, [nonce]);
};
