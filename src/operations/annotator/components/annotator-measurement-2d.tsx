import { PALETTE_COLORS } from '@/bp-theme';
import { useAnnotator3DStore } from '@/common/store';
import { AnnotatorCanvas, getColorFromMain, Measurement, Point, Polygon } from '@bpartners/annotator-component';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { createBlankImage, getCenter, getDistance } from '../utils';
import faitage from '/faitage.png';

const scalePolygonAndCenter = (points: Point[]) => {
  const xCoordinates = points.map(p => p.x);
  const yCoordinates = points.map(p => p.y);
  const xMax = Math.max(...xCoordinates);
  const yMax = Math.max(...yCoordinates);
  const xMin = Math.min(...xCoordinates);
  const yMin = Math.min(...yCoordinates);

  const dx = xMax - xMin;
  const dy = yMax - yMin;

  const base = Math.max(dx, dy);

  const scale = 500 / base;

  // const dcx = (500 - dx * scale) / 2;
  // const dcy = (500 - dy * scale) / 2;

  return points.map(p => ({
    x: p.x * scale - (xMax * scale - 500) + 10,
    y: p.y * scale - (yMax * scale - 500) + 10,
  }));
};

interface MeasurementIn2DProps {
  isWall: boolean;
  maxH: number;
  minH: number;
}

export const MeasurementIn2D: FC<MeasurementIn2DProps> = ({ isWall, maxH, minH }) => {
  const { selectedObject, selectedObjectInfo } = useAnnotator3DStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [accordionWidth, setAccordionWidth] = useState(0);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [showMeasurements, setShowMeasurements] = useState(true);
  useEffect(() => {
    const accordion = accordionRef.current;
    if (!accordion) return () => {};
    setAccordionWidth(accordion.clientWidth);
  }, [accordionRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    setImageUrl(createBlankImage(canvas));
  }, [canvasRef]);

  const boundaryIndex = selectedObjectInfo.boundaryIndex;
  const cityObject = selectedObject?.object?.citymodel?.CityObjects[selectedObjectInfo.objectId] || {};
  const verticles = selectedObject?.object?.citymodel?.vertices || [];

  const boundary = cityObject?.geometry?.[0]?.boundaries?.[boundaryIndex]?.[0];

  const points3D = boundary.map((index: number) => verticles[index]);
  points3D.push(points3D[0]);

  const points2D = points3D.map(([x, y]: number[]) => ({ x: +x, y: +y }));

  const maxX = Math.max(...points2D.map((p: Point) => +p.x));
  const maxY = Math.max(...points2D.map((p: Point) => +p.y));
  const max = Math.max(maxX, maxY);
  const scale = max / 500;

  const scaledPoints2D = scalePolygonAndCenter(points2D.map(({ x, y }: any) => ({ x: Math.round(x / scale), y: Math.round(y / scale) })));

  const measurements: Measurement[] = [];
  const currentPolygonId = v4();

  for (let i = 1; i < scaledPoints2D.length; i++) {
    const prevScaled = scaledPoints2D[i - 1];
    const currentScaled = scaledPoints2D[i];

    const prevNotScaled = points3D[i - 1];
    const currentNotScaled = points3D[i];

    const measurement: Measurement = {
      position: getCenter(prevScaled, currentScaled),
      unity: 'm',
      value: +(getDistance(prevNotScaled, currentNotScaled) * 0.001).toFixed(2),
      polygonId: currentPolygonId,
    };

    measurements.push(measurement);
  }

  const polygons: Polygon[] = [
    {
      ...getColorFromMain(PALETTE_COLORS.pine),
      points: scaledPoints2D,
      id: currentPolygonId,
      measurements,
      isInvisible: false,
    },
  ];

  const [polygonList, setPolygonList] = useState([]);

  useEffect(() => {
    if (JSON.stringify(scaledPoints2D) !== JSON.stringify(polygonList?.[0]?.points)) {
      setPolygonList(polygons);
    }
  }, [polygons]);

  const handleClick = () => {
    setShowMeasurements(prev => !prev);
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>Mesures</AccordionSummary>
      <AccordionDetails
        sx={{
          '& [data-cy="annotator-canvas-container"] span': {
            opacity: `${showMeasurements ? 0.5 : 0} !important`,
          },
        }}
      >
        <FormControlLabel onClick={handleClick} control={<Switch checked={showMeasurements} />} label='Afficher les mesures' />
        <Box ref={accordionRef} width='100%'></Box>
        <Box ref={canvasRef} component='canvas' display='none' width={520} height={520} />
        {imageUrl && accordionWidth > 0 && !isWall && (
          <AnnotatorCanvas
            measurementMapper={(_m, _p, i) => measurements[i]}
            height={accordionWidth}
            width={accordionWidth}
            image={imageUrl}
            polygonList={polygonList}
            setPolygons={setPolygonList}
            polygonLineSizeProps={
              {
                converterApiUrl: '',
                imageName: '',
                showLineSize: true,
                showOnly: true,
              } as any
            }
            zoom={20}
          />
        )}
        {isWall && (
          <Box width={accordionWidth} position='relative'>
            <Box position='absolute' sx={{ top: '50%', left: -2, transform: 'rotate(-90deg)' }}>
              <Typography>{minH}m</Typography>
            </Box>
            <Box position='absolute' sx={{ top: '50%', right: 2, transform: 'rotate(-90deg)' }}>
              <Typography>{maxH}m</Typography>
            </Box>
            <Box<'img'> component={'img' as const} src={faitage} sx={{ width: accordionWidth }} />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
