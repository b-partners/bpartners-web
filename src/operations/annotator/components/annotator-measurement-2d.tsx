import { useAnnotator3DStore } from '@/common/store';
import { AnnotatorCanvas, getColorFromMain, Measurement, Point, Polygon } from '@bpartners/annotator-component';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { createBlankImage, getCenter, getDistance } from '../utils';

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

  const scaled = points.map(p => ({
    x: p.x * scale + 10,
    y: p.y * scale + 10,
  }));

  const xCoordinatesScaled = points.map(p => p.x);
  const yCoordinatesScaled = points.map(p => p.y);
  const xMaxScaled = Math.max(...xCoordinatesScaled);
  const yMaxScaled = Math.max(...yCoordinatesScaled);
  const xMinScaled = Math.min(...xCoordinatesScaled);
  const yMinScaled = Math.min(...yCoordinatesScaled);

  const dxScaled = xMaxScaled - xMinScaled;
  const dyScaled = yMaxScaled - yMinScaled;
  const dcxScaled = (500 - dxScaled) / 2;
  const dcyScaled = (500 - dyScaled) / 2;

  return scaled.map(p => ({
    x: p.x + (dcxScaled < xMin ? -dcxScaled : +dcxScaled),
    y: p.y + (dcyScaled < yMin ? -dcyScaled : +dcyScaled),
  }));
};

export const MeasurementIn2D = () => {
  const { selectedObject, selectedObjectInfo } = useAnnotator3DStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [accordionWidth, setAccordionWidth] = useState(0);
  const accordionRef = useRef<HTMLDivElement>(null);

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
      value: +getDistance(prevNotScaled, currentNotScaled).toFixed(2),
      polygonId: currentPolygonId,
    };

    measurements.push(measurement);
  }

  const polygons: Polygon[] = [
    {
      ...getColorFromMain('#00ff00'),
      points: scaledPoints2D,
      id: currentPolygonId,
      measurements,
      isInvisible: false,
    },
  ];

  console.log(polygons);

  const [polygonList, setPolygonList] = useState([]);

  useEffect(() => {
    if (JSON.stringify(scaledPoints2D) !== JSON.stringify(polygonList?.[0]?.points)) {
      setPolygonList(polygons);
    }
  }, [polygons]);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>Mesures</AccordionSummary>
      <AccordionDetails>
        <Box ref={accordionRef} width='100%'></Box>
        <Box<'canvas'> ref={canvasRef} component='canvas' display='none' width={520} height={520} />
        {imageUrl && accordionWidth > 0 && (
          <AnnotatorCanvas
            measurementMapper={(_m, _p, i) => measurements[i]}
            height={accordionWidth}
            width={accordionWidth}
            image={imageUrl}
            polygonList={polygonList}
            setPolygons={setPolygonList}
            polygonLineSizeProps={{
              converterApiUrl: '',
              imageName: '',
              showLineSize: true,
              showOnly: true,
            }}
            zoom={20}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};
