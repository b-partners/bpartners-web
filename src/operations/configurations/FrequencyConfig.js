import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Box, Button, TextField, Typography } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import relaunchProvider from 'src/providers/relaunch-provider';

const FrequencyConfig = () => {
  const [frequency, setFrequency] = useState({});
  const notify = useNotify();
  const initializeFrequency = async () => {
    const currentFrequency = await relaunchProvider.getConf();
    setFrequency(currentFrequency);
  };

  useEffect(() => initializeFrequency(), []);

  const handleChange = e => {
    const { name, value } = e.target;

    let val = value == null || value < 1 ? 1 : value;

    setFrequency({
      ...frequency,
      [name]: val,
    });
  };

  const submitChange = async e => {
    e.preventDefault();
    relaunchProvider
      .updateConf(frequency)
      .then(() => {
        notify('Changements enregistrer', { type: 'success' });
      })
      .catch(() => {
        notify("Une erreur s'est produite", { type: 'error' });
      });
  };

  return (
    <form onSubmit={submitChange}>
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
        <Button type='submit' variant='contained' color='primary' startIcon={<SaveIcon />}>
          Enregistrer
        </Button>
      </Box>
    </form>
  );
};

export default FrequencyConfig;
