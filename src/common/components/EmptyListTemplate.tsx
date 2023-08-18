import { Inbox as InboxIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

type EmptyListTemplateProps = {
  label: ReactNode;
  actions?: ReactNode;
};

const EMPTY_LIST_CONTAINER = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
};

const EMPTY_LIST_ICON = { fontSize: '13rem', color: 'rgba(0,0,0,0.4)' };

export const EmptyListTemplate: FC<EmptyListTemplateProps> = ({ actions, label }) => {
  return (
    <Box sx={EMPTY_LIST_CONTAINER}>
      <InboxIcon sx={EMPTY_LIST_ICON} />
      <Typography variant='h6' sx={{ color: 'rgba(0,0,0,0.4)' }}>
        {label}
      </Typography>
      <Box>{actions}</Box>
    </Box>
  );
};
