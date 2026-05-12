import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HIGHLIGHT_COLOR = new THREE.Color('#fabb56');

export const useCityJsonHighlight = (group: THREE.Group | null, setSelectedMesh: (mesh: THREE.Mesh | null) => void) => {
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(null);

  const clearHighlight = () => {
    if (selectedMeshRef.current && originalMaterialRef.current) {
      selectedMeshRef.current.material = originalMaterialRef.current;
    }
    selectedMeshRef.current = null;
    originalMaterialRef.current = null;
    setSelectedMesh(null);
  };

  const highlightMesh = (mesh: THREE.Mesh) => {
    clearHighlight();

    selectedMeshRef.current = mesh;
    originalMaterialRef.current = mesh.material;

    const highlightMaterial = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;

    highlightMaterial.color = HIGHLIGHT_COLOR;
    highlightMaterial.emissive = HIGHLIGHT_COLOR;
    highlightMaterial.emissiveIntensity = 0.01;
    mesh.material = highlightMaterial;
    setSelectedMesh(mesh);
  };

  const onClick = (event: MouseEvent, camera: THREE.Camera, domElement: HTMLElement) => {
    if (event.button !== 0) return;

    const rect = domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    if (!group) return;

    const intersects = raycaster.intersectObjects(group.children, true);

    if (intersects.length === 0) return; // ← do nothing if clicking empty space

    const hit = intersects[0].object as THREE.Mesh;
    if (hit === selectedMeshRef.current) {
      clearHighlight();
      return;
    }

    highlightMesh(hit);
  };

  useEffect(() => {
    return () => clearHighlight();
  }, [group]);

  return { onClick, clearHighlight };
};
