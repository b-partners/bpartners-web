import { Box, Typography, TextField, FormHelperText, Button } from '@mui/material';
import { pink, grey } from '@mui/material/colors';
import { useReducer, useState, useEffect } from 'react';

import { securityApi } from '../providers/api';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../utils/redirect';
import { v4 as uuidv4 } from 'uuid';

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

  const lightGreyColor = grey[100];
  const darkGreyColor = grey[800];
  const pinkColor = pink[50];
  const whiteColor = '#ffffff';
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', height: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: lightGreyColor, flexShrink: 0, flexGrow: 1, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: lightGreyColor, minWidth: '30vh' }}>
          <img src='./laborer.png' width={50} height={50} alt='Bienvenue sur BPartners !' />
          <Typography variant='h5' gutterBottom mt={1}>
            Bienvenue !
          </Typography>
          <PhoneTextField handleInput={handleInput} formInput={formInput} isFirstAttempt={isFirstAttempt} />
          <FormHelperText>Nous vous enverrons un lien de connexion</FormHelperText>
          <Button
            id='login'
            onClick={onLogin}
            sx={{
              textTransform: 'none',
              bgcolor: darkGreyColor,
              color: whiteColor,
              '&:hover': {
                background: darkGreyColor,
              },
            }}
          >
            Se connecter
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: pinkColor, flexShrink: 0, flexGrow: 1, alignItems: 'center' }}>
        <img src='./bp-logo-full.png' width={600} height={275} alt='Bienvenue sur BPartners !' />
      </Box>
    </Box>
  );
};

export default BpLoginPage;
