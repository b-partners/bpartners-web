import { Add } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { FC } from 'react';
import { prospect_button } from './styles';

interface ProspectButtonProps {
  onClick: () => void;
}

export const ProspectButton: FC<ProspectButtonProps> = ({ onClick }) => {
  return (
    <Box sx={prospect_button}>
      <IconButton size='large' onClick={onClick}>
        <Add />
      </IconButton>
      <Typography>Prospects</Typography>
    </Box>
  );
};
