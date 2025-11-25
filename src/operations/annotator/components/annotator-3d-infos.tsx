import { useAnnotator3DStore } from '@/common/store';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, Switch, Typography } from '@mui/material';
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
  const height = cityObject?.geometry?.[0]?.semantics?.surfaces?.[selectedObjectInfo.boundaryIndex]?.height_in_meters;

  return (
    <Box>
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
            <Typography>
              <strong>Type : </strong>
              {shouldSelectSurface ? type : cityObject?.type}
            </Typography>
            {area && shouldSelectSurface && (
              <Typography>
                <strong>Surface rampant : </strong>
                {area}m²
              </Typography>
            )}
            {height && shouldSelectSurface && (
              <Typography>
                <strong>Hauteur : </strong>
                {height}m
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

      {selectedObject && selectedObjectInfo && type === 'RoofSurface' && <MeasurementIn2D />}
    </Box>
  );
};
