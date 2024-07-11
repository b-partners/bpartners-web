/* eslint-disable react-hooks/exhaustive-deps */
import { Save as SaveIcon } from '@mui/icons-material';
import { Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify, useShowContext } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BP_COLOR } from '@/bp-theme';
import { BpFormField } from '@/common/components';
import { feedbackLinkResolver } from '@/common/resolvers';
import { handleSubmit } from '@/common/utils';
import { updateFeedbackLink } from '@/providers';

export const FeedbackLinkForm = () => {
  const { record: accountHolder } = useShowContext();
  const [tools, setTools] = useState({ isLoading: false, buttonDisable: true });
  const notify = useNotify();
  const form = useForm({ defaultValues: accountHolder?.feedback || { feedbackLink: null }, mode: 'all', resolver: feedbackLinkResolver });

  const onSubmit = form.handleSubmit(({ feedbackLink }) => {
    const fetch = async () => {
      setTools({ isLoading: true, buttonDisable: true });
      await updateFeedbackLink(feedbackLink);
      setTools({ isLoading: false, buttonDisable: true });
      notify('messages.global.changesSaved', { type: 'success' });
    };
    fetch().catch(() => {
      setTools({ isLoading: false, buttonDisable: false });
      notify('messages.global.error', { type: 'error' });
    });
  });

  useEffect(() => {
    form.watch(({ feedbackLink }) => {
      if (feedbackLink !== accountHolder?.feedbackLink) {
        setTools(e => ({ ...e, buttonDisable: false }));
      }
    });
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography bgcolor={BP_COLOR['solid_grey']} p={2} variant='body2' style={{ width: '45%' }}>
          Boostez votre référencement. Renseignez le lien vers votre page avis (google business, trust pilote)
        </Typography>
        <BpFormField size='small' fontSiz name='feedbackLink' label='Lien pour le feedback' style={{ width: '45%' }} />
        <Button
          variant='contained'
          size='small'
          startIcon={tools.isLoading ? <CircularProgress color='inherit' size={18} /> : <SaveIcon />}
          disabled={tools.isLoading || tools.buttonDisable}
          type='submit'
          name='submitFeedbackLink'
          sx={{ width: 'min-content', mt: 1 }}
        >
          Enregistrer
        </Button>
      </form>
    </FormProvider>
  );
};
