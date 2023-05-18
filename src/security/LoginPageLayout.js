import { Box, Typography } from '@mui/material';

import useAuthentication from 'src/common/hooks/use-authentication';
import BPLoader from 'src/common/components/BPLoader';
import authProvider from 'src/providers/auth-provider';
import { FLEX_CENTER } from './style.js';
import BpBackgroundImage from '../assets/bp-bg-image.png';

const BpLoginPageLayout = ({ children }) => {
  const { isLoading } = useAuthentication();

  return isLoading && authProvider.getCachedWhoami() ? (
    <BPLoader />
  ) : (
    <Box sx={FLEX_CENTER}>
      {<img src='./bp-logo-full.webp' style={{ position: 'absolute', top: '3%', left: '3%', width: '180px' }} alt='Bienvenue sur BPartners !' />}
      <Box sx={{ ...FLEX_CENTER, flexShrink: 0, flexGrow: 1 }}>{children}</Box>
      <Box
        width={{ md: '60%', sm: '0%', xs: '0%' }}
        sx={{
          ...FLEX_CENTER,
          height: '110vh',
          backgroundImage: `url(${BpBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      >
        <Typography
          sx={{
            color: '#F5F5F5',
            fontStyle: 'italic',
            position: 'absolute',
            bottom: '6.5rem',
          }}
        >
          L'assistant intelligent qui accélère la croissance des artisans et indépendants.
        </Typography>
      </Box>
    </Box>
  );
};

export default BpLoginPageLayout;
