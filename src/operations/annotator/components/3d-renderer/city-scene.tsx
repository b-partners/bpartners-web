import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { FC, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { useCityJsonHighlight, useCityJsonPointMeasure, useCityJsonPolygonMeasure, useCityJsonRenderer } from 'cityjson-react';
import { ThreeDMeasureMode } from './annotator-3d';
import { RaycasterHandler } from './annotator-3d-raycaster';
import { FaceMeasureLabels } from './face-measure-labels';
import { PointMeasureLine } from './point-measure-line';
import { PolygonMeasureLine } from './polygon-measure-line';

interface CitySceneProps {
  cityJson: any;
  measureMode: ThreeDMeasureMode;
}

export const CityScene: FC<CitySceneProps> = ({ cityJson, measureMode }) => {
  const { scene, camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const { buildSceneGroup } = useCityJsonRenderer({ enableTexture: true });
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);

  const { onClick } = useCityJsonHighlight(scene, cityGroupRef.current, setSelectedMesh);
  const { result: lineResult, pendingPoint, onMouseDown: lineMD, onMouseUp: lineMU, reset: lineReset } = useCityJsonPointMeasure(cityGroupRef.current);

  const {
    result: polyResult,
    points,
    previewPoint,
    onMouseDown: polyMD,
    onMouseUp: polyMU,
    onMouseMove: polyMM,
    onDoubleClick: polyDC,
    reset: polyReset,
  } = useCityJsonPolygonMeasure(cityGroupRef.current);

  useEffect(() => {
    lineReset();
    polyReset();
    setSelectedMesh(null);
  }, [measureMode]);

  useEffect(() => {
    if (!cityJson) return;

    if (cityGroupRef.current) {
      cityGroupRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: any) => m.dispose());
      });
      scene.remove(cityGroupRef.current);
    }

    const group = buildSceneGroup(cityJson);
    scene.add(group);
    cityGroupRef.current = group;

    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    camera.position.set(center.x, center.y + maxDim, center.z + maxDim);
    camera.up.set(0, 1, 0);
    camera.lookAt(center);

    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }

    return () => {
      if (cityGroupRef.current) scene.remove(cityGroupRef.current);
    };
  }, [cityJson]);

  useEffect(() => {
    const dom = gl.domElement;
    let mouseDownPos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownPos = { x: e.clientX, y: e.clientY };
      if (measureMode === 'line') lineMD(e);
      if (measureMode === 'polygon') polyMD(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);
      if (dx > 4 || dy > 4) return;

      if (measureMode === 'line') lineMU(e, camera, dom);
      else if (measureMode === 'polygon') polyMU(e, camera, dom);
      else onClick(e, camera, dom);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (measureMode === 'polygon') polyMM(e, camera, dom);
    };

    const handleDoubleClick = () => {
      if (measureMode === 'polygon') polyDC();
    };

    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('dblclick', handleDoubleClick);

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [cityGroupRef.current, camera, measureMode]);

  return (
    <>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />
      {measureMode === 'none' && <FaceMeasureLabels mesh={selectedMesh} cityJson={cityJson} />}
      {measureMode === 'line' && <PointMeasureLine result={lineResult} pendingPoint={pendingPoint} />}
      {measureMode === 'polygon' && <PolygonMeasureLine result={polyResult} points={points} previewPoint={previewPoint} />}
      {!!cityJson && <RaycasterHandler citymodel={cityJson} />}
    </>
  );
};
