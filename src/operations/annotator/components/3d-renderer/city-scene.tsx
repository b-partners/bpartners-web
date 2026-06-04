import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { FC, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { v4 as uuidV4 } from 'uuid';

import { useCityJsonPanCapture } from '@/common/hooks';
import { RoofSurfaceItem, Vec3Tuple, roof3DStore } from '@/common/store';
import {
  PointMeasureResult,
  PolygonMeasureResult,
  computeFaceArea,
  computeFaceEdges,
  computeFaceSlope,
  useCityJsonHighlight,
  useCityJsonPointMeasure,
  useCityJsonPolygonMeasure,
  useCityJsonRenderer,
} from '@/lib/cityjson';
import { ThreeDMeasureMode } from './annotator-3d';
import { RaycasterHandler } from './annotator-3d-raycaster';
import { FaceMeasureLabels } from './face-measure-labels';
import { PointMeasureLine } from './point-measure-line';
import { PolygonMeasureLine } from './polygon-measure-line';

interface CitySceneProps {
  cityJson: any;
  measureMode: ThreeDMeasureMode;
  setMeasureMode: (mode: ThreeDMeasureMode) => void;
}

const toTuple = (v: THREE.Vector3): Vec3Tuple => [v.x, v.y, v.z];
const toVec3 = (t: Vec3Tuple) => new THREE.Vector3(t[0], t[1], t[2]);

export const CityScene: FC<CitySceneProps> = ({ cityJson, measureMode, setMeasureMode }) => {
  const selectedRoofIndex = roof3DStore.useSelectedRoofIndex();
  const savedPolygons = roof3DStore.useSavedPolygons();
  const savedLines = roof3DStore.useSavedLines();
  const selectedMeasureId = roof3DStore.useSelectedMeasureId();
  const { setRoofSurfaces, setSelectedRoofIndex, addPolygonMeasure, addLineMeasure, setSelectedMeasureId } = roof3DStore.useRoof3DActions();
  const { scene, camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const { buildSceneGroup } = useCityJsonRenderer({ enableTexture: true });
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const autoSelectRef = useRef<string | null>(null);

  const handleSelectedMesh = (mesh: THREE.Mesh | null) => {
    setSelectedMesh(mesh);
    setSelectedMeasureId(null);
    const roofIndex = mesh?.userData?.roofIndex;
    setSelectedRoofIndex(typeof roofIndex === 'number' ? roofIndex : null);
  };

  useCityJsonPanCapture(cityGroupRef, controlsRef, setSelectedMesh);

  const { onClick, highlightMesh, clearHighlight } = useCityJsonHighlight(cityGroupRef.current, handleSelectedMesh);
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
    if (autoSelectRef.current) {
      setSelectedMeasureId(autoSelectRef.current);
      autoSelectRef.current = null;
    } else {
      setSelectedMeasureId(null);
    }
  }, [measureMode]);

  useEffect(() => {
    if (!polyResult) return;
    const id = uuidV4();
    autoSelectRef.current = id;
    addPolygonMeasure({
      id,
      name: `Polygone ${savedPolygons.length + 1}`,
      area: polyResult.area,
      points: polyResult.points.map(toTuple),
      centroid: toTuple(polyResult.centroid),
      edges: polyResult.edges.map(e => ({
        pointA: toTuple(e.pointA),
        pointB: toTuple(e.pointB),
        distanceSlope: e.distanceSlope,
        slopeAngle: e.slopeAngle,
      })),
    });
    setMeasureMode('none');
  }, [polyResult]);

  useEffect(() => {
    if (!lineResult) return;
    const id = uuidV4();
    autoSelectRef.current = id;
    addLineMeasure({
      id,
      name: `Ligne ${savedLines.length + 1}`,
      pointA: toTuple(lineResult.pointA),
      pointB: toTuple(lineResult.pointB),
      distanceSlope: lineResult.distanceSlope,
      slopeAngle: lineResult.slopeAngle,
    });
    setMeasureMode('none');
  }, [lineResult]);

  useEffect(() => {
    if (!cityJson) return;

    if (cityGroupRef.current) {
      cityGroupRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m: any) => m?.dispose());
        }
      });
      scene.remove(cityGroupRef.current);
    }

    const group = buildSceneGroup(cityJson);
    scene.add(group);
    cityGroupRef.current = group;

    const roofItems: RoofSurfaceItem[] = [];
    let roofIdx = 0;
    group.traverse((child: any) => {
      if (child instanceof THREE.Mesh && child.userData.surfaceType === 'RoofSurface') {
        child.userData.roofIndex = roofIdx;
        const face = child.userData.faceVertexIndices as number[] | undefined;
        const area = face ? computeFaceArea(face, cityJson) : 0;
        const edges = face ? computeFaceEdges(face, cityJson) : [];
        const slopeDegrees = face ? computeFaceSlope(face, cityJson) : 0;
        roofItems.push({ index: roofIdx, area, slopeDegrees, edges });
        roofIdx += 1;
      }
    });
    setRoofSurfaces(roofItems);

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
    if (!cityGroupRef.current) return;
    if (selectedRoofIndex === null) {
      clearHighlight();
      return;
    }
    let target: THREE.Mesh | null = null;
    cityGroupRef.current.traverse((child: any) => {
      if (target) return;
      if (child instanceof THREE.Mesh && child.userData.roofIndex === selectedRoofIndex) target = child;
    });
    if (target && target !== selectedMesh) highlightMesh(target);
  }, [selectedRoofIndex]);

  useEffect(() => {
    const dom = gl.domElement;
    if (measureMode === 'polygon') dom.style.cursor = 'crosshair';
    else if (measureMode === 'line') dom.style.cursor = 'crosshair';
    else dom.style.cursor = '';
    return () => {
      dom.style.cursor = '';
    };
  }, [measureMode, gl.domElement]);

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

  const selectedPolygon = savedPolygons.find(p => p.id === selectedMeasureId);
  const selectedLine = savedLines.find(l => l.id === selectedMeasureId);

  const restoredPolyResult: PolygonMeasureResult | null = selectedPolygon
    ? {
        points: selectedPolygon.points.map(toVec3),
        centroid: toVec3(selectedPolygon.centroid),
        area: selectedPolygon.area,
        edges: selectedPolygon.edges.map(e => ({
          pointA: toVec3(e.pointA),
          pointB: toVec3(e.pointB),
          distanceSlope: e.distanceSlope,
          slopeAngle: e.slopeAngle,
        })),
      }
    : null;

  const restoredLineResult: PointMeasureResult | null = selectedLine
    ? {
        pointA: toVec3(selectedLine.pointA),
        pointB: toVec3(selectedLine.pointB),
        distanceSlope: selectedLine.distanceSlope,
        slopeAngle: selectedLine.slopeAngle,
      }
    : null;

  return (
    <>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />
      {measureMode === 'none' && !selectedMeasureId && <FaceMeasureLabels mesh={selectedMesh} cityJson={cityJson} />}
      {measureMode === 'none' && restoredPolyResult && <PolygonMeasureLine result={restoredPolyResult} points={[]} previewPoint={null} />}
      {measureMode === 'none' && restoredLineResult && <PointMeasureLine result={restoredLineResult} pendingPoint={null} />}
      {measureMode === 'line' && <PointMeasureLine result={lineResult} pendingPoint={pendingPoint} />}
      {measureMode === 'polygon' && <PolygonMeasureLine result={polyResult} points={points} previewPoint={previewPoint} />}
      {!!cityJson && <RaycasterHandler citymodel={cityJson} />}
    </>
  );
};
