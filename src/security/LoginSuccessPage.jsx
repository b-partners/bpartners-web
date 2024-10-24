import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { getUrlParams, Redirect } from '../common/utils';
import loginRedirectionUrls from './login-redirection-urls';

import { printError } from '@/common/utils';
import { authProvider } from '@/providers';
import BpBackgroundImage from '../assets/bp-bg-image.png';
import { FLEX_CENTER, REDIRECTION_MESSAGE } from './style.js';

const LoginSuccessPage = () => {
  useEffect(() => {
    async function login() {
      const code = getUrlParams(window.location.search, 'code');
      await authProvider.login({ username: null, password: code, clientMetadata: { redirectionStatusUrls: loginRedirectionUrls } });
      let timeoutId = setTimeout(() => {
        Redirect.toURL(window.location.origin);
        clearTimeout(timeoutId);
      }, 3000);
    }
    login().catch(printError);
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
      <Typography variant='h5' sx={{ color: '#F5F5F5', position: 'absolute', top: '6rem', opacity: '0.5' }} marginX={3}>
        Vous êtes authentifiés !
      </Typography>
      <Box sx={REDIRECTION_MESSAGE}>
        <Typography variant='h6'>Redirection vers votre espace professionnel</Typography>
        <DotLoading />
      </Box>
    </Box>
  );
};

const DotLoading = () => {
  const [dot, setDot] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDot(dot => (dot !== 5 ? dot + 1 : 1));
    }, 700);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Typography
      sx={{
        color: '#F5F5F5',
        width: 0,
      }}
      variant='h6'
    >
      {'.'.repeat(dot)}
    </Typography>
  );
};

export default LoginSuccessPage;
