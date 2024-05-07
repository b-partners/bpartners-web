import { Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpNumberField } from 'src/common/components';
import { companyInfoResolver } from 'src/common/resolvers';
import { handleSubmit } from 'src/common/utils';
import { accountHolderProvider } from 'src/providers';
import { toMajors, toMinors } from '../../common/utils';
import { companyInfoDiff } from './utils';

const CompanyInformationForm = () => {
  const { record } = useShowContext();
  const form = useForm({ mode: 'all', defaultValues: record || {}, resolver: companyInfoResolver });
  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });
  const notify = useNotify();

  const setLoading = newState => {
    setTools(properties => ({ ...properties, isLoading: newState }));
  };

  useEffect(() => {
    // set form default value
    if (record) {
      const currentCompanyInfo = { ...record.companyInfo };
      Object.keys(currentCompanyInfo).forEach(key => form.setValue(key, currentCompanyInfo[key]));
      // format social capital to majors
      form.setValue('socialCapital', toMajors(currentCompanyInfo['socialCapital']));

      setTools(properties => ({ ...properties, buttonDisable: companyInfoDiff(record.companyInfo, form.watch()) }));

      form.watch(data => {
        const isDifferent = companyInfoDiff(record.companyInfo, data);
        setTools(properties => ({ ...properties, buttonDisable: isDifferent }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveOrUpdateAccountSubmit = form.handleSubmit(data => {
    const fetch = async () => {
      await accountHolderProvider.saveOrUpdate([
        {
          ...data,
          isSubjectToVat: record.isSubjectToVat,
          socialCapital: toMinors(data.socialCapital),
          townCode: +data.townCode !== 0 ? +data.townCode : null,
        },
      ]);

      setTools(properties => ({ ...properties, buttonDisable: true }));
      notify('messages.global.changesSaved', { type: 'success' });
    };

    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(saveOrUpdateAccountSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <BpNumberField style={{ width: '45%' }} name='socialCapital' label='Capital Social (€)' />
        <BpFormField style={{ width: '45%' }} name='phone' label='Téléphone' />
        <BpFormField style={{ width: '45%' }} name='email' type='email' label='Email' />
        <BpFormField style={{ width: '45%' }} name='website' label='Site web' />
        <BpNumberField style={{ width: '45%' }} name='townCode' label='Code de la commune de prospection' />
        <BpFormField style={{ width: '45%' }} name='tvaNumber' label='Numéro de TVA' />
        <Button
          variant='contained'
          size='small'
          startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
          disabled={tools.isLoading || tools.buttonDisable}
          type='submit'
          name='submitCompanyInfo'
          sx={{ width: 'min-content', mt: 1 }}
        >
          Enregistrer
        </Button>
      </form>
    </FormProvider>
  );
};

export default CompanyInformationForm;
