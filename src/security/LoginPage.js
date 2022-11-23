import { useReducer, useState, useEffect } from 'react';
import { Box, Typography, TextField, FormHelperText, Button, useMediaQuery } from '@mui/material';

import { onboardingApi, securityApi } from '../providers/api';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../utils/redirect';
import { v4 as uuidv4 } from 'uuid';
import { FLEX_CENTER, BP_B_LOGO, LOGIN_FORM, LOGIN_FORM_BUTTON, pinkColor } from './style.js';
import { BP_COLOR } from '../bpTheme';

const PhoneTextField = ({ formInput: { phone }, handleInput, isFirstAttempt }) => {
  const [isValidPhone, setIsValidPhone] = useState(true);
  useEffect(() => {
    const testValidPhone = phone => /\d{10}/.test(phone);
    setIsValidPhone(testValidPhone(phone));
  }, [setIsValidPhone, phone]);

  const isError = !isFirstAttempt && !isValidPhone;
  return (
    <TextField
      id='phone'
      name='phone'
      label='Téléphone'
      value={phone}
      onChange={handleInput}
      error={isError}
      helperText={isError ? 'Votre numéro doit ressembler à 0611223344' : null}
    />
  );
};

const BpLoginPage = () => {
  // Following reducer technique for update state of the form is taken from
  // https://codesandbox.io/s/react-material-ui-form-submit-v40lz?from-embed=&file=/src/components/MaterialUIFormSubmit.js
  const [formInput, setFormInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    phone: '',
  });
  const matchMediaQuery = useMediaQuery('(max-width: 898px)');
  const handleInput = ({ target: { name, value } }) => setFormInput({ [name]: value });

  const [isFirstAttempt, setFirstAttempt] = useState(true);
  const initiateAuth = async () => {
    const {
      data: { redirectionUrl },
    } = await securityApi().initiateAuth({
      state: uuidv4(),
      phone: formInput.phone,
      redirectionStatusUrls: loginRedirectionUrls,
    });
    redirect(redirectionUrl);
  };
  const onLogin = () => {
    setFirstAttempt(false);
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

  return (
    <Box sx={FLEX_CENTER}>
      {matchMediaQuery && <img src='./logo3292.png' style={BP_B_LOGO} alt='Bienvenue sur BPartners !' />}
      <Box sx={{ ...FLEX_CENTER, flexShrink: 0, flexGrow: 1 }}>
        <Box sx={LOGIN_FORM}>
          <img src='./laborer.png' width={50} height={50} alt='Bienvenue sur BPartners !' />
          <Typography variant='h5' gutterBottom mt={1}>
            Bienvenue !
          </Typography>
          <PhoneTextField handleInput={handleInput} formInput={formInput} isFirstAttempt={isFirstAttempt} />
          <FormHelperText>Nous vous enverrons un lien de connexion</FormHelperText>
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
