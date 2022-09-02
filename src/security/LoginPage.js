import { Box, TextField, Button } from '@mui/material';
import { useReducer } from 'react';

import { securityApi } from '../providers/api';
import loginRedirectionUrls from './login-redirection-urls';
import { redirect } from '../utils/redirect';

const PhoneTextField = ({ formInput, handleInput }) => {
  const isValidPhone = phone => true; //TODO
  return (
    <TextField
      id='phone'
      name='phone'
      label='Téléphone'
      value={formInput.phone}
      onChange={handleInput}
      error={isValidPhone(formInput.phone) ? null : 'Votre téléphone doit être au format 0x xx xx xx xx'}
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

  const initiateAuth = async () => {
    const { data: redirectionUrl } = await securityApi().initiateAuth({ phone: formInput.phone, redirectionStatusUrl: loginRedirectionUrls });
    redirect(redirectionUrl);
  };
  return (
    <Box>
      <form>
        <PhoneTextField handleInput={handleInput} formInput={formInput} />
        <Button id='login' onClick={initiateAuth}>
          Se connecter
        </Button>
      </form>
    </Box>
  );
};

export default BpLoginPage;
