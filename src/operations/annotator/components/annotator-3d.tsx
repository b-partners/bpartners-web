import { Polygon } from '@bpartners/annotator-component';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { BPLoader } from '@/common/components';
import { useCitJSONProcessQuery } from '@/common/fetcher';
import { useAnnotator3DStore } from '@/common/store';
import { CityJSONRequestStatus } from '@/providers/city-json-provider';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { WarningOutlined } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { CityJSONLoader, CityJSONParser } from 'cityjson-threejs-loader';
import { RaycasterHandler } from './annotator-3d-raycaster';
import { Annotator3DSaveImage } from './annotator-3d-save-image';

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

interface CitySceneProps {
  cityJson: any;
}

const CityScene: FC<CitySceneProps> = ({ cityJson }) => {
  const { scene, camera } = useThree();
  const controlsRef = useRef();
  const [cityModel, setCityModel] = useState(null);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) return () => {};

    setCityModel(cityJson);
    loader.load(cityJson);

    loader.scene.traverse((c: any) => {
      if (c.material && c.material.isCityObjectsMaterial) {
        c.material.side = THREE.DoubleSide;
      }
    });

    const bbox = loader.boundingBox.clone();
    bbox.applyMatrix4(loader.matrix);

    fitCameraToSelection(camera, controls, bbox);
    scene.add(loader.scene);
  }, [controlsRef]);

  return (
    <>
      <OrbitControls ref={controlsRef} />
      {!!cityModel && <RaycasterHandler citymodel={cityModel} />}
    </>
  );
};

interface Annotator3DProps {
  width: number | string;
  height: number | string;
  active?: boolean;
  polygons?: Polygon[];
  areaPicture?: AreaPictureDetails;
}

const Annotator3DErrorUI: FC<{ error: Error }> = ({ error }) => {
  const { errorMessage, status } = useMemo(() => {
    let result = {
      errorMessage: 'Une erreur est survenue lors de la génération de la version 3D de votre maison.',
      status: CityJSONRequestStatus.FAILED,
    };

    if (error.message.includes(CityJSONRequestStatus.UNAVAILABLE)) {
      result = {
        errorMessage: 'La version 3D de la maison est actuellement indisponible, mais sera disponible prochainement.',
        status: CityJSONRequestStatus.UNAVAILABLE,
      };
    }

    return result;
  }, [error?.message]);

  return (
    <Alert sx={{ mt: 2 }} icon={<WarningOutlined />} severity={status === CityJSONRequestStatus.UNAVAILABLE ? 'warning' : 'error'}>
      {errorMessage}
    </Alert>
  );
};

export const Annotator3D: FC<Annotator3DProps> = ({ height, width, areaPicture, polygons = [], active = false }) => {
  const { isLoading, error, isError, data: cityJson } = useCitJSONProcessQuery(polygons.length === 1 ? polygons[0] : undefined, areaPicture, active);

  const { cityJsonModel, setCityJsonModel } = useAnnotator3DStore();

  useEffect(() => {
    if (!cityJsonModel && cityJson) {
      setCityJsonModel(cityJson);
    }
  }, [cityJson]);

  if (!active) {
    return null;
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      {!isError && !error && !isLoading && (
        <Canvas
          camera={{ position: [0, -1, 1], up: [0, 0, 1], fov: 60, near: 0.0001, far: 4000 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true, alpha: true, premultipliedAlpha: false }}
        >
          <ambientLight intensity={0.7 * Math.PI} color={0x999999} position={[0, 0, 1]} />
          <directionalLight intensity={Math.PI} color={0xdddddd} position={[1, 2, 3]} />
          <directionalLight intensity={Math.PI} color={0xdddddd} position={[-1, -2, -3]} />
          <CityScene cityJson={cityJsonModel} />
          <Annotator3DSaveImage />
        </Canvas>
      )}
      {isLoading && (
        <BPLoader
          message='Génération de la version 3D de la maison. Cela peut prendre quelques instants, merci de patienter.'
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      {isError && error && <Annotator3DErrorUI error={error} />}
    </div>
  );
};
