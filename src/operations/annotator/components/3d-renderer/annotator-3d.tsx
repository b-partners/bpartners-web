import { Polygon } from '@bpartners/annotator-component';
import { Canvas } from '@react-three/fiber';
import { FC, useEffect } from 'react';

import { useCitJSONProcessQuery } from '@/common/fetcher';
import { roof3DStore } from '@/common/store';
import { classifyRoofEdges } from '@/lib/roof-mapping';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { RoofScanLoader } from '../loading';
import { Annotator3DErrorUI } from './annotator-3d-error';
import { Annotator3DSaveImage } from './annotator-3d-save-image';
import { CityScene } from './city-scene';

export type ThreeDMeasureMode = 'none' | 'line' | 'polygon';
interface Annotator3DProps {
  width: number | string;
  height: number | string;
  active?: boolean;
  polygons?: Polygon[];
  areaPicture?: AreaPictureDetails;
  measureMode: ThreeDMeasureMode;
  setMeasureMode: (mode: ThreeDMeasureMode) => void;
}

export const Annotator3D: FC<Annotator3DProps> = ({ height, active = false, areaPicture, polygons, measureMode, setMeasureMode }) => {
  const { isLoading, error, isError, data: cityJson } = useCitJSONProcessQuery(polygons[0], areaPicture, active);
  const { setSelectedRoofIndex, setPanNames, setEdgeTypes } = roof3DStore.useRoof3DActions();

  useEffect(() => {
    setSelectedRoofIndex(null);
    setPanNames({});
    setEdgeTypes(cityJson ? classifyRoofEdges(cityJson).edgeTypes : {});
  }, [cityJson]);

  if (!active) {
    return null;
  }

  return (
    <div style={{ width: '100%', height, position: 'relative', marginTop: 5, paddingTop: 5 }}>
      {!isError && !error && !isLoading && (
        <Canvas
          data-testid='3d-canvas'
          camera={{ position: [0, -1, 1], up: [0, 0, 1], fov: 60, near: 0.0001, far: 4000 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
            alpha: true,
            premultipliedAlpha: false,
            logarithmicDepthBuffer: true,
          }}
        >
          <ambientLight intensity={0.7 * Math.PI} color={0x999999} position={[0, 0, 1]} />
          <directionalLight intensity={Math.PI} color={0xdddddd} position={[1, 2, 3]} />
          <directionalLight intensity={Math.PI} color={0xdddddd} position={[-1, -2, -3]} />
          <CityScene cityJson={cityJson} measureMode={measureMode} setMeasureMode={setMeasureMode} />
          <Annotator3DSaveImage />
        </Canvas>
      )}
      {isLoading && <RoofScanLoader polygons={polygons} />}
      {isError && error && <Annotator3DErrorUI error={error} />}
    </div>
  );
};
