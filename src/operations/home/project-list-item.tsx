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
  const prospectId = draftAnnotation.areaPicture?.prospectId;
  const { data: prospect = {} as Prospect, isLoading } = useGetOne<Required<Prospect>>('prospects', { id: prospectId }, { enabled: !!prospectId });
  const navigate = useNavigate();

  const navigateToAnnotation = () => navigate(`/projects/${draftAnnotation.areaPicture?.id}`);

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={navigateToAnnotation}>
        <ListItemAvatar>
          <Avatar>
            <Public />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            prospectId && isLoading ? (
              <Skeleton sx={{ width: '50%' }} />
            ) : (
              stringCutter(prospect.name, 35) || stringCutter(draftAnnotation.areaPicture?.address, 35) || 'Nom non défini'
            )
          }
          secondary={
            <>
              <Typography component='span' variant='body2' sx={{ color: 'text.primary', display: 'inline' }}>
                {stringCutter(draftAnnotation.areaPicture?.address || prospect.address, 35) || 'Adresse non renseignée'}
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
