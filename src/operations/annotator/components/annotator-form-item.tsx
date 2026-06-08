import { usePolygonAreaQuery } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { copyObject, stringCutter } from '@/common/utils';
import { ANNOTATION_LABELS_CHOICES } from '@/constants';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Straighten,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import React, { FC, FormEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import AnnotatorForm from './AnnotatorForm';
import { FreeAutocompleteInput } from './free-autocomplete-input';
import { annotatorFormItem } from './style';

interface Props {
  polygonId: string;
  isAfterAnalyse?: boolean;
}

export const AnnotatorFormItem: FC<Props> = React.memo(({ polygonId, isAfterAnalyse }) => {
  const {
    polygon: currentPolygon,
    annotationInfos,
    removeAnnotationInfo,
    updatePolygon,
    updateAnnotationInfo,
    isFirst,
  } = annotatorStore.useOneAnnotationStore(polygonId);
  const { slopeAndHeightState, isSlopeAndHeightPending, roofAnalyseProperties, areaPictureDetails } = useAnnotatorComponentStore();
  const { screen } = useAnnotatorScreenSwitch();
  const [isExpanded, setIsExpanded] = useState(isFirst);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  const isFullForm = screen === 'roof-analyse' || screen === 'llm';

  const handleChangeLabelType = (value: string) => {
    const tempAnnotationInfos = copyObject(annotationInfos);
    tempAnnotationInfos.labelType = value as any;
    updateAnnotationInfo(tempAnnotationInfos);
  };

  const startEditName = (event: MouseEvent) => {
    event.stopPropagation();
    setDraftName(annotationInfos.labelName ?? '');
    setIsEditingName(true);
  };

  const commitEditName = () => {
    const tempAnnotationInfos = copyObject(annotationInfos);
    tempAnnotationInfos.labelName = draftName.trim();
    updateAnnotationInfo(tempAnnotationInfos);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
    if (event.key === 'Escape') setIsEditingName(false);
  };

  const handleClickAccordion = () => setIsExpanded(!isExpanded);

  const togglePolygonVisibility = (event: FormEvent) => {
    event.stopPropagation();
    updatePolygon({ ...currentPolygon, isInvisible: !currentPolygon.isInvisible });
  };

  const isMeasurementVisible = annotatorStore.useAnnotatorStore(useShallow(({ polygonToShowMeasurement }) => polygonToShowMeasurement === polygonId));

  if (!currentPolygon) return null;

  const { data, isLoading: isSurfaceLoading } = usePolygonAreaQuery({
    areaPictureDetails,
    polygon: currentPolygon,
    onSuccess: ({ area, measurements = [] }) => updatePolygon({ ...currentPolygon, surface: area, measurements }),
    isAfterAnalyse,
    annotationInfos,
  });

  const height = annotationInfos.height;

  const isRoofPolygon = annotationInfos.polygonId.includes(roofGlobalIdRef);

  const isAnalyseScreen = screen === 'roof-analyse';

  const hasDynamicSurfaceLabel = isRoofPolygon || isAnalyseScreen || isAfterAnalyse;

  const surfaceLabel = hasDynamicSurfaceLabel ? (annotationInfos.slope ? 'Surface rampante' : 'Surface au sol') : 'Surface';

  const toggleMeasurementVisibility = (event: SyntheticEvent) => {
    event?.stopPropagation();
    annotatorStore.useAnnotatorStore.getState().showMeasurement(polygonId);
  };

  const coreActions = (
    <>
      <Tooltip title={!isMeasurementVisible ? 'Afficher les mesures du polygone' : 'Cacher les mesures du polygone'}>
        <span>
          <IconButton edge='end' style={{ marginRight: '0' }} color={isMeasurementVisible ? 'primary' : 'default'} onClick={toggleMeasurementVisibility}>
            <Straighten />
          </IconButton>
        </span>
      </Tooltip>
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
    </>
  );

  const surfaceInfo = (
    <Stack>
      {data?.area && (
        <Typography sx={{ fontSize: '14px' }}>
          {surfaceLabel} :
          <Typography component='span' fontWeight='bold'>
            {data?.area} m²
          </Typography>
        </Typography>
      )}
      {isSurfaceLoading && <Typography>Chargement de la surface sélectionnée...</Typography>}
      {slopeAndHeightState?.heightStatus === 'AVAILABLE' && height && (
        <Typography sx={{ fontSize: '14px' }}>
          Hauteur du bâtiment :
          <Typography component='span' fontWeight='bold'>
            {height || 0} m
          </Typography>
        </Typography>
      )}
      {isSlopeAndHeightPending && <Typography>Chargement de la hauteur du bâtiment en cours...</Typography>}
    </Stack>
  );

  if (isFullForm) {
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
                  {coreActions}
                  <Tooltip title={isExpanded ? 'Réduire' : 'Développer'}>
                    <span>
                      <IconButton className={`svg-expanded-${isExpanded}`} size='small'>
                        <ExpandMoreIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
              {surfaceInfo}
              <Divider sx={{ marginY: 1 }} />
              {!isExpanded && (
                <FreeAutocompleteInput
                  onChange={handleChangeLabelType}
                  options={ANNOTATION_LABELS_CHOICES}
                  label='Type'
                  defaultValue={annotationInfos.labelType}
                />
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
  }

  return (
    <Stack sx={annotatorFormItem} data-cy='annotation-info-item' p={1} gap={1}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Stack direction='row' alignItems='center' flexGrow={1} minWidth={0}>
          <Box className='polygon-color-line' bgcolor={currentPolygon.strokeColor} />
          {isEditingName ? (
            <TextField
              autoFocus
              fullWidth
              size='small'
              variant='standard'
              value={draftName}
              onChange={event => setDraftName(event.target.value)}
              onBlur={commitEditName}
              onKeyDown={handleNameKeyDown}
              onClick={event => event.stopPropagation()}
            />
          ) : (
            <>
              <Typography>{stringCutter(annotationInfos.labelName, 25)}</Typography>
              <Tooltip title='Renommer le label'>
                <span>
                  <IconButton size='small' onClick={startEditName}>
                    <EditIcon fontSize='inherit' />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </Stack>
        <Stack direction='row'>{coreActions}</Stack>
      </Stack>
      {surfaceInfo}
      <Divider />
      <FreeAutocompleteInput onChange={handleChangeLabelType} options={ANNOTATION_LABELS_CHOICES} label='Type' defaultValue={annotationInfos.labelType} />
    </Stack>
  );
});
