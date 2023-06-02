import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Box, Button, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { authProvider, relaunchProvider } from 'src/providers';
import { printError } from 'src/common/utils';

const FrequencyConfig = () => {
  const [frequency, setFrequency] = useState({});
  const userId = authProvider.getCachedWhoami()?.user?.id;
  const notify = useNotify();
  const initializeFrequency = async () => {
    const currentFrequency = await relaunchProvider.getConf();
    setFrequency(currentFrequency);
  };

  useEffect(() => {
    userId && initializeFrequency().catch(printError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;

    let val = value == null || value < 1 ? 1 : value;

    setFrequency({
      ...frequency,
      [name]: val,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const fetch = async () => {
      await relaunchProvider.updateConf(frequency);
      notify('Changements enregistrer', { type: 'success' });
    };
    fetch().catch(() => notify('messages.global.error', { type: 'error' }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box my={2}>
        <Typography variant='body1'>Devis non confirmé (en jour)</Typography>
        <TextField
          type='number'
          name='draftRelaunch'
          value={frequency.draftRelaunch}
          onChange={e => {
            handleChange(e);
          }}
          variant='filled'
        />
      </Box>
      <Box my={2}>
        <Typography variant='body1'>Facture en retard (en jour)</Typography>
        <TextField
          type='number'
          name='unpaidRelaunch'
          value={frequency.unpaidRelaunch}
          onChange={e => {
            handleChange(e);
          }}
          variant='filled'
        />
      </Box>
      <Box>
        <Button type='submit' data-testid='submit-frequency-relaunch' variant='contained' color='primary' startIcon={<SaveIcon />}>
          Enregistrer
        </Button>
      </Box>
    </form>
  );
};

export default FrequencyConfig;
