import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { BpMultipleTextInput } from 'src/common/components';
import { handleSubmit } from 'src/common/utils';
import { RichTextForm } from 'src/common/components/RichTextForm';
import { useModalContext } from 'src/common/store/transaction';
import { mailingProvider } from 'src/providers';
import { exportLinkMailResolver, participantValidator } from 'src/common/resolvers';
import { v4 as uuid } from 'uuid';
import { transactionMapper } from 'src/providers/mappers/transaction-mapper';
import { useNotify } from 'react-admin';
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
  const saveDraft = form.handleSubmit(data => {
    const structuredData = transactionMapper(data, id, 'DRAFT');
    handleEmailRequest(structuredData, 'draft');
  });

  return (
    <FormProvider {...form}>
      <Dialog open={isOpenModal} onClose={handleExportLinkMailModal} maxWidth='lg'>
        <DialogTitle>Envoi de mail</DialogTitle>
        <Box width='33.4vw' margin='0 24px'>
          <BpMultipleTextInput name='recipient' label='Destinataire' title='' validator={participantValidator} />
        </Box>
        <form onSubmit={handleSubmit(sendEmail)}>
          <DialogContent>
            <RichTextForm attachments={true} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center', position: 'relative' }}>
            <Button onClick={handleExportLinkMailModal} name='export-link-modal-cancel-button'>
              Annuler
            </Button>
            <Button type='button' name='export-link-modal-submit-button' onClick={handleSubmit(saveDraft)}>
              Enregistrer en brouillon
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
