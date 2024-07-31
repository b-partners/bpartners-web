import { Alert, Box } from '@mui/material';
import { BP_COLOR } from '../../bp-theme';
import { FC } from 'react';

const EMPTY_LIST_STYLE = {
  border: 'none',
  p: 4,
  bg: BP_COLOR[40],
  '& .MuiAlert-icon': {
    color: BP_COLOR[20],
  },
};

export const EmptyList: FC<{ content?: string }> = ({ content = 'Aucun enregistrement à afficher' }) => (
  <Box sx={{ p: 1 }}>
    <Alert severity='warning' sx={EMPTY_LIST_STYLE}>
      {content}
    </Alert>
  </Box>
);
