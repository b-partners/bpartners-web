import { usePolygonAreaQuery } from '@/common/fetcher';
import { annotatorStore } from '@/common/store';
import { detectionResultColors } from '@/operations/prospects/constants';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { annotatorFormResultItemStyle as style } from './style';

interface Props {
  areaPictureDetails: AreaPictureDetails;
  polygonId: string;
}

export const AnnotatorFormResultItem: FC<Props> = React.memo(({ areaPictureDetails, polygonId }) => {
  const { polygon: currentPolygon, annotationInfos, removeAnnotationInfo, updatePolygon } = annotatorStore.useOneAnnotationStore(polygonId);

  const { isLoading, data } = usePolygonAreaQuery({
    areaPictureDetails,
    polygon: currentPolygon,
    onSuccess: ({ area, measurements }) => updatePolygon({ ...currentPolygon, surface: area, measurements }),
  });

  const togglePolygonVisibility = () => updatePolygon({ ...currentPolygon, isInvisible: !currentPolygon.isInvisible });

  if (!currentPolygon) {
    return null;
  }

  const area = data?.area;

  const background = detectionResultColors[annotationInfos.polygonId.split('___')[1] as keyof typeof detectionResultColors];

  return (
    <Paper sx={style}>
      <Stack direction='row' px={2} gap={1} alignItems='center'>
        <Box sx={{ background }} className='color-box-ref' />
        <Stack flexGrow={1}>
          <Typography>{annotationInfos.labelName}</Typography>
          {area && <Typography>{area}m²</Typography>}
          {(isLoading || !area) && <Typography>Chargement de la surface ...</Typography>}
        </Stack>
        <Stack direction='row'>
          <Tooltip title={currentPolygon.isInvisible ? 'Afficher le polygone' : 'Cacher le polygone'}>
            <IconButton edge='end' aria-label='toggle polygon visibility' style={{ marginRight: '0' }} onClick={togglePolygonVisibility}>
              {currentPolygon.isInvisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title='supprimer le polygone'>
            <IconButton aria-label='delete polygon' edge='end' onClick={removeAnnotationInfo}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
    </Paper>
  );
});
