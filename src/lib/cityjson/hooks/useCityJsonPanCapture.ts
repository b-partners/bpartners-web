import { useThree } from '@react-three/fiber';
import { MutableRefObject, useEffect } from 'react';
import * as THREE from 'three';
import { create } from 'zustand';

export interface PanCapture {
  index: number;
  dataUrl: string;
}

interface PanCaptureStore {
  nonce: number;
  captures: PanCapture[];
  isCapturing: boolean;
  captureMode: boolean;
  triggerCapture: () => void;
  setCaptures: (captures: PanCapture[]) => void;
  setIsCapturing: (value: boolean) => void;
  setCaptureMode: (value: boolean) => void;
  clear: () => void;
}

export const useCityJsonPanCaptureStore = create<PanCaptureStore>(set => ({
  nonce: 0,
  captures: [],
  isCapturing: false,
  captureMode: false,
  triggerCapture: () => set(state => ({ nonce: state.nonce + 1, captures: [], isCapturing: true })),
  setCaptures: captures => set({ captures }),
  setIsCapturing: isCapturing => set({ isCapturing }),
  setCaptureMode: captureMode => set({ captureMode }),
  clear: () => set({ captures: [], isCapturing: false, captureMode: false }),
}));

const HIGHLIGHT_COLOR = new THREE.Color('#fabb56');
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const ELEVATION_RAD = (50 * Math.PI) / 180;
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
  return sum.normalize();
};

const captureMesh = async (
  mesh: THREE.Mesh,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  gl: THREE.WebGLRenderer,
  controls: any
): Promise<string> => {
  if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
  const sphere = mesh.geometry.boundingSphere ?? new THREE.Sphere(new THREE.Vector3(), 1);
  const center = sphere.center.clone().applyMatrix4(mesh.matrixWorld);
  const radius = Math.max(sphere.radius, 0.5);

  const normal = computeMeshNormal(mesh);
  if (normal.y < 0) normal.negate();
  const horizontalNormal = new THREE.Vector3(normal.x, 0, normal.z);
  if (horizontalNormal.lengthSq() < 0.01) horizontalNormal.set(1, 0, 1);
  horizontalNormal.normalize();

  const cameraDir = horizontalNormal
    .clone()
    .multiplyScalar(Math.cos(ELEVATION_RAD))
    .add(WORLD_UP.clone().multiplyScalar(Math.sin(ELEVATION_RAD)))
    .normalize();

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

  useEffect(() => {
    if (nonce === 0) return;
    const group = groupRef.current;
    if (!group) {
      setIsCapturing(false);
      return;
    }

    const roofMeshes: THREE.Mesh[] = [];
    group.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.userData?.surfaceType === 'RoofSurface') roofMeshes.push(mesh);
    });

    if (!roofMeshes.length) {
      setCaptures([]);
      setIsCapturing(false);
      return;
    }

    const run = async () => {
      const persp = camera as THREE.PerspectiveCamera;
      const controls = controlsRef.current;

      const savedPosition = camera.position.clone();
      const savedUp = camera.up.clone();
      const savedQuaternion = camera.quaternion.clone();
      const savedTarget = controls?.target ? controls.target.clone() : null;

      setCaptureMode(true);
      setSelectedMesh(roofMeshes[0]);
      await nextFrame();
      await nextFrame();
      gl.render(scene, camera);
      await new Promise<void>(resolve => setTimeout(resolve, 800));

      const captures: PanCapture[] = [];

      for (let i = 0; i < roofMeshes.length; i++) {
        const mesh = roofMeshes[i];
        setSelectedMesh(mesh);
        await nextFrame();
        await nextFrame();

        const dataUrl = await captureMesh(mesh, scene, persp, gl, controls);
        captures.push({ index: i + 1, dataUrl });
      }

      setCaptureMode(false);
      setSelectedMesh(null);

      if (controls?.target && savedTarget) controls.target.copy(savedTarget);
      camera.position.copy(savedPosition);
      camera.up.copy(savedUp);
      camera.quaternion.copy(savedQuaternion);
      persp.updateProjectionMatrix();
      if (controls?.update) controls.update();
      gl.render(scene, camera);

      setCaptures(captures);
      setIsCapturing(false);
    };

    run();
  }, [nonce]);
};
