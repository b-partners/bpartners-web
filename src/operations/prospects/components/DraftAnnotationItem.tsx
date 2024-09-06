import { BPButton } from '@/common/components';
import { formatDateTime, getFileUrl } from '@/common/utils';
import { DraftAreaPictureAnnotation, FileType, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Comment, Home, LocalPhoneOutlined, MailOutline, Star, Update } from '@mui/icons-material';
import { Box, Paper, SxProps, Typography } from '@mui/material';
import { FC } from 'react';
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
  mappedAnnotation?: {
    draftAnnotation: DraftAreaPictureAnnotation;
    prospect?: Prospect;
  };
};

export const DraftAnnotationItem: FC<DraftAnnotationItemProps> = ({ mappedAnnotation }) => {
  const { draftAnnotation, prospect } = mappedAnnotation;
  const navigate = useNavigate();

  if (!prospect) {
    return null;
  }

  const navigateToAnnotation = () => {
    const { fileId, prospectId, id: pictureId } = draftAnnotation.areaPicture;
    const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
    navigate(
      `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&prospectId=${prospectId}&fileId=${fileId}`
    );
  };

  return (
    <Paper sx={DRAFT_ANNOTATION_ITEM_SX} component='div'>
      <Typography variant='subtitle1' sx={{ textTransform: 'uppercase' }}>
        {prospect.name || 'Non renseigné'}
      </Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '14px' }}>
        Brouillon modifié le: {formatDateTime(new Date(draftAnnotation.creationDatetime))}
      </Typography>
      <Box sx={{ color: '#4d4d4d', mb: 1 }}>
        <CardViewField icon={<MailOutline />} value={prospect.email} />
        <CardViewField icon={<LocalPhoneOutlined />} value={prospect.phone} />
        <CardViewField icon={<Home />} value={prospect.address} />
        <CardViewField icon={<Comment />} value={prospect.comment ? prospect.comment : prospect.defaultComment} />
        <CardViewField icon={<Star />} value={parseRatingValue(prospect?.rating?.value)} />
        <CardViewField
          icon={<Update />}
          value={prospect?.rating?.lastEvaluation === null ? 'Non renseigné' : parseRatingLastEvaluation(prospect?.rating?.lastEvaluation.toISOString())}
        />
      </Box>
      <BPButton label='resources.draftsAnnotations.finish' onClick={navigateToAnnotation} />
    </Paper>
  );
};
