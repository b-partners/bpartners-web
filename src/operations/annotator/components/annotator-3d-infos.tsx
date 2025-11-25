import { useAnnotator3DStore } from '@/common/store';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { getDistance } from '../utils';
import { MeasurementIn2D } from './annotator-measurement-2d';

export const Annotator3DInfos = () => {
  const { shouldSelectSurface, setShouldSelectSurface, selectObject, selectedObject, selectedObjectInfo, setSelectedObjectInfo } = useAnnotator3DStore();

  const handleClick = () => {
    setShouldSelectSurface(!shouldSelectSurface);
    selectObject(null);
    setSelectedObjectInfo(null);
  };

  const cityObject = selectedObject && selectedObjectInfo ? selectedObject.object.citymodel.CityObjects[selectedObjectInfo.objectId] : {};

  const slope = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.slope_in_degrees;
  const area = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.area_in_square_meters;
  const type = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.type;

  const isWall = type === 'WallSurface';
  const isRoof = type === 'RoofSurface';

  const boundaryIndex = selectedObjectInfo?.boundaryIndex;
  const boundary = cityObject?.geometry?.[0]?.boundaries?.[boundaryIndex]?.[0];
  const verticles = selectedObject?.object?.citymodel?.vertices || [];
  const points3D = boundary?.map((index: number) => verticles[index]);
  points3D?.push(points3D[0]);

  const measurements = [];

  for (let i = 1; i < points3D?.length || 0; i++) {
    const prev = points3D[i - 1];
    const current = points3D[i];
    measurements.push(+(getDistance(prev, current) * 0.001).toFixed(2));
  }

  const maxWallHeight = Math.max(...measurements);
  const minWallHeight = Math.min(...measurements);

  return (
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>Options</AccordionSummary>
        <AccordionDetails sx={{ minWidth: 500 }}>
          <FormControlLabel onClick={handleClick} control={<Switch checked={shouldSelectSurface} />} label='Sélectionner les surfaces' />
        </AccordionDetails>
      </Accordion>
      {selectedObject && selectedObjectInfo && shouldSelectSurface && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>Informations</AccordionSummary>
          <AccordionDetails>
            {area && shouldSelectSurface && isRoof && (
              <Typography>
                <strong>Surface rampant : </strong>
                {area}m²
              </Typography>
            )}
            {isWall && maxWallHeight && (
              <Typography>
                <strong>Hauteur de faîtage : </strong>
                {maxWallHeight}m
              </Typography>
            )}
            {isWall && minWallHeight && (
              <Typography>
                <strong>Hauteur de gouttière : </strong>
                {minWallHeight}m
              </Typography>
            )}
            {slope && shouldSelectSurface && (
              <Typography>
                <strong>Pente : </strong>
                {slope}°
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {selectedObject && selectedObjectInfo && type === 'RoofSurface' && shouldSelectSurface && <MeasurementIn2D />}
    </Box>
  );
};
