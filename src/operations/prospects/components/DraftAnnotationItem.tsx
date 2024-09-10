import { BPButton } from '@/common/components';
import { formatDateTime, getFileUrl } from '@/common/utils';
import { DraftAreaPictureAnnotation, FileType, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Comment, Home, LocalPhoneOutlined, MailOutline, Star, Update } from '@mui/icons-material';
import { Box, Paper, SxProps, Typography } from '@mui/material';
import { FC, useCallback } from 'react';
import { useGetOne } from 'react-admin';
import { useNavigate } from 'react-router';
import { parseRatingLastEvaluation, parseRatingValue } from '../utils';
import { CardViewField } from './CardViewField';

const DRAFT_ANNOTATION_ITEM_SX: SxProps = {
  width: '100%',
  maxWidth: '400px',
  p: 1,
  gap: 2,
};

export type DraftAnnotationItemProps = {
  draftAnnotation: DraftAreaPictureAnnotation;
};

export const DraftAnnotationItem: FC<DraftAnnotationItemProps> = ({ draftAnnotation }) => {
  const navigate = useNavigate();
  const { data: prospect = {} as Prospect, isLoading } = useGetOne<Required<Prospect>>('prospects', { id: draftAnnotation.areaPicture?.id });

  const navigateToAnnotation = () => {
    const { fileId, prospectId, id: pictureId } = draftAnnotation.areaPicture;
    const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
    navigate(
      `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&prospectId=${prospectId}&fileId=${fileId}`
    );
  };

  const getLoadingValue = useCallback(
    (value: string) => {
      return isLoading ? 'Chargement...' : value;
    },
    [isLoading]
  );

  const lastEvaluation =
    prospect?.rating?.lastEvaluation === null ? 'Non renseigné' : parseRatingLastEvaluation(prospect?.rating?.lastEvaluation.toISOString());

  return (
    <Paper sx={DRAFT_ANNOTATION_ITEM_SX} component='div'>
      <Typography variant='subtitle1' sx={{ textTransform: 'uppercase' }}>
        {getLoadingValue(prospect.name || 'Non renseigné')}
      </Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '14px' }}>
        {getLoadingValue(`Brouillon modifié le: ${formatDateTime(new Date(draftAnnotation.creationDatetime))}`)}
      </Typography>
      <Box sx={{ color: '#4d4d4d', mb: 1 }}>
        <CardViewField icon={<MailOutline />} value={getLoadingValue(prospect.email)} />
        <CardViewField icon={<LocalPhoneOutlined />} value={getLoadingValue(prospect.phone)} />
        <CardViewField icon={<Home />} value={getLoadingValue(prospect.address)} />
        <CardViewField icon={<Comment />} value={getLoadingValue(prospect.comment ? prospect.comment : prospect.defaultComment)} />
        <CardViewField icon={<Star />} value={getLoadingValue(parseRatingValue(prospect?.rating?.value))} />
        <CardViewField icon={<Update />} value={getLoadingValue(lastEvaluation)} />
      </Box>
      <BPButton label='resources.draftsAnnotations.finish' onClick={navigateToAnnotation} />
    </Paper>
  );
};
