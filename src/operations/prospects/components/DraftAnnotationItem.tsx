import { FC, useCallback } from 'react';
import { useGetOne } from 'react-admin';
import { useNavigate } from 'react-router';

import { BP_COLOR } from '@/bp-theme';
import { BPButton, FlexBox } from '@/common/components';
import { annotatorStore, useAnnotator3DStore, useAnnotatorComponentFormItemStore, useAnnotatorComponentStore, useAnnotatorScreenSwitch } from '@/common/store';
import { formatDateTime, getFileUrl } from '@/common/utils';
import { clearPolygons, clearRoofDelimiter } from '@/providers';
import { DraftAreaPictureAnnotation, FileType, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { CheckCircleOutlined, Comment, LocalPhoneOutlined, LocationOnOutlined, MailOutline, Star, Update } from '@mui/icons-material';
import { Box, Paper, SxProps, Typography } from '@mui/material';
import { parseRatingValue } from '../utils';
import { CardViewField } from './CardViewField';

const DRAFT_ANNOTATION_ITEM_SX: SxProps = {
  width: '100%',
  px: 1,
  pb: 1,
  gap: 2,
};

export type DraftAnnotationItemProps = {
  draftAnnotation: DraftAreaPictureAnnotation;
};

export const DraftAnnotationItem: FC<DraftAnnotationItemProps> = ({ draftAnnotation }) => {
  const navigate = useNavigate();
  const { data: prospect = {} as Prospect, isLoading } = useGetOne<Required<Prospect>>('prospects', { id: draftAnnotation.areaPicture?.prospectId });
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);
  const annotatorComponentStore = useAnnotatorComponentStore();
  const { setAnnotatorSidebarAccordionItem: setAnnotatorSidebarAccordionItem } = useAnnotatorComponentFormItemStore();
  const { setScreen } = useAnnotatorScreenSwitch();
  const { reset: reset3DStore } = useAnnotator3DStore();

  const navigateToAnnotation = () => {
    const { fileId, id: pictureId } = draftAnnotation.areaPicture;
    const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
    clearPolygons();
    clearRoofDelimiter();
    resetAnnotations();
    reset3DStore();
    annotatorComponentStore.reset();
    annotatorStore.useAnnotatorStore.getState().reset();
    setAnnotatorSidebarAccordionItem(0);
    setScreen('annotator');
    navigate(
      `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&address=${prospect.address}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&useDrafts=true&draftAnnotationId=${draftAnnotation.id}}`
    );
  };

  const getLoadingValue = useCallback(
    (value: string) => {
      return isLoading ? 'Chargement...' : value;
    },
    [isLoading]
  );

  const getLastEvaluationValue = () => {
    const lastEvaluation = prospect?.rating?.lastEvaluation;
    if (isLoading) {
      return 'Chargement...';
    }

    if (!lastEvaluation) {
      return 'Non renseigné';
    }
    return typeof lastEvaluation === 'string' ? new Date(lastEvaluation).toISOString() : lastEvaluation.toISOString();
  };

  return (
    <Paper data-cy='draft-item' sx={DRAFT_ANNOTATION_ITEM_SX} component='div'>
      <Box sx={{ py: 2, px: 1 }}>
        <Typography variant='subtitle1' sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
          {getLoadingValue(prospect.name || 'Non renseigné')}
        </Typography>
        <Typography variant='subtitle1' sx={{ fontSize: '14px' }}>
          {getLoadingValue(`Brouillon modifié le: ${formatDateTime(new Date(draftAnnotation.creationDatetime))}`)}
        </Typography>
        <FlexBox
          sx={{
            gap: '5px',
            color: '#4d4d4d',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'start',
          }}
        >
          <CardViewField icon={<LocationOnOutlined color='primary' />} value={getLoadingValue(prospect.address)} />
          <CardViewField icon={<MailOutline color='success' />} value={getLoadingValue(prospect.email)} />
          <CardViewField icon={<LocalPhoneOutlined color='warning' />} value={getLoadingValue(prospect.phone)} />
          <CardViewField icon={<Comment />} value={getLoadingValue(prospect.comment ? prospect.comment : prospect.defaultComment)} />
          <CardViewField icon={<Star />} value={getLoadingValue(parseRatingValue(prospect?.rating?.value))} />
          <CardViewField icon={<Update />} value={getLastEvaluationValue()} />
        </FlexBox>
      </Box>
      <BPButton
        disabled={isLoading}
        data-cy='finish-draft-btn'
        label='resources.draftsAnnotations.finish'
        onClick={navigateToAnnotation}
        icon={<CheckCircleOutlined />}
        sx={{ width: '95% !important', bgcolor: BP_COLOR['5'] }}
      />
    </Paper>
  );
};
