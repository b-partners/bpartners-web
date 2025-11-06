import { FlexBox } from '@/common/components';
import { Polygon } from '@bpartners/annotator-component';
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { TextInput } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { AnnotatorFormState } from '../utils';
import { AnnotationItemLabelTypeSelect } from './annotation-item-label-type-select';
import AnnotatorForm from './AnnotatorForm';

interface Props {
  annotationInfo: AnnotationInfo;
  index: number;
  polygon: Polygon;
}

export const AnnotatorFormItem: FC<Props> = React.memo(({ annotationInfo, index, polygon: currentPolygon }) => {
  const annotatorFormState = useFormContext<AnnotatorFormState>();
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const handleClickAccordion = () => setIsExpanded(!isExpanded);

  const togglePolygonVisibility = (polygonId: string) => {
    const prev = annotatorFormState.getValues('polygons');
    const result = prev.map(polygon => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon));
    annotatorFormState.setValue('polygons', result, { shouldDirty: true });
  };

  const removeAnnotationByPolygonId = (polygonId: string) => {
    const prevPolygons = annotatorFormState.getValues('polygons');
    const prevAnnotationInfo = annotatorFormState.getValues('annotationInfos');

    const newPolygons = prevPolygons.filter(polygon => polygon.id !== polygonId);
    const newAnnotationInfo = prevAnnotationInfo.filter(annotationInfo => annotationInfo.polygonId !== polygonId);

    annotatorFormState.setValue('annotationInfos', newAnnotationInfo, { shouldDirty: true });
    annotatorFormState.setValue('polygons', newPolygons, { shouldDirty: true });
  };

  if (!currentPolygon) {
    return null;
  }
  return (
    <Box data-cy='annotation-info-item'>
      <FlexBox sx={{ alignItems: 'start', width: '100%', mt: '15px' }}>
        <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
          <IconButton edge='end' aria-label='toggle polygon visibility' style={{ marginRight: '0' }} onClick={() => togglePolygonVisibility(currentPolygon.id)}>
            {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
        <AnnotationItemLabelTypeSelect index={index} />
        <Tooltip title='supprimer le polygone'>
          <IconButton aria-label='delete polygon' edge='end' onClick={() => removeAnnotationByPolygonId(currentPolygon.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </FlexBox>
      {annotationInfo.area && index !== 0 && (
        <Typography>
          Surface: <strong>{annotationInfo.area}m²</strong>
        </Typography>
      )}
      <Accordion style={{ marginTop: '-15px', marginBottom: '50px' }} expanded={isExpanded} onChange={handleClickAccordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <TextInput
            name={`annotationInfos.${index}.labelName`}
            source={`annotationInfos.${index}.labelName`}
            inputProps={{ 'data-cy': 'label-name-input' }}
            onClick={e => e.stopPropagation()}
            label='Nom du label'
            helperText={false}
          />
        </AccordionSummary>
        <AccordionDetails>
          <AnnotatorForm index={index} surface={currentPolygon.surface} />
        </AccordionDetails>
      </Accordion>
      <Divider />
    </Box>
  );
});
