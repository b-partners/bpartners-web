import { printError } from '@/common/utils';
import { NOOP_FN } from '@/common/utils/noop_fn';
import { accountHolderProvider, businessActivitiesProvider } from '@/providers';
import { Save as SaveIcon } from '@mui/icons-material';
import { Autocomplete, Box, Button, CircularProgress, SxProps, TextField, Tooltip } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { ACTIVITY_TOOLTIP_TITLE, BusinessActiVitiesValues, businessActivityDefaultValues, shouldSaveButtonDisable } from './utils';

export type CustomAutocompleteProps<ResourceType extends Record<string, any>, Name extends keyof ResourceType> = {
  label: string;
  name: Name;
  resource?: ResourceType;
  options: Record<string, any>[];
  style?: SxProps;
  onChange: (name: Name, value: string) => void;
};

const CustomAutocomplete = <ResourceType extends Record<string, any>, Name extends keyof ResourceType>(props: CustomAutocompleteProps<ResourceType, Name>) => {
  const { label, onChange, name, resource = {} as ResourceType, options, style = {} } = props;
  return (
    <Tooltip title={ACTIVITY_TOOLTIP_TITLE}>
      <Autocomplete
        value={resource[name]}
        options={options || []}
        loading={options === null}
        loadingText='Chargement...'
        onInputChange={(_e, value) => onChange(name, value)}
        sx={{ width: '45%', ...style }}
        renderInput={params => <TextField data-cy={`autocomplete-${name as string}`} required {...params} label={label} />}
      />
    </Tooltip>
  );
};

export type BusinessActivitiesInputsProps = {
  containerStyle?: SxProps;
  autocompleteStyle?: SxProps;
  onSuccess?: () => void;
};

const BusinessActivitiesInputs: FC<BusinessActivitiesInputsProps> = ({ containerStyle = {}, autocompleteStyle = {}, onSuccess = NOOP_FN }) => {
  const notify = useNotify();
  const [jobList, setJobList] = useState(null);
  // tools for the preview
  const [tools, setTools] = useState({ isLoading: false, isButtonDisable: true });
  const [businessActivities, setBusinessActivities] = useState(businessActivityDefaultValues);

  const setSaveButtonDisable = (newBusinessActivities: BusinessActiVitiesValues) => {
    setTools(properties => ({ ...properties, isButtonDisable: shouldSaveButtonDisable(newBusinessActivities.current, newBusinessActivities.new) }));
  };

  const handleChange = (name: string, value: string) => {
    setBusinessActivities(properties => {
      const newBusinessActivities = { ...properties, new: { ...properties.new, [name]: value } };
      setSaveButtonDisable(newBusinessActivities);
      return newBusinessActivities;
    });
  };

  const setLoading = (state: any) => {
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
      .then(() => onSuccess())
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ padding: 2, width: '100%', position: 'relative', ...containerStyle }}>
      <Box>
        <CustomAutocomplete
          style={{ marginRight: '1rem', ...autocompleteStyle }}
          options={jobList}
          resource={businessActivities.new}
          label='Activité principale'
          name='primary'
          onChange={handleChange}
        />
        <CustomAutocomplete
          options={jobList}
          resource={businessActivities.new}
          label='Activité secondaire'
          name='secondary'
          onChange={handleChange}
          style={autocompleteStyle}
        />
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
