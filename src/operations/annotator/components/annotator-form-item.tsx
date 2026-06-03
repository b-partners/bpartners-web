import { usePolygonAreaQuery } from '@/common/fetcher';
import { annotatorStore, useAnnotatorComponentStore } from '@/common/store';
import { copyObject, stringCutter } from '@/common/utils';
import { ANNOTATION_LABELS_CHOICES } from '@/constants';
import { roofGlobalIdRef } from '@/operations/prospects/constants';
import { Delete as DeleteIcon, Straighten, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import React, { ChangeEvent, FC, FocusEvent, FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { FreeAutocompleteInput } from './free-autocomplete-input';
import { annotatorFormItem } from './style';

interface Props {
  polygonId: string;
  isAfterAnalyse?: boolean;
}

export const AnnotatorFormItem: FC<Props> = React.memo(({ polygonId, isAfterAnalyse }) => {
  const { polygon: currentPolygon, annotationInfos, removeAnnotationInfo, updatePolygon, updateAnnotationInfo } = annotatorStore.useOneAnnotationStore(polygonId);
  const { slopeAndHeightState, isSlopeAndHeightPending, areaPictureDetails } = useAnnotatorComponentStore();
  const [labelName, setLabelName] = useState(annotationInfos?.labelName ?? '');

  useEffect(() => {
    setLabelName(annotationInfos?.labelName ?? '');
  }, [annotationInfos?.labelName]);

  const handleChangeLabelType = (value: string) => {
    const tempAnnotationInfos = copyObject(annotationInfos);
    tempAnnotationInfos.labelType = value as any;
    updateAnnotationInfo(tempAnnotationInfos);
  };

  const handleChangeLabelName = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const tempAnnotationInfos = copyObject(annotationInfos);
    tempAnnotationInfos.labelName = event.target.value;
    updateAnnotationInfo(tempAnnotationInfos);
  };

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

  const toggleMeasurementVisibility = (event: SyntheticEvent) => {
    event?.stopPropagation();
    annotatorStore.useAnnotatorStore.getState().showMeasurement(polygonId);
  };

  return (
    <Stack sx={annotatorFormItem} data-cy='annotation-info-item' p={1} gap={1}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Stack direction='row' alignItems='center'>
          <Box className='polygon-color-line' bgcolor={currentPolygon.strokeColor} />
          <Typography>{stringCutter(annotationInfos.labelName, 25)}</Typography>
        </Stack>
        <Stack direction='row'>
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
        </Stack>
      </Stack>
      <Stack>
        {data?.area && (
          <Typography sx={{ fontSize: '14px' }}>
            Surface :
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
      <Divider />
      <FreeAutocompleteInput onChange={handleChangeLabelType} options={ANNOTATION_LABELS_CHOICES} label='Type' defaultValue={annotationInfos.labelType} />
      <TextField
        fullWidth
        size='small'
        label='Nom du label'
        value={labelName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setLabelName(event.target.value)}
        onBlur={handleChangeLabelName}
      />
    </Stack>
  );
});
