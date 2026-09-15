import { useDialog } from '@/common/store/dialog';
import { useGetDetectionTracking } from '@/operations/account/queries';
import { DetectionTracking } from '@bpartners/typescript-client';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { formatDate } from './utils';

const RECENT_DETECTIONS_COUNT = 3;

const PROJECTS_ROUTE = '/projects';

const getDetectionLabel = ({ zone, address }: DetectionTracking) => zone || address || 'Analyse de toiture';

const byMostRecent = (a: DetectionTracking, b: DetectionTracking) => new Date(b.creationDatetime ?? 0).getTime() - new Date(a.creationDatetime ?? 0).getTime();

export const DetectionTrackingHistory: FC = () => {
  const navigate = useNavigate();
  const { close } = useDialog();
  const { detections, isDetectionsLoading, isDetectionsError } = useGetDetectionTracking(RECENT_DETECTIONS_COUNT);

  const visibleDetections = [...detections].sort(byMostRecent);
  const hasMore = visibleDetections.length >= RECENT_DETECTIONS_COUNT;

  const goToProjects = () => {
    close();
    navigate(PROJECTS_ROUTE);
  };

  if (isDetectionsLoading) {
    return (
      <Box className='billing-detections'>
        <Box className='billing-state'>
          <CircularProgress size={18} />
          Chargement des analyses récentes …
        </Box>
      </Box>
    );
  }

  if (isDetectionsError || visibleDetections.length === 0) return null;

  return (
    <Box className='billing-detections'>
      <Box className='billing-row-main'>
        <Typography className='billing-value'>Dernières analyses</Typography>
        <Typography className='billing-hint'>Les adresses des analyses effectuées récemment.</Typography>
      </Box>
      <Box className='billing-detections-list'>
        {visibleDetections.map((detection, index) => (
          <Box key={detection.id ?? index} className='billing-detection-line'>
            <Box className='billing-detection-main'>
              <Typography className='billing-detection-address'>{getDetectionLabel(detection)}</Typography>
              <Typography className='billing-detection-meta'>{formatDate(detection.creationDatetime)}</Typography>
            </Box>
            <IconButton title='Consulter le projet' className='billing-detection-view' name='view-detection-project'>
              <VisibilityRoundedIcon fontSize='small' />
            </IconButton>
          </Box>
        ))}
        {hasMore && (
          <Box className='billing-detections-more' onClick={goToProjects}>
            Voir plus
          </Box>
        )}
      </Box>
    </Box>
  );
};
