/* eslint-disable react-hooks/exhaustive-deps */
import { RichTextForm } from '@/common/components';
import { invoiceRelaunchResolver as feedbackResolver } from '@/common/resolvers';
import { useInvoiceToolContext } from '@/common/store/invoice';
import { handleSubmit } from '@/common/utils';
import { feedbackProvider, getCached } from '@/providers';
import { Button, CircularProgress } from '@mui/material';
import { EditorState } from 'draft-js';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { getFeedbackDefaultMessage } from '../utils/utils';
import { InvoiceListModal } from './InvoiceListModal';

const FeedbackModal = () => {
  const notify = useNotify();
  const {
    closeModal,
    modal: { invoice },
  } = useInvoiceToolContext();
  const { name: companyName } = getCached.accountHolder() || {};
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    mode: 'all',
    defaultValues: { subject: `${companyName} -  donnez nous votre avis`, message: EditorState.createEmpty() },
    resolver: feedbackResolver,
  });

  useEffect(() => {
    form.setValue('message', getFeedbackDefaultMessage(invoice));
  }, [invoice]);

  const askFeedback = form.handleSubmit(data => {
    const fetch = async () => {
      if (invoice?.customer) {
        setIsLoading(true);
        await feedbackProvider.ask({ attachments: null, customerIds: [invoice.customer.id], ...data } as any);
        closeModal();
        setIsLoading(false);
        notify('messages.feedback.success', { type: 'success' });
      }
    };
    fetch().catch(() => notify('messages.feedback.error', { type: 'error' }));
  });

  return (
    <InvoiceListModal
      type='FEEDBACK'
      title={`Envoyer un demande d'avis à ${invoice?.customer?.firstName} ${invoice?.customer?.lastName}.`}
      actions={
        <Button
          disabled={isLoading}
          onClick={handleSubmit(askFeedback)}
          data-cy='invoice-relaunch-submit'
          startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
        >
          Envoyer la demande
        </Button>
      }
    >
      <FormProvider {...form}>
        <RichTextForm attachments={false} />
      </FormProvider>
    </InvoiceListModal>
  );
};

export default FeedbackModal;
