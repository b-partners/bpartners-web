import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { useForm } from 'react-hook-form';
import BPFormField from 'src/common/components/BPFormField';
import { Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { generalInfoDiff } from './utils';
import { toMajors, toMinors } from 'src/common/utils/money';
import { handleSubmit, printError } from 'src/common/utils';
import { updateGlobalInformation } from 'src/providers/account-holder-Provider';

const GeneralInfoForm = () => {
  const { record } = useShowContext();
  const form = useForm({ mode: 'all' });
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
        id: id,
        name: name,
        siren: siren,
        officialActivityName: officialActivityName,
        initialCashFlow: toMinors(initialCashflow),
        contactAddress: { address: address, city: city, country: country, postalCode: +postalCode, prospectingPerimeter: prospectingPerimeter },
      };
      await updateGlobalInformation(newGlobalInfo);
      notify('Changement enregistré', { type: 'success' });
    };

    setLoading(true);
    fetch()
      .catch(printError)
      .finally(() => setLoading(false));
  });

  return (
    <form onSubmit={handleSubmit(updateGlobalInformationSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
      <BPFormField style={{ width: '45%' }} name='name' type='text' form={form} label='Raison Sociale' />
      <BPFormField style={{ width: '45%' }} name='siren' type='number' form={form} label='Siren' />
      <BPFormField style={{ width: '45%' }} name='officialActivityName' type='text' form={form} label='Activité Officielle' />
      <BPFormField style={{ width: '45%' }} name='initialCashflow' type='number' form={form} label='Trésorerie initial' />
      <BPFormField style={{ width: '45%' }} name='address' type='text' form={form} label='Adresse' />
      <BPFormField style={{ width: '45%' }} name='city' type='text' form={form} label='Ville' />
      <BPFormField style={{ width: '45%' }} name='country' type='text' form={form} label='Pays' />
      <BPFormField style={{ width: '45%' }} name='postalCode' type='number' form={form} label='Code postal' />
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
  );
};

export default GeneralInfoForm;
