import { AnalysisProject, AnalysisProjectPhase } from '@bpartners/typescript-client';
import { Box, Chip } from '@mui/material';
import { FC } from 'react';
import { AnalysisStatusChipsStyle } from './style';

interface AnalysisStatusChipsProps {
  project?: AnalysisProject;
  className?: string;
}

const PHASE_LABELS: Record<AnalysisProjectPhase, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
};

export const AnalysisStatusChips: FC<AnalysisStatusChipsProps> = ({ project, ...rest }) => {
  if (!project) return null;

  return (
    <Box sx={AnalysisStatusChipsStyle} {...rest}>
      {project.status && <Chip size='small' label={PHASE_LABELS[project.status]} data-cy='project-status' />}
      <Chip
        size='small'
        className={project.analysis2dDone ? 'chip-done' : undefined}
        color={project.analysis2dDone ? 'success' : 'default'}
        variant={project.analysis2dDone ? 'filled' : 'outlined'}
        label='2D'
        data-cy='project-2d'
      />
      <Chip
        size='small'
        className={project.model3dDone ? 'chip-done' : undefined}
        color={project.model3dDone ? 'success' : 'default'}
        variant={project.model3dDone ? 'filled' : 'outlined'}
        label='3D'
        data-cy='project-3d'
      />
    </Box>
  );
};
