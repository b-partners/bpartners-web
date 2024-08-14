import { BpFormField } from '@/common/components';
import { useModalContext } from '@/common/store/transaction';
import { handleSubmit } from '@/common/utils';
import { invoiceDateValidator } from '@/operations/invoice/utils';
import { transactionProvider } from '@/providers';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FC } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { GenerateLinkModalProps } from './types';

export const GenerateLinkModal: FC<GenerateLinkModalProps> = props => {
  const { isOpenModal, handleGenerateLinkModal, handleExportLinkMailModal } = props;
  const form = useForm({ mode: 'all' });
  const isSubmitting = form.formState.isSubmitting;
  const notify = useNotify();
  const { setDataGenerateLinkFrom } = useModalContext();

  const generateExportLink = form.handleSubmit(async data => {
    const requestBody = {
      from: new Date(data.from),
      to: new Date(data.to),
      transactionStatus: 'BOOKED',
    };
    try {
      const response = (await transactionProvider.saveOrUpdate(requestBody as unknown as any[])) as unknown as any;
      setDataGenerateLinkFrom({
        from: new Date(data.from),
        to: new Date(data.to),
        downloadLink: response.downloadLink,
      });
      handleGenerateLinkModal();
      handleExportLinkMailModal();
      return response;
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    }
  });

  return (
    <FormProvider {...form}>
      <Dialog open={isOpenModal} onClose={handleGenerateLinkModal} maxWidth='lg'>
        <DialogTitle>Export comptable</DialogTitle>
        <Box sx={{ ml: 3, minWidth: '45vw' }}>Choisissez votre période de transaction à communiquer à votre comptable :</Box>
        <form onSubmit={handleSubmit(generateExportLink)}>
          <DialogContent sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <BpFormField style={{ width: '45%' }} validate={(e: string) => invoiceDateValidator({ sendingDate: e })} name='from' label='De' type='date' />
            <BpFormField style={{ width: '45%' }} validate={(e: string) => invoiceDateValidator({ sendingDate: e })} name='to' label='À' type='date' />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center', position: 'relative' }}>
            <Button onClick={handleGenerateLinkModal} name='generate-link-modal-cancel-button'>
              Annuler
            </Button>
            <Button
              type='submit'
              name='generate-link-modal-submit-button'
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress color='inherit' size={18} />}
            >
              Valider
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </FormProvider>
  );
};
