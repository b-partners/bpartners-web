/* eslint-disable react-hooks/exhaustive-deps */
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { handleSubmit } from 'src/common/utils';
import { feedbackProvider, getCached } from 'src/providers';
import { RichTextForm } from 'src/common/components/RichTextForm';
import { useForm, FormProvider } from 'react-hook-form';
import { invoiceRelaunchResolver as feedbackResolver } from 'src/common/resolvers';
import { getFeedbackDefaultMessage } from '../utils/utils';
import { EditorState } from 'draft-js';

const FeedbackModal = ({ invoice = null, resetInvoice }) => {
  const notify = useNotify();
  const { name: companyName } = getCached.accountHolder() || {};
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    mode: 'all',
    defaultValues: { subject: `${companyName} -  donnez nous votre avis`, message: EditorState.createEmpty() },
    resolver: feedbackResolver,
  });
  const onClose = () => {
    resetInvoice();
  };

  useEffect(() => {
    form.setValue('message', getFeedbackDefaultMessage(invoice));
  }, [invoice]);

  const askFeedback = form.handleSubmit(data => {
    const fetch = async _event => {
      if (invoice && invoice.customer) {
        setIsLoading(true);
        await feedbackProvider.ask({ attachments: null, customerIds: [invoice.customer.id], ...data });
        resetInvoice();
        setIsLoading(false);
        notify('messages.feedback.success', { type: 'success' });
      }
    };
    fetch().catch(() => notify('messages.feedback.error', { type: 'error' }));
  });

  return (
    invoice && (
      <FormProvider {...form}>
        <Dialog open={!!invoice} onClose={onClose} maxWidth='lg'>
          <DialogTitle>
            Envoyer un demande d'avis à {invoice?.customer?.firstName} {invoice?.customer?.lastName}.
          </DialogTitle>
          <DialogContent>
            <RichTextForm attachments={false} />
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'flex-end', mr: 2, alignItems: 'center' }}>
            <Button
              disabled={isLoading}
              onClick={handleSubmit(askFeedback)}
              data-cy='invoice-relaunch-submit'
              startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
            >
              Envoyer la demande
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    )
  );
};

export default FeedbackModal;
