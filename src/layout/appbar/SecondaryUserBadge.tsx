import { useIsSecondaryUser } from '@/common/hooks';
import { Box, Tooltip, Typography } from '@mui/material';
import { SecondaryUserBadgeStyle } from './style';

export const SecondaryUserBadge = () => {
  const isSecondaryUser = useIsSecondaryUser();

  if (!isSecondaryUser) return null;

  return (
    <Tooltip title="Vous utilisez l'abonnement et les crédits de votre compte principal">
      <Box sx={SecondaryUserBadgeStyle} data-cy='secondary-user-badge'>
        <Typography className='secondary-user-badge-label'>Compte secondaire</Typography>
      </Box>
    </Tooltip>
  );
};
