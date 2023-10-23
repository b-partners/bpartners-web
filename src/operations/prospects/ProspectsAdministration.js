import ImportProspects from './components/ImportProspects';
import EvaluateProspects from './components/EvaluateProspects';
import { useEffect, useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import { sheetProvider } from 'src/providers/sheet-provider';
import { redirect } from 'src/common/utils';
import { useNotify } from 'react-admin';

const ProspectsAdministration = () => {
  const [tokenValid, setTokenValid] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    setTokenValid(isExhalationPassed());
  }, []);
  const isExhalationPassed = () => {
    const expirationTime = localStorage.getItem('expiredAt_validationToken_googleSheet');
    const currentTime = new Date();
    const expirationDate = new Date(expirationTime);
    return currentTime < expirationDate;
  };

  const handleClickAutorization = async () => {
    try {
      const response = await sheetProvider.oauth2Init();
      if (response) {
        redirect(response.redirectionUrl);
      }
    } catch (error) {
      notify('Une erreur est survenue au moment de la redirection.', { type: 'warning' });
    }
  };

  return (
    <>
      {tokenValid ? (
        <>
          <ImportProspects />
          <EvaluateProspects />
        </>
      ) : (
        <Box>
          <Typography variant='h6'>Vous devez vous connecter à Google sheets pour importer ou évaluer des prospects</Typography>
          <Divider sx={{ mb: 2 }} />
          <Button onClick={handleClickAutorization} data-cy='evaluate-prospect'>
            Se connecter à Google Sheets
          </Button>
        </Box>
      )}
    </>
  );
};

export default ProspectsAdministration;
