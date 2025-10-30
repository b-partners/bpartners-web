import { usePolygonAreaQuery } from '@/common/fetcher';
import { detectionResultColors } from '@/operations/prospects/constants';
import { Polygon } from '@bpartners/annotator-component';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { AnnotatorFormState } from '../utils';
import { annotatorFormResultItemStyle as style } from './style';

interface Props {
  annotationInfo: AnnotationInfo;
  areaPictureDetails: AreaPictureDetails;
  polygon: Polygon;
  index: number;
}

export const AnnotatorFormResultItem: FC<Props> = React.memo(({ annotationInfo, areaPictureDetails, index, polygon: currentPolygon }) => {
  const annotatorFormState = useFormContext<AnnotatorFormState>();

  const { setValue } = useFormContext();
  const { isLoading, data: area } = usePolygonAreaQuery({
    areaPictureDetails,
    polygon: currentPolygon,
    onSuccess: area => {
      setValue(`annotationInfos.${index}.area`, area);
    },
  });

  const togglePolygonVisibility = (polygonId: string) => {
    const prev = annotatorFormState.getValues('polygons');
    const result = prev.map(polygon => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon));
    annotatorFormState.setValue('polygons', result, { shouldDirty: true });
  };

  const removeAnnotationByPolygonId = (polygonId: string) => {
    const prev = annotatorFormState.getValues('polygons');
    const result = prev.filter(polygon => polygon.id !== polygonId);
    annotatorFormState.setValue('polygons', result, { shouldDirty: true });
  };

  if (!currentPolygon) {
    return null;
  }

  const background = detectionResultColors[annotationInfo.polygonId.split('___')[1] as keyof typeof detectionResultColors];

  return (
    <Box sx={style}>
      <Stack direction='row' px={2} gap={1} alignItems='center'>
        <Box sx={{ background }} className='color-box-ref' />
        <Stack flexGrow={1}>
          <Typography>{annotationInfo.labelName}</Typography>
          {area && <Typography>{area}m²</Typography>}
          {(isLoading || !area) && <Typography>Chargement de la surface ...</Typography>}
        </Stack>
        <Stack direction='row'>
          <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
            <IconButton
              edge='end'
              aria-label='toggle polygon visibility'
              style={{ marginRight: '0' }}
              onClick={() => togglePolygonVisibility(currentPolygon.id)}
            >
              {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title='supprimer le polygone'>
            <IconButton aria-label='delete polygon' edge='end' onClick={() => removeAnnotationByPolygonId(currentPolygon.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
    </Box>
  );
});
