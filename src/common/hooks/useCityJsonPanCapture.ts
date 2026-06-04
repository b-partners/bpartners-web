import { roof3DStore, Vec3Tuple } from '@/common/store';
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

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

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

const captureMesh = async (mesh: THREE.Mesh, scene: THREE.Scene, camera: THREE.PerspectiveCamera, gl: THREE.WebGLRenderer, controls: any): Promise<string> => {
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

  if (controls?.target) controls.target.copy(center);

  camera.position.copy(center).addScaledVector(cameraDir, distance);
  camera.up.copy(WORLD_UP);
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  if (controls?.update) controls.update();

  const original = mesh.material as THREE.Material | THREE.Material[];
  const base = (Array.isArray(original) ? original[0] : original) as THREE.MeshStandardMaterial;
  const highlight = base.clone();
  highlight.color = HIGHLIGHT_COLOR;
  highlight.emissive = HIGHLIGHT_COLOR;
  highlight.emissiveIntensity = 0.15;
  mesh.material = highlight;

  await nextFrame();
  await nextFrame();
  gl.render(scene, camera);

  const dataUrl = gl.domElement.toDataURL('image/png');

  mesh.material = original;
  highlight.dispose();

  return dataUrl;
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

const captureBounds = async (
  center: THREE.Vector3,
  radius: number,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  gl: THREE.WebGLRenderer,
  controls: any
): Promise<string> => {
  const safeRadius = Math.max(radius, 0.5);
  const cameraDir = new THREE.Vector3(0.4, 1, 0.4).normalize();
  const distance = (safeRadius / Math.tan((camera.fov * Math.PI) / 360)) * FRAME_PADDING * 1.6;

  if (controls?.target) controls.target.copy(center);
  camera.position.copy(center).addScaledVector(cameraDir, distance);
  camera.up.copy(WORLD_UP);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  if (controls?.update) controls.update();

  await nextFrame();
  await nextFrame();
  gl.render(scene, camera);

  return gl.domElement.toDataURL('image/png');
};

export const useCityJsonPanCapture = (
  groupRef: MutableRefObject<THREE.Group | null>,
  controlsRef: MutableRefObject<any>,
  setSelectedMesh: (mesh: THREE.Mesh | null) => void
) => {
  const { gl, scene, camera } = useThree();
  const nonce = useCityJsonPanCaptureStore(state => state.nonce);
  const setCaptures = useCityJsonPanCaptureStore(state => state.setCaptures);
  const setIsCapturing = useCityJsonPanCaptureStore(state => state.setIsCapturing);
  const setCaptureMode = useCityJsonPanCaptureStore(state => state.setCaptureMode);
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
      const controls = controlsRef.current;
      const { savedPolygons, savedLines, selectedMeasureId: savedMeasureId, setSelectedMeasureId } = roof3DStore.useRoof3DStore.getState();

      const savedPosition = camera.position.clone();
      const savedUp = camera.up.clone();
      const savedQuaternion = camera.quaternion.clone();
      const savedTarget = controls?.target ? controls.target.clone() : null;
      const savedDamping = controls?.enableDamping ?? false;
      if (controls) controls.enableDamping = false;

      const captures: PanCapture[] = [];

      if (roofMeshes.length) {
        setCaptureMode(true);
        setSelectedMeasureId(null);
        setSelectedMesh(roofMeshes[0]);
        await nextFrame();
        await nextFrame();
        gl.render(scene, camera);
        await new Promise<void>(resolve => setTimeout(resolve, 800));

        for (let i = 0; i < roofMeshes.length; i++) {
          const mesh = roofMeshes[i];
          setSelectedMesh(mesh);
          await nextFrame();
          await nextFrame();

          const dataUrl = await captureMesh(mesh, scene, persp, gl, controls);
          captures.push({ index: i + 1, dataUrl, label: `Pan ${i + 1}`, kind: 'pan' });
        }

        setCaptureMode(false);
        setSelectedMesh(null);
      }

      for (let i = 0; i < savedPolygons.length; i++) {
        const polygon = savedPolygons[i];
        setSelectedMeasureId(polygon.id);
        await nextFrame();
        await nextFrame();

        const { center, radius } = boundsOfPoints(polygon.points);
        const dataUrl = await captureBounds(center, radius, scene, persp, gl, controls);
        captures.push({ index: i + 1, dataUrl, label: polygon.name, kind: 'polygon' });
      }

      for (let i = 0; i < savedLines.length; i++) {
        const line = savedLines[i];
        setSelectedMeasureId(line.id);
        await nextFrame();
        await nextFrame();

        const { center, radius } = boundsOfPoints([line.pointA, line.pointB]);
        const dataUrl = await captureBounds(center, radius, scene, persp, gl, controls);
        captures.push({ index: i + 1, dataUrl, label: line.name, kind: 'line' });
      }

      setSelectedMeasureId(savedMeasureId);

      if (controls?.target && savedTarget) controls.target.copy(savedTarget);
      camera.position.copy(savedPosition);
      camera.up.copy(savedUp);
      camera.quaternion.copy(savedQuaternion);
      persp.updateProjectionMatrix();
      if (controls) controls.enableDamping = savedDamping;
      if (controls?.update) controls.update();
      gl.render(scene, camera);

      setCaptures(captures);
      setIsCapturing(false);
    };

    run();
  }, [nonce]);
};
