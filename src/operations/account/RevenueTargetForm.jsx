import { Euro as EuroIcon, Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpNumberField } from '@/common/components';
import { revenueTargetResolver } from '@/common/resolvers';
import { handleSubmit } from '@/common/utils';
import { revenueTargetsProvider } from '@/providers/account-holder-Provider';
import { toMajors, toMinors } from '../../common/utils';

const RevenueTargetForm = () => {
  const currentYear = new Date().getFullYear();

  const { record } = useShowContext();
  const form = useForm({ mode: 'all', resolver: revenueTargetResolver });
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
      notify('messages.global.changesSaved', { type: 'success' });
      setTools(properties => ({ ...properties, buttonDisable: true }));
    };
    setLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setLoading(false));
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(updateRevenuTargetSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <BpNumberField style={{ width: '45%' }} name='amountTarget' label='Objectif de cette année' icon={<EuroIcon />} />
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
    </FormProvider>
  );
};

export default RevenueTargetForm;
