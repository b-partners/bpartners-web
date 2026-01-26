import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { copyObject, stringCutter } from '@/common/utils';
import { ANNOTATION_LABELS_CHOICES } from '@/constants';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import React, { ChangeEvent, FC, FormEvent, useState } from 'react';
import AnnotatorForm from './AnnotatorForm';
import { annotatorFormItem } from './style';

interface Props {
  polygonId: string;
}

export const AnnotatorFormItem: FC<Props> = React.memo(({ polygonId }) => {
  const {
    polygon: currentPolygon,
    annotationInfos,
    removeAnnotationInfo,
    updatePolygon,
    updateAnnotationInfo,
    isFirst,
  } = annotatorStore.useOneAnnotationStore(polygonId);
  const [isExpanded, setIsExpanded] = useState(isFirst);
  const { slopeAndHeightState, isSlopeAndHeightPending, roofAnalyseProperties } = useAnnotatorComponentStore();

  const handleChangeLabelType = (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const tempAnnotationInfos = copyObject(annotationInfos);
    tempAnnotationInfos.labelType = id as typeof tempAnnotationInfos.labelType;
    updateAnnotationInfo(tempAnnotationInfos);
  };

  const handleClickAccordion = () => setIsExpanded(!isExpanded);

  const togglePolygonVisibility = (event: FormEvent) => {
    event.stopPropagation();
    updatePolygon({ ...currentPolygon, isInvisible: !currentPolygon.isInvisible });
  };

  if (!currentPolygon) return null;

  const surface = annotationInfos?.area || currentPolygon.surface;
  const height = annotationInfos.height;

  const isRoofPolygon = annotationInfos.polygonId.includes(roofGlobalIdRef);

  return (
    <Stack sx={annotatorFormItem} data-cy='annotation-info-item'>
      <Accordion expanded={isExpanded} onChange={handleClickAccordion}>
        <AccordionSummary>
          <Box width='100%'>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Stack direction='row'>
                <Box className='polygon-color-line' bgcolor={currentPolygon.strokeColor} />
                <Typography>{stringCutter(annotationInfos.labelName, 25)}</Typography>
              </Stack>
              <Stack direction='row'>
                <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
                  <span>
                    <IconButton size='small' onClick={togglePolygonVisibility}>
                      {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title='supprimer le polygone'>
                  <span>
                    <IconButton disabled={isRoofPolygon} size='small' onClick={removeAnnotationInfo}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title='supprimer le polygone'>
                  <span>
                    <IconButton className={`svg-expanded-${isExpanded}`} size='small'>
                      <ExpandMoreIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
            <Stack>
              {surface && (
                <Typography sx={{ fontSize: '14px' }}>
                  Surface :
                  <Typography component='span' fontWeight='bold'>
                    {surface} m²
                  </Typography>
                </Typography>
              )}
              {(slopeAndHeightState?.heightStatus === 'AVAILABLE' || height !== -1) && (
                <Typography sx={{ fontSize: '14px' }}>
                  Hauteur du bâtiment :
                  <Typography component='span' fontWeight='bold'>
                    {height} m
                  </Typography>
                </Typography>
              )}
              {isSlopeAndHeightPending && <Typography>Chargement de la hauteur du bâtiment en cours...</Typography>}
            </Stack>
            <Divider sx={{ marginY: 1 }} />
            {!isExpanded && (
              <TextField fullWidth value={annotationInfos.labelType} select size='small' label='Type du label'>
                {ANNOTATION_LABELS_CHOICES.map(({ id, name }) => (
                  <MenuItem onClick={handleChangeLabelType(id)} key={name} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <AnnotatorForm
            polygonId={polygonId}
            slopeAndHeightState={slopeAndHeightState}
            isSlopeAndHeightPending={isSlopeAndHeightPending}
            roofAnalyseProperties={roofAnalyseProperties}
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
});
