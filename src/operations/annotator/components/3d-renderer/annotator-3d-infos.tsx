import { useAnnotator3DStore } from '@/common/store';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { MeasurementIn2D } from '../annotator-measurement-2d';

export const Annotator3DInfos = () => {
  const { shouldSelectSurface, setShouldSelectSurface, selectObject, selectedObject, selectedObjectInfo, setSelectedObjectInfo } = useAnnotator3DStore();

  const handleClick = () => {
    setShouldSelectSurface(!shouldSelectSurface);
    selectObject(null);
    setSelectedObjectInfo(null);
  };

  const cityObject = selectedObject && selectedObjectInfo ? selectedObject.object.citymodel.CityObjects[selectedObjectInfo.objectId] : {};

  const slope = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.slope_in_degrees;
  const distance_2d_scale = cityObject?.geometry?.[0]?.semantics?.surfaces?.[0]?.distance_2d_scale;
  const area = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.area_in_square_meters;
  const type = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.type;

  const isWall = type === 'WallSurface';
  const isRoof = type === 'RoofSurface';

  const boundaryIndex = selectedObjectInfo?.boundaryIndex;
  const boundary = cityObject?.geometry?.[0]?.boundaries?.[boundaryIndex]?.[0];
  const verticles = selectedObject?.object?.citymodel?.vertices || [];
  const points3D = boundary?.map((index: number) => verticles[index]);

  const totalArea = cityObject?.geometry?.[0]?.semantics?.surfaces
    ?.filter((e: any) => e?.type === 'RoofSurface')
    .map((obj: any) => obj?.area_in_square_meters)
    .reduce((a: number, b: number) => (a || 0) + (b || 0), 0);

  let measurements = [0, 0];
  const pointsMinMax: Record<string, number> = {};

  if (isWall) {
    points3D.forEach(([x, y, z]: number[]) => {
      const name = `${x}-${y}`;
      if (pointsMinMax[name]) {
        pointsMinMax[name] = Math.abs(pointsMinMax[name] - z);
      } else {
        pointsMinMax[name] = z;
      }
    });

    measurements = Object.values(pointsMinMax);
  }

  const maxWallHeight = +(Math.max(...measurements) * 0.001 * distance_2d_scale).toFixed(2);
  const minWallHeight = +(Math.min(...measurements) * 0.001 * distance_2d_scale).toFixed(2);

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
            <Typography>
              <strong>Surface totale : </strong>
              {totalArea.toFixed(2)}m²
            </Typography>
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

      {selectedObject && selectedObjectInfo && shouldSelectSurface && <MeasurementIn2D isWall={isWall} maxH={maxWallHeight} minH={minWallHeight} />}
    </Box>
  );
};
