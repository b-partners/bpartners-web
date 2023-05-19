import { Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { useForm } from 'react-hook-form';
import BPFormField from '../../common/components/BPFormField';
import { toMajors, toMinors } from '../../common/utils/money';
import { handleSubmit } from 'src/common/utils';
import { revenueTargetsProvider } from 'src/providers/account-holder-Provider';

const RevenueTargetForm = () => {
  const currentYear = new Date().getFullYear();

  const { record } = useShowContext();
  const form = useForm({ mode: 'all' });
  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });
  const notify = useNotify();

  const setLoading = newState => {
    setTools(properties => ({ ...properties, isLoading: newState }));
  };

  const revenueTargetDiff = (currentRevenueTarget, newRevenueTarget) => {
    if (currentRevenueTarget.amountTarget !== newRevenueTarget.amountTarget) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    // set form default value
    if (record) {
      const revenueTargets = [...(record.revenueTargets || [])];

      const filteredRevenueTargets = revenueTargets.filter(item => item.year === currentYear)[0];

      const currentRevenueTarget = filteredRevenueTargets ? { amountTarget: toMajors(filteredRevenueTargets.amountTarget) } : { amountTarget: 0 };

      form.setValue('amountTarget', currentRevenueTarget.amountTarget);
      setTools(properties => ({ ...properties, buttonDisable: revenueTargetDiff(currentRevenueTarget, form.watch()) }));
      form.watch(data => {
        const isDifferent = revenueTargetDiff(currentRevenueTarget, data);
        setTools(properties => ({ ...properties, buttonDisable: isDifferent }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRevenuTargetSubmit = form.handleSubmit(data => {
    const newRevenueTarget = { amountTarget: toMinors(data.amountTarget), year: currentYear };

    const fetch = async () => {
      await revenueTargetsProvider.update([newRevenueTarget]);
      notify('Changement enregistré', { type: 'success' });
    };
    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  });

  return (
    <form onSubmit={handleSubmit(updateRevenuTargetSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
      <BPFormField
        style={{ width: '45%' }}
        name='amountTarget'
        type='number'
        form={form}
        label='Objectif de cette année'
        InputProps={{
          startAdornment: <InputAdornment position='start'>€</InputAdornment>,
        }}
      />
      <Button
        name='submitRevenueTargets'
        variant='contained'
        size='small'
        startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
        disabled={tools.isLoading || tools.buttonDisable}
        type='submit'
        sx={{ width: 'min-content', mt: 1 }}
      >
        Enregistrer
      </Button>
    </form>
  );
};

export default RevenueTargetForm;
