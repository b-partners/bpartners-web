import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { CityJSONLoader, CityJSONParser } from 'cityjson-threejs-loader';

function fitCameraToSelection(camera: any, controls: any, box: any, fitOffset = 1.2) {
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.target.clone().sub(camera.position).normalize().multiplyScalar(distance);

  controls.maxDistance = distance * 10;
  controls.target.copy(center);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(controls.target).sub(direction);

  controls.update();
}

const parser = new CityJSONParser();
parser.chunkSize = 2000;
const loader = new CityJSONLoader(parser);

const CityScene = () => {
  const { scene, camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return () => {};
    fetch('/city-json-mock.json')
      .then(res => res.json())
      .then(citymodel => {
        loader.load(citymodel);

        loader.scene.traverse((c: any) => {
          if (c.material && c.material.isCityObjectsMaterial) {
            c.material.side = THREE.BackSide;
          }
        });

        const bbox = loader.boundingBox.clone();
        bbox.applyMatrix4(loader.matrix);

        fitCameraToSelection(camera, controls, bbox);
        scene.add(loader.scene);
      });
  }, [controlsRef]);

  return <OrbitControls ref={controlsRef} />;
};

export function Annotator3D() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, -1, 1], up: [0, 0, 1], fov: 60, near: 0.0001, far: 4000 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.7 * Math.PI} color={0x999999} position={[0, 0, 1]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[1, 2, 3]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[-1, -2, -3]} />
        <CityScene />
      </Canvas>
    </div>
  );
}
