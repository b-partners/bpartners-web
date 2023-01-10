import { Box, Typography, Button, useMediaQuery } from '@mui/material';

import { onboardingApi, securityApi } from '../providers/api';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../common/utils/redirect';
import { v4 as uuidv4 } from 'uuid';
import { FLEX_CENTER, BP_B_LOGO, LOGIN_FORM, LOGIN_FORM_BUTTON, pinkColor } from './style.js';
import { BP_COLOR } from '../bp-theme';
import useAuthentication from 'src/common/hooks/use-authentication';
import BPLoader from 'src/common/components/BPLoader';
import authProvider from 'src/providers/auth-provider';

const BpLoginPage = () => {
  const matchMediaQuery = useMediaQuery('(max-width: 898px)');

  const { isLoading } = useAuthentication();

  const initiateAuth = async () => {
    const {
      data: { redirectionUrl },
    } = await securityApi().initiateAuth({
      state: uuidv4(),
      // as we don'h handle phone prefixes (eg MG and FR), Swan will re-ask us phone anyway ==> use dummy
      phone: 'numéro renseigné',
      redirectionStatusUrls: loginRedirectionUrls,
    });
    redirect(redirectionUrl);
  };
  const onLogin = () => {
    initiateAuth();
  };

  const onRegistration = () => {
    const initiateOnboarding = async () => {
      const {
        data: { redirectionUrl },
      } = await onboardingApi().initiateOnboarding({ redirectionStatusUrls: loginRedirectionUrls });
      redirect(redirectionUrl);
    };
    initiateOnboarding();
  };

  return isLoading && authProvider.getCachedWhoami() ? (
    <BPLoader />
  ) : (
    <Box sx={FLEX_CENTER}>
      {matchMediaQuery && <img src='./logo3292.png' style={BP_B_LOGO} alt='Bienvenue sur BPartners !' />}
      <Box sx={{ ...FLEX_CENTER, flexShrink: 0, flexGrow: 1 }}>
        <Box sx={LOGIN_FORM}>
          <img src='./laborer.png' width={50} height={50} alt='Bienvenue sur BPartners !' />
          <Typography variant='h5' gutterBottom mt={1}>
            Bienvenue !
          </Typography>
          <Button id='login' onClick={onLogin} sx={LOGIN_FORM_BUTTON}>
            Se connecter
          </Button>
          <Button
            id='register'
            sx={{
              backgroundColor: 'transparent',
              color: '#000',
              textDecoration: 'underline',
              textTransform: 'none',
              textAlign: 'left',
              mt: 2,
              p: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: BP_COLOR[20],
              },
            }}
            onClick={onRegistration}
          >
            Pas de compte ? C'est par ici
          </Button>
        </Box>
      </Box>
      <Box width={{ md: '60%', sm: '0%', xs: '0%' }} sx={{ ...FLEX_CENTER, bgcolor: pinkColor }}>
        <img src='./bp-logo-full.png' width={600} alt='Bienvenue sur BPartners !' />
      </Box>
    </Box>
  );
};

export default BpLoginPage;
