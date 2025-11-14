import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { AttributeEvaluator, CityJSONLoader, CityJSONParser, CityJSONWorkerParser, CityObjectsMaterial, TextureManager } from 'cityjson-threejs-loader';

function fitCameraToSelection(camera, controls, box, fitOffset = 1.2) {
  // From https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24

  // const box.makeEmpty();
  // for ( const object of selection ) {

  //   box.expandByObject( object );

  // }
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

        loader.scene.traverse(c => {
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
  const ref = useRef(null);

  const [{ h, w }, setSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    const container = ref.current;

    if (!container) return () => {};

    container.addEventListener('resize', () => {
      setSize({ w: container.clientWidth, h: container.clientHeight });
    });
  }, [ref.current]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, -1, 1], up: [0, 0, 1], fov: 60, near: 0.0001, far: 4000 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.7 * Math.PI} color={0x999999} position={[0, 0, 1]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[1, 2, 3]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[-1, -2, -3]} />
        <CityScene />
      </Canvas>
    </div>
  );
}
