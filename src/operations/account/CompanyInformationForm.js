import { Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { useForm } from 'react-hook-form';
import accountProvider from 'src/providers/account-provider';
import CustomFilledInput from '../utils/CustomFilledInput';
import { phoneValidator, companyInfoDiff } from './utils';
import { toMinors, toMajors } from '../utils/money';

const CompanyInfomationForm = () => {
  const { record } = useShowContext();
  const form = useForm({ mode: 'all' });
  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });
  const notify = useNotify();

  const setLoading = newState => {
    setTools(properties => ({ ...properties, isLoading: newState }));
  };

  useEffect(() => {
    // set form default value
    if (record) {
      const currentCompanyInfo = { ...record.accountHolder.companyInfo };
      Object.keys(currentCompanyInfo).forEach(key => form.setValue(key, currentCompanyInfo[key]));
      // format social capital to majors
      form.setValue('socialCapital', toMajors(currentCompanyInfo['socialCapital']));

      setTools(properties => ({ ...properties, buttonDisable: companyInfoDiff(record.accountHolder.companyInfo, form.watch()) }));

      form.watch(data => {
        const isDifferent = companyInfoDiff(record.accountHolder.companyInfo, data);
        setTools(properties => ({ ...properties, buttonDisable: isDifferent }));
      });
    }
  }, []);

  const handleSubmit = form.handleSubmit(async data => {
    try {
      setLoading(true);
      await accountProvider.saveOrUpdate([
        { ...data, isSubjectToVat: record.isSubjectToVat, tvaNumber: record.tvaNumber, socialCapital: toMinors(data.socialCapital) },
      ]);
      notify('Changement enregistré', { type: 'success' });
    } catch (_err) {
      notify("Une erreur s'est produite", { type: 'error' });
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <CustomFilledInput style={{ width: '45%' }} name='socialCapital' type='number' form={form} label='Capital Social (€)' />
      <CustomFilledInput style={{ width: '45%' }} name='phone' type='tel' form={form} label='Téléphone' validate={phoneValidator} />
      <CustomFilledInput style={{ width: '45%' }} name='email' type='email' form={form} label='Email' />
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
  );
};

export default CompanyInfomationForm;
