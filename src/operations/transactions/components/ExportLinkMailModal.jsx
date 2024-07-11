import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField } from 'src/common/components';
import { RichTextForm } from 'src/common/components/RichTextForm';
import { exportLinkMailResolver } from 'src/common/resolvers';
import { useModalContext } from 'src/common/store/transaction';
import { handleSubmit } from 'src/common/utils';
import { mailingProvider } from 'src/providers';
import { transactionMapper } from 'src/providers/mappers/transaction-mapper';
import { v4 as uuid } from 'uuid';
import { getExportLinkMailDefaultMessage, getExportLinkMailSubject } from '../utils';

const ExportLinkMailModal = ({ isOpenModal, handleExportLinkMailModal }) => {
  const id = uuid();
  const { dataForm } = useModalContext();
  const form = useForm({
    mode: 'all',
    defaultValues: {
      subject: getExportLinkMailSubject(dataForm),
      message: getExportLinkMailDefaultMessage(dataForm),
      attachments: [],
    },
    resolver: exportLinkMailResolver,
  });
  const { isSubmitting } = form.formState;
  const notify = useNotify();

  const handleEmailRequest = async (structuredData, status) => {
    try {
      await mailingProvider.saveOrUpdate(structuredData);
      notify(`messages.mail.${status}`, { type: 'success' });
      handleExportLinkMailModal();
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    }
  };
  const sendEmail = form.handleSubmit(async data => {
    const structuredData = transactionMapper(data, id, 'SENT');
    await handleEmailRequest(structuredData, 'sent');
  });

  return (
    <FormProvider {...form}>
      <Dialog open={isOpenModal} onClose={handleExportLinkMailModal} maxWidth='lg'>
        <DialogTitle>Envoi de mail</DialogTitle>

        <form onSubmit={handleSubmit(sendEmail)}>
          <DialogContent>
            <BpFormField style={{ width: '30rem' }} type='email' name='recipient' label='Destinataire' fullWidth />
            <RichTextForm attachments={true} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center', position: 'relative' }}>
            <Button onClick={handleExportLinkMailModal} name='export-link-modal-cancel-button'>
              Annuler
            </Button>
            <Button
              type='submit'
              name='export-link-modal-submit-button'
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

export default ExportLinkMailModal;
