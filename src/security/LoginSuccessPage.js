import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import authProvider from '../providers/auth-provider';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../common/utils/redirect';
import { getUrlParams } from '../common/utils/get-params';

import { FLEX_CENTER } from './style.js';
import BpBackgroundImage from '../assets/bp-bg-image.png';

const LoginSuccessPage = () => {
  useEffect(() => {
    async function login() {
      const code = getUrlParams(window.location.search, 'code');
      await authProvider.login({ username: null, password: code, clientMetadata: { redirectionStatusUrls: loginRedirectionUrls } });
      redirect(window.location.origin);
    }
    login();
  }, []);

  return (
    <Box
      width={{ md: '100%', sm: '0%', xs: '0%' }}
      sx={{
        ...FLEX_CENTER,
        height: '100vh',
        backgroundImage: `url(${BpBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }}
    >
      <Typography
        sx={{
          color: '#F5F5F5',
          position: 'absolute',
          bottom: '6.5rem',
        }}
      >
        Vous êtes authentifié ! Vous allez être redirigé vers votre espace professionel...
      </Typography>
    </Box>
  );
};

export default LoginSuccessPage;