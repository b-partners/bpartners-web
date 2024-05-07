import { Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpNumberField } from 'src/common/components';
import { generalInfoResolver } from 'src/common/resolvers';
import { handleSubmit, printError, toMajors, toMinors } from 'src/common/utils';
import { updateGlobalInformation } from 'src/providers/account-holder-Provider';
import { generalInfoDiff } from './utils';

const GeneralInfoForm = () => {
  const { record } = useShowContext();
  const form = useForm({ mode: 'all', resolver: generalInfoResolver });
  const notify = useNotify();
  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });

  const setLoading = newState => {
    setTools(properties => ({ ...properties, isLoading: newState }));
  };

  useEffect(() => {
    if (record) {
      const { name, siren, officialActivityName, initialCashflow, contactAddress } = record;
      const { address, city, country, postalCode } = contactAddress || {};
      const currentAccountHolder = {
        name: name,
        siren: siren,
        officialActivityName: officialActivityName,
        initialCashflow: toMajors(initialCashflow),
        address: address,
        city: city,
        country: country,
        postalCode: postalCode,
      };
      Object.keys(currentAccountHolder).forEach(key => form.setValue(key, currentAccountHolder[key]));

      setTools(properties => ({ ...properties, buttonDisable: generalInfoDiff(record, form.watch()) }));

      form.watch(data => {
        const isDifferent = generalInfoDiff(record, data);
        setTools(properties => ({ ...properties, buttonDisable: isDifferent }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateGlobalInformationSubmit = form.handleSubmit(data => {
    const fetch = async () => {
      const { name, siren, officialActivityName, initialCashflow, address, city, country, postalCode } = data;
      const { id, contactAddress } = record;
      const { prospectingPerimeter } = contactAddress || {};
      const newGlobalInfo = {
        id,
        name,
        siren,
        officialActivityName,
        initialCashFlow: toMinors(initialCashflow),
        contactAddress: { address, city, country, postalCode: +postalCode, prospectingPerimeter },
      };
      await updateGlobalInformation(newGlobalInfo);
      setTools(properties => ({ ...properties, buttonDisable: true }));
      notify('messages.global.changesSaved', { type: 'success' });
    };

    setLoading(true);
    fetch()
      .catch(printError)
      .finally(() => setLoading(false));
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(updateGlobalInformationSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <BpFormField style={{ width: '45%' }} name='name' type='text' label='Raison Sociale' />
        <BpNumberField style={{ width: '45%' }} name='siren' label='Siren' />
        <BpFormField style={{ width: '45%' }} name='officialActivityName' type='text' label='Activité Officielle' />
        <BpNumberField style={{ width: '45%' }} name='initialCashflow' label='Trésorerie initial' />
        <BpFormField style={{ width: '45%' }} name='address' type='text' label='Adresse' />
        <BpFormField style={{ width: '45%' }} name='city' type='text' label='Ville' />
        <BpFormField style={{ width: '45%' }} name='country' type='text' label='Pays' />
        <BpNumberField style={{ width: '45%' }} name='postalCode' label='Code postal' />
        <Button
          variant='contained'
          size='small'
          startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
          disabled={tools.isLoading || tools.buttonDisable}
          type='submit'
          name='submitGeneralInfo'
          sx={{ width: 'min-content', mt: 1 }}
        >
          Enregistrer
        </Button>
      </form>
    </FormProvider>
  );
};

export default GeneralInfoForm;
