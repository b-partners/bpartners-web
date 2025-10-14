import { useCanvasAnnotationContext } from '@/common/store';
import { detectionResultColors } from '@/operations/prospects/constants';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { FieldArrayWithId } from 'react-hook-form';
import { AnnotationInfo } from '../types';
import { annotatorFormResultItemStyle as style } from './style';

interface Props {
  annotationInfo: FieldArrayWithId<{ annotationInfos: AnnotationInfo[] }, 'annotationInfos', 'id'>;
}

export const AnnotatorFormResultItem: FC<Props> = React.memo(({ annotationInfo }) => {
  const { polygons, setPolygons } = useCanvasAnnotationContext();
  const currentPolygon = polygons.find(polygon => polygon.id === annotationInfo.polygonId);

  const togglePolygonVisibility = (polygonId: string) => {
    setPolygons(prev => prev.map(polygon => (polygon.id === polygonId ? { ...polygon, isInvisible: !polygon.isInvisible } : polygon)));
  };

  const removeAnnotationByPolygonId = (polygonId: string) => {
    setPolygons(prev => prev.filter(polygon => polygon.id !== polygonId));
  };

  if (!currentPolygon) {
    return null;
  }

  const background = detectionResultColors[annotationInfo.polygonId.split('___')[1] as keyof typeof detectionResultColors];

  return (
    <Box sx={style} key={annotationInfo.id}>
      <Stack direction='row' px={2} gap={1} alignItems='center'>
        <Box sx={{ background }} className='color-box-ref' />
        <Stack flexGrow={1}>
          <Typography>{annotationInfo.labelName}</Typography>
          {annotationInfo.area && <Typography>{annotationInfo.area}m²</Typography>}
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
