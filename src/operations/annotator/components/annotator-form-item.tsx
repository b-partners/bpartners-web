import { FlexBox } from '@/common/components';
import { useCanvasAnnotationContext } from '@/common/store';
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, IconButton, Tooltip } from '@mui/material';
import { FC, useState } from 'react';
import { TextInput } from 'react-admin';
import { FieldArrayWithId, useFormContext } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { AnnotationItemLabelTypeSelect } from './annotation-item-label-type-select';
import AnnotatorForm from './AnnotatorForm';

interface Props {
  annotationInfo: FieldArrayWithId<{ annotationInfos: AnnotationInfo[] }, 'annotationInfos', 'id'>;
  index: number;
}

export const AnnotatorFormItem: FC<Props> = ({ annotationInfo, index }) => {
  const { polygons, setPolygons } = useCanvasAnnotationContext();
  const currentPolygon = polygons.find(polygon => polygon.id === annotationInfo.polygonId);
  const [isExpanded, setIsExpanded] = useState(false);
  const formState = useFormContext();

  const handleClickAccordion = () => setIsExpanded(!isExpanded);

  const togglePolygonVisibility = (polygonId: string) => {
    setPolygons(prev => prev.map(polygon => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon)));
  };

  const removeAnnotationByPolygonId = (polygonId: string) => {
    setPolygons(prev => prev.filter(polygon => polygon.id !== polygonId));
  };

  if (!currentPolygon) {
    return null;
  }
  return (
    <Box data-cy='annotation-info-item' key={annotationInfo.id}>
      <FlexBox sx={{ alignItems: 'start', width: '100%', mt: '15px' }}>
        <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
          <IconButton edge='end' aria-label='toggle polygon visibility' style={{ marginRight: '0' }} onClick={() => togglePolygonVisibility(currentPolygon.id)}>
            {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
        <AnnotationItemLabelTypeSelect index={index} formState={formState as any} />
        <Tooltip title='supprimer le polygone'>
          <IconButton aria-label='delete polygon' edge='end' onClick={() => removeAnnotationByPolygonId(currentPolygon.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </FlexBox>
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
};
