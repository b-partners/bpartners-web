import { Save as SaveIcon } from '@mui/icons-material';
import { Autocomplete, Box, Button, CircularProgress, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { printError } from '@/common/utils';
import { accountHolderProvider, businessActivitiesProvider } from '@/providers';
import { ACTIVITY_TOOLTIP_TITLE, businessActivityDefaultValues, shouldSaveButtonDisable } from './utils';

const CustomAutocomplete = props => {
  const { label, onChange, name, resource = {}, options, style } = props;
  return (
    <Tooltip title={ACTIVITY_TOOLTIP_TITLE}>
      <Autocomplete
        value={resource[name]}
        options={options || []}
        loading={options === null}
        loadingText='Chargement...'
        onInputChange={(_e, value) => onChange(name, value)}
        sx={{ width: '45%', ...style }}
        renderInput={params => <TextField data-cy={`autocomplete-${name}`} required {...params} label={label} />}
      />
    </Tooltip>
  );
};

const BusinessActivitiesInputs = () => {
  const notify = useNotify();
  const [jobList, setJobList] = useState(null);
  // tools for the preview
  const [tools, setTools] = useState({ isLoading: false, isButtonDisable: true });
  const [businessActivities, setBusinessActivities] = useState(businessActivityDefaultValues);

  const setSaveButtonDisable = newBusinessActivities => {
    setTools(properties => ({ ...properties, isButtonDisable: shouldSaveButtonDisable(newBusinessActivities.current, newBusinessActivities.new) }));
  };

  const handleChange = (name, value) => {
    setBusinessActivities(properties => {
      const newBusinessActivities = { ...properties, new: { ...properties.new, [name]: value } };
      setSaveButtonDisable(newBusinessActivities);
      return newBusinessActivities;
    });
  };

  const setLoading = state => {
    setTools(properties => ({ ...properties, isLoading: state }));
  };

  useEffect(() => {
    // get all job lists
    const getJobList = async () => setJobList((await businessActivitiesProvider.getJobList()).map(({ name }) => name));
    getJobList().catch(printError);
    // get the current businessActivities
    const getAccountHolder = async () => {
      const currentBusinessActivities = (await accountHolderProvider.getOne())?.businessActivities;
      setBusinessActivities({ new: currentBusinessActivities, current: currentBusinessActivities });
    };
    getAccountHolder().catch(printError);
  }, []);

  const updateBusinessActivities = () => {
    const fetch = async () => {
      await businessActivitiesProvider.update(businessActivities.new);
      notify('messages.global.changesSaved', { type: 'success' });
    };
    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ padding: 2, width: '100%', position: 'relative' }}>
      <Box>
        <CustomAutocomplete
          style={{ marginRight: '1rem' }}
          options={jobList}
          resource={businessActivities.new}
          label='Activité principale'
          name='primary'
          onChange={handleChange}
        />
        <CustomAutocomplete options={jobList} resource={businessActivities.new} label='Activité secondaire' name='secondary' onChange={handleChange} />
      </Box>
      <Button
        variant='contained'
        size='small'
        startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
        disabled={tools.isButtonDisable}
        onClick={updateBusinessActivities}
        sx={{ marginTop: 1 }}
      >
        Enregistrer
      </Button>
    </Box>
  );
};

export default BusinessActivitiesInputs;
