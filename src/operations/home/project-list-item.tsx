import {
  annotatorStore,
  roof3DStore,
  useAnnotator3DStore,
  useAnnotatorComponentFormItemStore,
  useAnnotatorComponentStore,
  useAnnotatorScreenSwitch,
} from '@/common/store';
import { formatDateTimeWithoutSec, getFileUrl, stringCutter } from '@/common/utils';
import { clearPolygons, clearRoofDelimiter } from '@/providers';
import { DraftAreaPictureAnnotation, FileType, Prospect, ZoomLevel } from '@bpartners/typescript-client';
import { Public } from '@mui/icons-material';
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Skeleton, Typography } from '@mui/material';
import { FC } from 'react';
import { useGetOne } from 'react-admin';
import { useNavigate } from 'react-router';

interface ProjectListItemProps {
  draftAnnotation: DraftAreaPictureAnnotation;
}

export const ProjectListItem: FC<ProjectListItemProps> = ({ draftAnnotation }) => {
  const { data: prospect = {} as Prospect, isLoading } = useGetOne<Required<Prospect>>('prospects', { id: draftAnnotation.areaPicture?.prospectId });
  const navigate = useNavigate();
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
    roof3DStore.useRoof3DStore.getState().reset();
    navigate(
      `/projects/${pictureId}?imgUrl=${encodeURIComponent(fileUrl)}&address=${prospect.address}&zoomLevel=${draftAnnotation.areaPicture.zoomLevel || ZoomLevel.HOUSES_0}&pictureId=${pictureId}&useDrafts=true&draftAnnotationId=${draftAnnotation.id}`
    );
  };

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={navigateToAnnotation}>
        <ListItemAvatar>
          <Avatar>
            <Public />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={isLoading ? <Skeleton sx={{ width: '50%' }} /> : stringCutter(prospect.name, 35) || 'Nom non défini'}
          secondary={
            <>
              <Typography component='span' variant='body2' sx={{ color: 'text.primary', display: 'inline' }}>
                {stringCutter(draftAnnotation.areaPicture.address, 35)}
              </Typography>
              <br />
              {draftAnnotation?.areaPicture?.createdAt && formatDateTimeWithoutSec(draftAnnotation.areaPicture.createdAt as any)}
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
