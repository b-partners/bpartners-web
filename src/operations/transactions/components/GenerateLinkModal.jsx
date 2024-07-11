import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import { useModalContext } from 'src/common/store/transaction';
import { handleSubmit } from 'src/common/utils';
import { invoiceDateValidator } from 'src/operations/invoice/utils';
import { transactionProvider } from 'src/providers';

const GenerateLinkModal = ({ isOpenModal, handleGenerateLinkModal, handleExportLinkMailModal }) => {
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
      const response = await transactionProvider.saveOrUpdate(requestBody);
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
    <>
      <FormProvider {...form}>
        <Dialog open={isOpenModal} onClose={handleGenerateLinkModal} maxWidth='lg'>
          <DialogTitle>Export comptable</DialogTitle>
          <Box sx={{ ml: 3, minWidth: '45vw' }}>Choisissez votre période de transaction à communiquer à votre comptable :</Box>
          <form onSubmit={handleSubmit(generateExportLink)}>
            <DialogContent sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <BpFormField style={{ width: '45%' }} validate={e => invoiceDateValidator({ sendingDate: e })} name='from' label='De' type='date' />
              <BpFormField style={{ width: '45%' }} validate={e => invoiceDateValidator({ sendingDate: e })} name='to' label='À' type='date' />
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
    </>
  );
};

export default GenerateLinkModal;
