import { formatDateTimeWithoutSec, stringCutter } from '@/common/utils';
import { DraftAreaPictureAnnotation, Prospect } from '@bpartners/typescript-client';
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

  const navigateToAnnotation = () => {
    const { id: pictureId, address } = draftAnnotation.areaPicture;
    navigate(`/projects/${pictureId}?address=${encodeURIComponent(address || prospect.address || '')}&draftAnnotationId=${draftAnnotation.id}`);
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
                {stringCutter(draftAnnotation.areaPicture.address || prospect.address, 35) || 'Adresse non renseignée'}
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
