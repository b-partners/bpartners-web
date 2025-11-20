import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { FC, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { useAnnotator3DStore } from '@/common/store';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { CityJSONLoader, CityJSONParser } from 'cityjson-threejs-loader';

const AbsSwitch = () => {
  const { shouldSelectSurface, setShouldSelectSurface, selectObject, selectedObject, selectedObjectInfo, setSelectedObjectInfo } = useAnnotator3DStore();

  const handleClick = () => {
    setShouldSelectSurface(!shouldSelectSurface);
    selectObject(null);
    setSelectedObjectInfo(null);
  };

  const cityObject = selectedObject && selectedObjectInfo ? selectedObject.object.citymodel.CityObjects[selectedObjectInfo.objectId] : {};

  const pente = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.slope_in_degrees;
  const type = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.type;
  const height = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.height_in_meters;

  return (
    <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>Options</AccordionSummary>
        <AccordionDetails sx={{ minWidth: 500 }}>
          <FormControlLabel onClick={handleClick} control={<Switch checked={shouldSelectSurface} />} label='Sélectionner les surfaces' />
        </AccordionDetails>
      </Accordion>
      {selectedObject && selectedObjectInfo && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>Informations</AccordionSummary>
          <AccordionDetails>
            <Typography>{selectedObjectInfo.objectId}</Typography>
            <Typography>
              <strong>Type : </strong>
              {shouldSelectSurface ? type : cityObject?.type}
            </Typography>
            {height && (
              <Typography>
                <strong>Hauteur globale : </strong>
                {height}m
              </Typography>
            )}
            {pente && (
              <Typography>
                <strong>Pente : </strong>
                {pente}°
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

const RaycasterHandler: FC<any> = ({ citymodel }) => {
  const { camera, gl, raycaster, scene } = useThree();
  const { selectObject, setSelectedObjectInfo } = useAnnotator3DStore();

  useEffect(() => {
    const unsubscribe = useAnnotator3DStore.subscribe(({ selectedObjectInfo, shouldSelectSurface }) => {
      scene.traverse((obj: any) => {
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) {
            if (mat.isCityObjectsMaterial) {
              obj.material.highlightColor = 0x00ff00;
              mat.selectSurface = shouldSelectSurface;
              mat.highlightedObject = selectedObjectInfo || {};
            }
          }
        }
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClick = () => {
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) {
        selectObject(null);
        setSelectedObjectInfo(null);
        return;
      }

      const intersection: any = intersects[0];

      if (intersection?.object?.isCityObject) {
        const info = intersection.object.resolveIntersectionInfo(intersection, citymodel);
        selectObject(intersection);
        setSelectedObjectInfo(info);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, raycaster]);

  return null;
};

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
  const [cityModel, setCityModel] = useState(null);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) return () => {};
    fetch('/14_2.Archismart.json')
      .then(res => res.json())
      .then(citymodel => {
        setCityModel(citymodel);
        loader.load(citymodel);

        loader.scene.traverse((c: any) => {
          if (c.material && c.material.isCityObjectsMaterial) {
            c.material.side = THREE.DoubleSide;
          }
        });

        const bbox = loader.boundingBox.clone();
        bbox.applyMatrix4(loader.matrix);

        fitCameraToSelection(camera, controls, bbox);
        scene.add(loader.scene);
      });
  }, [controlsRef]);

  return (
    <>
      <OrbitControls ref={controlsRef} />
      {!!cityModel && <RaycasterHandler citymodel={cityModel} />}
    </>
  );
};

export function Annotator3D() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, -1, 1], up: [0, 0, 1], fov: 60, near: 0.0001, far: 4000 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7 * Math.PI} color={0x999999} position={[0, 0, 1]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[1, 2, 3]} />
        <directionalLight intensity={Math.PI} color={0xdddddd} position={[-1, -2, -3]} />
        <CityScene />
      </Canvas>
      <AbsSwitch />
    </div>
  );
}
