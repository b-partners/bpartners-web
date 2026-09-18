import { authProvider } from '@/providers';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import { Box, Link, Typography } from '@mui/material';
import { Redirect } from '../utils';
import { BPButton } from './BPButton';
import { SubscriptionUnpaidModalStyle } from './style';

const SUPPORT_EMAIL = 'contact@birdia.fr';

export const SubscriptionUnpaidModal = () => {
  const onLogout = () => authProvider.logout().then(() => Redirect.toURL(`${location.hostname}/login`));

  return (
    <Box sx={SubscriptionUnpaidModalStyle}>
      <Box className='unpaid-icon'>
        <ReportGmailerrorredRoundedIcon />
      </Box>
      <Typography className='unpaid-title'>Paiement en échec</Typography>
      <Typography className='unpaid-text'>
        Un paiement n'a pas pu être traité sur l'un de vos abonnements précédents. Pour rétablir l'accès à votre compte, contactez notre équipe à{' '}
        <Link className='unpaid-mail' href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </Link>{' '}
        pour plus d'informations.
      </Typography>
      <BPButton className='unpaid-logout' label='Se déconnecter' onClick={onLogout} />
    </Box>
  );
};
