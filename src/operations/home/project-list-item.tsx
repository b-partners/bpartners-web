import { formatDateTimeWithoutSec, stringCutter } from '@/common/utils';
import { AnalysisProject, Prospect } from '@bpartners/typescript-client';
import { Public } from '@mui/icons-material';
import { Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Skeleton, Typography } from '@mui/material';
import { FC } from 'react';
import { useGetOne } from 'react-admin';
import { useNavigate } from 'react-router';
import { AnalysisStatusChips } from '../analysis-projects';

interface ProjectListItemProps {
  project: AnalysisProject;
}

export const ProjectListItem: FC<ProjectListItemProps> = ({ project }) => {
  const prospectId = project.prospectId;
  const { data: prospect = {} as Prospect, isLoading } = useGetOne<Required<Prospect>>('prospects', { id: prospectId }, { enabled: !!prospectId });
  const navigate = useNavigate();

  const navigateToAnnotation = () => navigate(`/projects/${project.areaPictureId}`);

  return (
    <ListItem disablePadding>
      <ListItemButton disabled={!project.areaPictureId} onClick={navigateToAnnotation}>
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
              stringCutter(prospect.name, 35) || stringCutter(project.address, 35) || 'Nom non défini'
            )
          }
          secondary={
            <>
              <Typography component='span' variant='body2' sx={{ color: 'text.primary', display: 'inline' }}>
                {stringCutter(project.address || prospect.address, 35) || 'Adresse non renseignée'}
              </Typography>
              <br />
              {project.creationDatetime && formatDateTimeWithoutSec(project.creationDatetime as any)}
              {!project.areaPictureId && (
                <>
                  <br />
                  Aucune visite associée à ce projet
                </>
              )}
              <AnalysisStatusChips project={project} />
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
