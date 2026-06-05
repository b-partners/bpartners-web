import { Polygon } from '@bpartners/annotator-component';
import { Canvas } from '@react-three/fiber';
import { CSSProperties, FC, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useCitJSONProcessQuery } from '@/common/fetcher';
import { annotatorStore, roof3DStore, useAnnotatorScreenSwitch } from '@/common/store';
import { classifyRoofEdges } from '@/lib/roof-mapping';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Straighten as StraightenIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import { Button, Divider, Stack, Tooltip } from '@mui/material';
import { RoofScanLoader } from '../loading';
import { Annotator3DErrorUI } from './annotator-3d-error';
import { Annotator3DSaveImage } from './annotator-3d-save-image';
import { CityScene } from './city-scene';
import { annotator3DFloatingActionsStyle } from './style';

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
  const { threeDMode } = useAnnotatorScreenSwitch();
  const annotations = annotatorStore.useAnnotatorStore(useShallow(({ annotations }) => annotations));
  const threeDGenerationId = annotatorStore.useAnnotatorStore(useShallow(({ threeDGenerationId }) => threeDGenerationId));
  const shouldMount = active || !!threeDGenerationId;
  const { isLoading, error, isError, data: cityJson } = useCitJSONProcessQuery(polygons[0], areaPicture, shouldMount);
  const { setSelectedRoofIndex, setPanNames, setEdgeTypes } = roof3DStore.useRoof3DActions();

  const loadingPolygons = useMemo(() => {
    const annotationValues = Object.values(annotations);
    if (threeDMode === 'roof') {
      const roofPolygon = annotationValues.find(annotation => annotation.annotationInfos.labelType === 'roof')?.polygon || polygons[0];
      return [roofPolygon].filter(Boolean);
    }
    return annotationValues.filter(annotation => annotation.annotationInfos.labelType === 'pan').map(annotation => annotation.polygon);
  }, [annotations, threeDMode, polygons]);

  useEffect(() => {
    setSelectedRoofIndex(null);
    setPanNames({});
    setEdgeTypes(cityJson ? classifyRoofEdges(cityJson).edgeTypes : {});
  }, [cityJson]);

  if (!shouldMount) {
    return null;
  }

  const containerStyle: CSSProperties = active
    ? { width: '100%', height, position: 'relative', marginTop: 5, paddingTop: 5 }
    : { position: 'absolute', inset: 0, visibility: 'hidden', pointerEvents: 'none', zIndex: -1 };

  return (
    <div style={containerStyle}>
      {!isError && !error && !isLoading && (
        <>
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
          {active && (
            <Stack sx={annotator3DFloatingActionsStyle} direction='row' gap={0.5} alignItems='center'>
              <Tooltip placement='top' title='Mesurer une ligne'>
                <Button
                  className={`measure-btn ${measureMode === 'line' ? 'measure-btn-active' : ''}`}
                  startIcon={<StraightenIcon />}
                  variant='text'
                  onClick={() => setMeasureMode(measureMode === 'line' ? 'none' : 'line')}
                >
                  Ligne
                </Button>
              </Tooltip>
              <Divider orientation='vertical' flexItem />
              <Tooltip placement='top' title='Mesurer un polygone'>
                <Button
                  className={`measure-btn ${measureMode === 'polygon' ? 'measure-btn-active' : ''}`}
                  startIcon={<TimelineIcon />}
                  variant='text'
                  onClick={() => setMeasureMode(measureMode === 'polygon' ? 'none' : 'polygon')}
                >
                  Polygone
                </Button>
              </Tooltip>
            </Stack>
          )}
        </>
      )}
      {active && isLoading && <RoofScanLoader polygons={loadingPolygons} />}
      {active && isError && error && <Annotator3DErrorUI error={error} />}
    </div>
  );
};
