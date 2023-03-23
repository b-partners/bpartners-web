import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import accountProvider, { accountHoldersGetter } from 'src/providers/account-provider';

const LocationEdition = () => {
  const notify = useNotify();
  const [companyInfo, setCompanyInfo] = useState();

  useEffect(() => {
    const getAccountHolder = async () => {
      const currentCompanyInfo = (await accountHoldersGetter())?.companyInfo;
      setCompanyInfo(currentCompanyInfo);
    };

    getAccountHolder();
  }, []);

  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });
  const [newLocation, setNewLocation] = useState(companyInfo?.location || { type: 'Point', latitude: undefined, longitude: undefined });

  const setLoading = newState => {
    setTools(properties => ({ ...properties, isLoading: newState }));
  };

  const handleChange = e => {
    const { value, name } = e.target;
    setNewLocation({ ...newLocation, [name]: value });
  };

  useEffect(() => {
    setTools(
      newLocation.latitude && newLocation.longitude && companyInfo.location !== newLocation
        ? { ...tools, buttonDisable: false }
        : { ...tools, buttonDisable: true }
    );
  }, [newLocation.longitude, newLocation.latitude]);

  const submitLocation = async () => {
    const newCompanyInfo = { ...companyInfo, location: { type: 'Point', longitude: +newLocation.longitude, latitude: +newLocation.latitude } };

    try {
      setLoading(true);
      await accountProvider.saveOrUpdate([newCompanyInfo]);
      notify('Changement enregistré', { type: 'success' });
      setTools({ ...tools, buttonDisable: true });
    } catch (error) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Stack direction='column' spacing={1}>
        <TextField variant='filled' name='latitude' label='latitude' type='number' sx={{ width: '45%' }} value={newLocation.latitude} onChange={handleChange} />
        <TextField
          variant='filled'
          name='longitude'
          label='longitude'
          type='number'
          sx={{ width: '45%' }}
          value={newLocation.longitude}
          onChange={handleChange}
        />
        <Button
          name='submitLocation'
          variant='contained'
          size='small'
          startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
          disabled={tools.isLoading || tools.buttonDisable}
          onClick={submitLocation}
          sx={{ width: 'min-content', mt: 1 }}
        >
          Enregistrer
        </Button>
      </Stack>
    </>
  );
};

export default LocationEdition;
